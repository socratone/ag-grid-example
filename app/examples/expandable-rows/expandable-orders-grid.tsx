"use client";

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

const modules = [AllCommunityModule];

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

async function fetchOrders(): Promise<OrdersResponse> {
  const response = await fetch("/api/grid-examples/expandable-rows");

  if (!response.ok) {
    throw new Error("주문 데이터를 불러오지 못했습니다.");
  }

  return response.json() as Promise<OrdersResponse>;
}

const ExpandableOrdersGrid = () => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const ordersQuery = useQuery({
    queryKey: ["grid-example", "expandable-orders"],
    queryFn: fetchOrders,
  });

  const parentsById = useMemo(
    () =>
      new Map(
        (ordersQuery.data?.rows ?? []).map((parent) => [parent.id, parent]),
      ),
    [ordersQuery.data],
  );

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
          if (!params.data || params.data.rowType === "child") {
            return null;
          }

          const parent = parentsById.get(params.data.id) as
            | ParentOrderRow
            | undefined;
          const isExpanded = expandedIds.has(params.data.id);

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
        valueFormatter: ({ value }) => currencyFormatter.format(value ?? 0),
      },
      { field: "orderedAt", headerName: "Ordered at", minWidth: 135 },
    ],
    [expandedIds, parentsById],
  );

  if (ordersQuery.isPending) {
    return (
      <div className="grid h-140 place-content-center rounded-lg border border-slate-200 text-slate-600">
        주문 데이터를 불러오는 중입니다…
      </div>
    );
  }

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

  return (
    <AgGridProvider modules={modules}>
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
    </AgGridProvider>
  );
};

export default ExpandableOrdersGrid;
