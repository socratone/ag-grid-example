import type { ChildOrdersResponse } from "@/app/examples/lazy-expandable-rows/types";

import { orderGroups } from "../../data";

export async function GET(
  _request: Request,
  context: RouteContext<
    "/api/grid-examples/lazy-expandable-rows/[parentId]/children"
  >,
) {
  const { parentId } = await context.params;
  const group = orderGroups.find((candidate) => candidate.id === parentId);

  if (!group) {
    return Response.json({ message: "주문 그룹을 찾을 수 없습니다." }, { status: 404 });
  }

  const response: ChildOrdersResponse = { rows: group.children };

  return Response.json(response);
}
