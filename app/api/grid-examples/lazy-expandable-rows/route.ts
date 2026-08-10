import type { ParentOrdersResponse } from "@/app/examples/lazy-expandable-rows/types";

import { orderGroups } from "./data";

// 최초 목록 API에는 children을 포함하지 않아 자식 데이터가 미리 전송되지 않게 한다.
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
