import type { Metadata } from "next";

import LazyExpandableOrdersGrid from "./lazy-expandable-orders-grid";

export const metadata: Metadata = {
  title: "Lazy Expandable Rows | AG Grid Examples",
  description: "확장할 때 자식 행을 API로 조회하는 AG Grid 예제",
};

const LazyExpandableRowsPage = () => {
  return (
    <main className="min-h-screen w-full p-6">
      <LazyExpandableOrdersGrid />
    </main>
  );
};

export default LazyExpandableRowsPage;
