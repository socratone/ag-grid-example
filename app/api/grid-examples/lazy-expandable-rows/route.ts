import type { ParentOrdersResponse } from "@/app/examples/lazy-expandable-rows/types";

import { orderGroups } from "./data";

const response: ParentOrdersResponse = {
  rows: orderGroups.map((group) => ({
    id: group.id,
    orderNumber: group.orderNumber,
    customer: group.customer,
    product: group.product,
    status: group.status,
    amount: group.amount,
    orderedAt: group.orderedAt,
    hasChildren: group.hasChildren,
  })),
};

export const dynamic = "force-static";

export async function GET() {
  return Response.json(response);
}
