"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import {
  themeQuartz,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useMemo, useState } from "react";

import type {
  ChildOrdersResponse,
  GridOrderRow,
  ParentOrdersResponse,
} from "./types";

// Amount 열의 숫자를 미국 달러 형식으로 표시할 때 재사용한다.
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

async function fetchParentOrders(): Promise<ParentOrdersResponse> {
  const response = await fetch("/api/grid-examples/lazy-expandable-rows");

  if (!response.ok) {
    throw new Error("주문 데이터를 불러오지 못했습니다.");
  }

  return response.json() as Promise<ParentOrdersResponse>;
}

// 부모 ID를 URL에 포함해 해당 그룹의 자식 행만 요청한다.
// AbortSignal을 전달하면 행이 더 이상 쿼리를 구독하지 않을 때 요청을 취소할 수 있다.
async function fetchChildOrders(
  parentId: string,
  signal: AbortSignal,
): Promise<ChildOrdersResponse> {
  const response = await fetch(
    `/api/grid-examples/lazy-expandable-rows/${encodeURIComponent(parentId)}/children`,
    { signal },
  );

  if (!response.ok) {
    throw new Error("자식 주문을 불러오지 못했습니다.");
  }

  return response.json() as Promise<ChildOrdersResponse>;
}

const LazyExpandableOrdersGrid = () => {
  // 현재 펼치도록 요청한 부모 ID를 저장하며 여러 행을 동시에 펼칠 수 있다.
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  // 최초에는 children이 제외된 부모 행 목록만 조회한다.
  const parentsQuery = useQuery({
    queryKey: ["grid-example", "lazy-expandable-orders", "parents"],
    queryFn: fetchParentOrders,
  });

  const parents = useMemo(
    () => parentsQuery.data?.rows ?? [],
    [parentsQuery.data],
  );

  // 모든 부모에 안정적인 query key를 부여하되 펼쳐진 부모의 쿼리만 활성화한다.
  // 접었다가 다시 펼치면 QueryClient의 staleTime 동안 기존 children 캐시를 재사용한다.
  const childQueries = useQueries({
    queries: parents.map((parent) => ({
      queryKey: [
        "grid-example",
        "lazy-expandable-orders",
        "children",
        parent.id,
      ],
      queryFn: ({ signal }) => fetchChildOrders(parent.id, signal),
      enabled: expandedIds.has(parent.id),
    })),
  });

  // 셀 렌더러와 rowData 변환에서 부모 ID로 쿼리 상태를 빠르게 찾을 수 있게 한다.
  const childQueriesByParentId = useMemo(
    () =>
      new Map(
        parents.map((parent, index) => [parent.id, childQueries[index]]),
      ),
    [childQueries, parents],
  );

  // AG Grid는 평탄한 배열을 받으므로 조회가 끝난 children을 부모 바로 뒤에 배치한다.
  // 아직 로딩 중이거나 실패한 부모는 부모 행만 유지한다.
  const rowData = useMemo<GridOrderRow[]>(() => {
    return parents.flatMap((parent) => {
      const parentRow: GridOrderRow = { ...parent, rowType: "parent" };
      const childQuery = childQueriesByParentId.get(parent.id);

      if (!expandedIds.has(parent.id) || !childQuery?.data) {
        return [parentRow];
      }

      const childRows: GridOrderRow[] = childQuery.data.rows.map((child) => ({
        ...child,
        rowType: "child",
        parentId: parent.id,
      }));

      return [parentRow, ...childRows];
    });
  }, [childQueriesByParentId, expandedIds, parents]);

  // 최초 자식 조회가 실패한 행은 닫는 대신 같은 버튼으로 다시 요청할 수 있게 한다.
  const toggleExpanded = useCallback(
    (parentId: string) => {
      const childQuery = childQueriesByParentId.get(parentId);

      if (childQuery?.isError && !childQuery.data) {
        void childQuery.refetch();
        return;
      }

      setExpandedIds((current) => {
        const next = new Set(current);

        if (next.has(parentId)) {
          next.delete(parentId);
        } else {
          next.add(parentId);
        }

        return next;
      });
    },
    [childQueriesByParentId],
  );

  // 왼쪽 확장 열은 부모별 쿼리 상태에 따라 +, −, spinner, retry 기호를 표시한다.
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
        cellStyle: {
          display: "flex",
          alignItems: "center",
        },
        cellRenderer: (params: ICellRendererParams<GridOrderRow>) => {
          if (!params.data || params.data.rowType === "child") {
            return null;
          }

          const parent = parents.find(
            (candidate) => candidate.id === params.data!.id,
          );
          const childQuery = childQueriesByParentId.get(params.data.id);
          const isExpanded = expandedIds.has(params.data.id);
          const isInitialLoading =
            isExpanded && childQuery?.isFetching && !childQuery.data;
          const isInitialError =
            isExpanded && childQuery?.isError && !childQuery.data;
          const label = isInitialLoading
            ? "자식 행 불러오는 중"
            : isInitialError
              ? "자식 행 다시 불러오기"
              : isExpanded
                ? "행 접기"
                : "행 펼치기";

          return (
            <button
              type="button"
              className="grid size-7 cursor-pointer place-items-center rounded border border-slate-300 bg-white text-lg font-semibold leading-none text-blue-600 hover:border-blue-600 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-default disabled:opacity-40"
              aria-label={label}
              aria-expanded={isExpanded}
              disabled={!parent?.hasChildren || isInitialLoading}
              onClick={() => toggleExpanded(params.data!.id)}
            >
              {isInitialLoading ? (
                <span
                  className="size-3.5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600"
                  aria-hidden="true"
                />
              ) : (
                <span
                  className={isInitialError ? "text-red-600" : undefined}
                  aria-hidden="true"
                >
                  {isInitialError ? "!" : isExpanded ? "−" : "+"}
                </span>
              )}
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
        valueFormatter: ({ value }) => currencyFormatter.format(value ?? 0),
      },
      { field: "orderedAt", headerName: "Ordered at", minWidth: 135 },
    ],
    [childQueriesByParentId, expandedIds, parents, toggleExpanded]);

  // 부모 목록의 첫 요청 상태는 그리드 전체의 로딩 및 오류 화면으로 처리한다.
  if (parentsQuery.isPending) {
    return (
      <div className="grid h-140 place-content-center rounded-lg border border-slate-200 text-slate-600">
        주문 데이터를 불러오는 중입니다…
      </div>
    );
  }

  if (parentsQuery.isError) {
    return (
      <div
        className="grid h-140 place-content-center gap-3 rounded-lg border border-slate-200 text-center text-red-700"
        role="alert"
      >
        <p>{parentsQuery.error.message}</p>
        <button
          type="button"
          className="cursor-pointer rounded bg-slate-900 px-3 py-2 font-medium text-white"
          onClick={() => parentsQuery.refetch()}
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 자식 조회 상태는 그리드를 숨기지 않고 각 부모 행의 확장 버튼에서 처리한다.
  return (
    <div className="h-140 overflow-hidden rounded-lg border border-slate-200">
      <AgGridReact<GridOrderRow>
        theme={themeQuartz}
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={{
          flex: 1,
          resizable: true,
          sortable: false,
          filter: false,
        }}
        getRowId={({ data }) => data.id}
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
        animateRows
        suppressCellFocus
      />
    </div>
  );
};

export default LazyExpandableOrdersGrid;
