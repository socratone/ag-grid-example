export type OrderRow = {
  id: string;
  orderNumber: string;
  customer: string;
  product: string;
  status: "Processing" | "Shipped" | "Delivered";
  amount: number;
  orderedAt: string;
};

export type ParentOrderRow = OrderRow & {
  children: OrderRow[];
};

export type OrdersResponse = {
  rows: ParentOrderRow[];
};

export type GridOrderRow = OrderRow & {
  rowType: "parent" | "child";
  parentId?: string;
};
