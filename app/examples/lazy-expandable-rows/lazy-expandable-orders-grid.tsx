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
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const parentsQuery = useQuery({
    queryKey: ["grid-example", "lazy-expandable-orders", "parents"],
    queryFn: fetchParentOrders,
  });

  const parents = useMemo(
    () => parentsQuery.data?.rows ?? [],
    [parentsQuery.data],
  );
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

  const childQueriesByParentId = useMemo(
    () =>
      new Map(
        parents.map((parent, index) => [parent.id, childQueries[index]]),
      ),
    [childQueries, parents],
  );

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
