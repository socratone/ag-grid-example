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
  hasChildren: boolean;
};

export type ParentOrdersResponse = {
  rows: ParentOrderRow[];
};

export type ChildOrdersResponse = {
  rows: OrderRow[];
};

export type GridOrderRow = OrderRow & {
  rowType: "parent" | "child";
  parentId?: string;
};
