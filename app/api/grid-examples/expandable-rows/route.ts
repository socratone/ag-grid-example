import type { OrdersResponse } from "@/app/examples/expandable-rows/types";

const response: OrdersResponse = {
  rows: [
    {
      id: "group-aurora",
      orderNumber: "BATCH-2408-01",
      customer: "Aurora Retail",
      product: "Office setup",
      status: "Processing",
      amount: 18450,
      orderedAt: "2026-08-08",
      children: [
        {
          id: "order-240801",
          orderNumber: "ORD-240801",
          customer: "Aurora Retail",
          product: "Ergonomic chair",
          status: "Delivered",
          amount: 7200,
          orderedAt: "2026-08-08",
        },
        {
          id: "order-240802",
          orderNumber: "ORD-240802",
          customer: "Aurora Retail",
          product: "Standing desk",
          status: "Processing",
          amount: 8250,
          orderedAt: "2026-08-08",
        },
        {
          id: "order-240803",
          orderNumber: "ORD-240803",
          customer: "Aurora Retail",
          product: "Monitor arm",
          status: "Shipped",
          amount: 3000,
          orderedAt: "2026-08-09",
        },
      ],
    },
    {
      id: "group-nova",
      orderNumber: "BATCH-2408-02",
      customer: "Nova Studio",
      product: "Design equipment",
      status: "Shipped",
      amount: 12680,
      orderedAt: "2026-08-07",
      children: [
        {
          id: "order-240804",
          orderNumber: "ORD-240804",
          customer: "Nova Studio",
          product: "Pen display",
          status: "Shipped",
          amount: 8980,
          orderedAt: "2026-08-07",
        },
        {
          id: "order-240805",
          orderNumber: "ORD-240805",
          customer: "Nova Studio",
          product: "Color calibrator",
          status: "Delivered",
          amount: 3700,
          orderedAt: "2026-08-07",
        },
      ],
    },
    {
      id: "group-harbor",
      orderNumber: "BATCH-2408-03",
      customer: "Harbor Works",
      product: "Meeting room kit",
      status: "Delivered",
      amount: 9720,
      orderedAt: "2026-08-05",
      children: [
        {
          id: "order-240806",
          orderNumber: "ORD-240806",
          customer: "Harbor Works",
          product: "Conference camera",
          status: "Delivered",
          amount: 6480,
          orderedAt: "2026-08-05",
        },
        {
          id: "order-240807",
          orderNumber: "ORD-240807",
          customer: "Harbor Works",
          product: "Speakerphone",
          status: "Delivered",
          amount: 3240,
          orderedAt: "2026-08-05",
        },
      ],
    },
  ],
};

export const dynamic = "force-static";

export async function GET() {
  return Response.json(response);
}
