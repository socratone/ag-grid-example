import type { Metadata } from "next";

import ExpandableOrdersGrid from "./expandable-orders-grid";

export const metadata: Metadata = {
  title: "Expandable Rows | AG Grid Examples",
  description: "TanStack Query와 AG Grid를 사용한 확장 행 예제",
};

export default function ExpandableRowsPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-8">
      <section
        className="mx-auto max-w-6xl"
        aria-labelledby="page-title"
      >
        <div className="mb-6">
          <p className="text-sm font-medium text-blue-600">AG Grid example</p>
          <h1
            id="page-title"
            className="mt-1 text-3xl font-semibold text-slate-900"
          >
            Expandable order rows
          </h1>
          <p className="mt-2 text-slate-600">
            TanStack Query로 가져온 주문 데이터입니다. 왼쪽의 버튼을 눌러
            묶음에 포함된 주문들을 확인하세요.
          </p>
        </div>
        <ExpandableOrdersGrid />
      </section>
    </main>
  );
}
