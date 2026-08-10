import type { Metadata } from "next";

import ExpandableOrdersGrid from "./expandable-orders-grid";

export const metadata: Metadata = {
  title: "Expandable Rows | AG Grid Examples",
  description: "TanStack Query와 AG Grid를 사용한 확장 행 예제",
};

const ExpandableRowsPage = () => {
  return (
    <main className="min-h-screen w-full p-6">
      <ExpandableOrdersGrid />
    </main>
  );
};

export default ExpandableRowsPage;
