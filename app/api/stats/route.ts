import { NextResponse } from "next/server";
import { isDatabaseConfigured, queryOne, queryAll } from "@/lib/db";
import { products } from "@/lib/data/products";
import { orders } from "@/lib/data/orders";

export async function GET() {
  if (isDatabaseConfigured()) {
    try {
      const prod = await queryOne<{ count: string }>(`SELECT COUNT(*)::text AS count FROM products`);
      const ord = await queryOne<{ count: string }>(`SELECT COUNT(*)::text AS count FROM orders`);
      const orderRows = await queryAll<{ total: string; status: string }>(
        `SELECT total, status FROM orders`
      );

      const dbProductCount = Number(prod?.count ?? 0);
      const dbOrderCount = Number(ord?.count ?? 0);
      const totalRevenue = orderRows
        .filter((o) => o.status === "delivered")
        .reduce((sum, o) => sum + Number(o.total), 0);

      return NextResponse.json({
        totalRevenue,
        ordersToday: orderRows.length,
        totalProducts: dbProductCount,
        totalOrders: dbOrderCount,
        source: "neon",
      });
    } catch (e) {
      console.error("[stats]", e);
    }
  }

  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.total, 0);

  return NextResponse.json({
    totalRevenue,
    ordersToday: orders.filter((o) => o.status === "pending" || o.status === "processing").length,
    totalProducts: products.length,
    totalOrders: orders.length,
    source: "local",
  });
}
