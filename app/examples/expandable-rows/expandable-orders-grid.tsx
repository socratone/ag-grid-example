"use client";

// useQuery와 클릭 상태를 사용하므로 이 파일은 Client Component로 실행된다.

import { useQuery } from "@tanstack/react-query";
import {
  AllCommunityModule,
  themeQuartz,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import { AgGridProvider, AgGridReact } from "ag-grid-react";
import { useMemo, useState } from "react";

import type {
  GridOrderRow,
  OrdersResponse,
  ParentOrderRow,
} from "./types";

// 이 그리드에서 AG Grid Community의 모든 기능을 사용할 수 있도록 모듈을 등록한다.
const modules = [AllCommunityModule];

// Amount 열의 숫자를 미국 달러 형식으로 표시할 때 재사용한다.
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// 로컬 Route Handler에서 부모 행과 자식 행이 포함된 주문 데이터를 가져온다.
// HTTP 오류를 throw하면 TanStack Query가 이를 error 상태로 관리한다.
async function fetchOrders(): Promise<OrdersResponse> {
  const response = await fetch("/api/grid-examples/expandable-rows");

  if (!response.ok) {
    throw new Error("주문 데이터를 불러오지 못했습니다.");
  }

  return response.json() as Promise<OrdersResponse>;
}

const ExpandableOrdersGrid = () => {
  // 현재 펼쳐진 부모 행의 ID를 저장한다. Set을 사용해 여러 행을 동시에 펼칠 수 있다.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  // 루트 QueryClientProvider를 사용해 주문 데이터의 로딩, 오류, 캐시 상태를 관리한다.
  const ordersQuery = useQuery({
    queryKey: ["grid-example", "expandable-orders"],
    queryFn: fetchOrders,
  });

  // 셀 렌더러가 부모의 자식 존재 여부를 빠르게 확인할 수 있도록 ID 기반 Map을 만든다.
  const parentsById = useMemo(
    () =>
      new Map(
        (ordersQuery.data?.rows ?? []).map((parent) => [parent.id, parent]),
      ),
    [ordersQuery.data],
  );

  // AG Grid는 평탄한 배열을 받으므로 중첩된 API 데이터를 표시 순서대로 변환한다.
  // 닫힌 부모는 부모 행만, 열린 부모는 부모 바로 뒤에 모든 자식 행을 배치한다.
  const rowData = useMemo<GridOrderRow[]>(() => {
    return (ordersQuery.data?.rows ?? []).flatMap((parent) => {
      const parentRow: GridOrderRow = { ...parent, rowType: "parent" };

      if (!expandedIds.has(parent.id)) {
        return [parentRow];
      }

      const childRows: GridOrderRow[] = parent.children.map((child) => ({
        ...child,
        rowType: "child",
        parentId: parent.id,
      }));

      return [parentRow, ...childRows];
    });
  }, [expandedIds, ordersQuery.data]);

  // React state를 직접 변경하지 않고 새 Set을 만들어 해당 부모의 펼침 상태를 전환한다.
  const toggleExpanded = (parentId: string) => {
    setExpandedIds((current) => {
      const next = new Set(current);

      if (next.has(parentId)) {
        next.delete(parentId);
      } else {
        next.add(parentId);
      }

      return next;
    });
  };

  // 데이터 열과 맨 왼쪽의 확장 버튼 전용 열을 정의한다.
  // 확장 상태가 바뀌면 버튼의 기호와 접근성 속성이 갱신되도록 메모를 다시 계산한다.
  const columnDefs = useMemo<ColDef<GridOrderRow>[]>(
    () => [
      {
        colId: "expand",
        headerName: "",
        width: 64,
        minWidth: 64,
        maxWidth: 64,
        pinned: "left",
        lockPosition: true,
        suppressMovable: true,
        resizable: false,
        cellRenderer: (params: ICellRendererParams<GridOrderRow>) => {
          // 자식 행의 왼쪽 셀은 요구사항에 따라 비워 둔다.
          if (!params.data || params.data.rowType === "child") {
            return null;
          }

          const parent = parentsById.get(params.data.id) as
            | ParentOrderRow
            | undefined;
          const isExpanded = expandedIds.has(params.data.id);

          // 부모 행에만 +/− 버튼을 표시하고 자식이 없으면 버튼을 비활성화한다.
          return (
            <button
              type="button"
              className="grid size-7 cursor-pointer place-items-center rounded border border-slate-300 bg-white text-lg font-semibold leading-none text-blue-600 hover:border-blue-600 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-default disabled:opacity-40"
              aria-label={isExpanded ? "행 접기" : "행 펼치기"}
              aria-expanded={isExpanded}
              disabled={!parent?.children.length}
              onClick={() => toggleExpanded(params.data!.id)}
            >
              <span aria-hidden="true">{isExpanded ? "−" : "+"}</span>
            </button>
          );
        },
      },
      { field: "orderNumber", headerName: "Order", minWidth: 150 },
      { field: "customer", headerName: "Customer", minWidth: 170 },
      { field: "product", headerName: "Product", minWidth: 190 },
      { field: "status", headerName: "Status", minWidth: 130 },
      {
        field: "amount",
        headerName: "Amount",
        minWidth: 130,
        // 원본 숫자 값은 유지하면서 화면에 표시되는 문자열만 통화 형식으로 바꾼다.
        valueFormatter: ({ value }) => currencyFormatter.format(value ?? 0),
      },
      { field: "orderedAt", headerName: "Ordered at", minWidth: 135 },
    ],
    [expandedIds, parentsById],
  );

  // 첫 요청이 완료되기 전에는 그리드 대신 로딩 상태를 표시한다.
  if (ordersQuery.isPending) {
    return (
      <div className="grid h-140 place-content-center rounded-lg border border-slate-200 text-slate-600">
        주문 데이터를 불러오는 중입니다…
      </div>
    );
  }

  // 요청이 실패하면 오류 메시지와 동일한 query를 다시 실행하는 버튼을 표시한다.
  if (ordersQuery.isError) {
    return (
      <div
        className="grid h-140 place-content-center gap-3 rounded-lg border border-slate-200 text-center text-red-700"
        role="alert"
      >
        <p>{ordersQuery.error.message}</p>
        <button
          type="button"
          className="cursor-pointer rounded bg-slate-900 px-3 py-2 font-medium text-white"
          onClick={() => ordersQuery.refetch()}
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 데이터 조회가 성공하면 Community 모듈을 제공하고 실제 그리드를 렌더링한다.
  return (
    <AgGridProvider modules={modules}>
      <div className="h-140 overflow-hidden rounded-lg border border-slate-200">
        <AgGridReact<GridOrderRow>
          theme={themeQuartz}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{
            // 데이터 열은 남은 너비를 균등하게 채우고 크기만 조절할 수 있다.
            // 정렬과 필터는 부모-자식 행의 인접 순서가 깨지지 않도록 비활성화한다.
            flex: 1,
            resizable: true,
            sortable: false,
            filter: false,
          }}
          // 행이 펼쳐져 rowData가 바뀌어도 동일한 주문을 추적할 수 있게 고유 ID를 제공한다.
          getRowId={({ data }) => data.id}
          // 자식 행은 옅은 배경과 보조 색상으로 부모 행과 시각적으로 구분한다.
          getRowStyle={({ data }) =>
            data?.rowType === "child"
              ? {
                  backgroundColor: "#f8fafc",
                  color: "#526077",
                  fontWeight: 400,
                }
              : {
                  backgroundColor: "#ffffff",
                  color: "#172033",
                  fontWeight: 600,
              }
          }
          // 펼침과 접힘으로 행이 추가·제거될 때 위치 변화를 애니메이션한다.
          animateRows
          // 셀 자체의 포커스 테두리는 숨기고 확장 버튼 포커스는 그대로 유지한다.
          suppressCellFocus
        />
      </div>
    </AgGridProvider>
  );
};

export default ExpandableOrdersGrid;
