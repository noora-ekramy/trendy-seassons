import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, query, queryAll, queryOne } from "@/lib/db";
import { orders } from "@/lib/data/orders";

function mapDbOrder(row: Record<string, unknown>, items: {
  product_id?: string;
  product_name?: string;
  quantity?: number;
  unit_price?: number;
}[] = []) {
  return {
    id: row.id,
    customerName: row.customer_name ?? "",
    customerEmail: "",
    phone: row.phone ?? "",
    status: row.status ?? "pending",
    total: Number(row.total ?? 0),
    items: items.map((i) => ({
      productId: i.product_id,
      name: i.product_name ?? "",
      quantity: i.quantity ?? 1,
      price: Number(i.unit_price ?? 0),
    })),
    createdAt: row.created_at ?? "",
    date: row.created_at ?? "",
    shippingAddress: row.address ?? "",
    paymentMethod: row.payment_method ?? "",
  };
}

export async function GET() {
  if (isDatabaseConfigured()) {
    try {
      const rows = await queryAll(`SELECT * FROM orders ORDER BY created_at DESC`);
      if (rows.length > 0) {
        const mapped = await Promise.all(
          rows.map(async (row) => {
            const items = await queryAll(
              `SELECT product_id, product_name, quantity, unit_price
               FROM order_items WHERE order_id = $1`,
              [row.id]
            );
            return mapDbOrder(row, items);
          })
        );
        return NextResponse.json(mapped);
      }
    } catch (e) {
      console.error("[orders GET]", e);
    }
  }
  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();
  const order = await queryOne(
    `INSERT INTO orders (customer_name, phone, address, payment_method, total, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      body.customerName ?? body.customer_name ?? "",
      body.phone ?? "",
      body.shippingAddress ?? body.address ?? "",
      body.paymentMethod ?? body.payment_method ?? "",
      Number(body.total ?? 0),
      body.status ?? "pending",
    ]
  );

  if (!order) return NextResponse.json({ error: "Failed to create order" }, { status: 400 });

  const items = (body.items ?? []) as {
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }[];

  for (const item of items) {
    await query(
      `INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        order.id,
        item.productId || null,
        item.name ?? "",
        item.quantity ?? 1,
        Number(item.price ?? 0),
      ]
    );
  }

  return NextResponse.json(mapDbOrder(order, items.map((i) => ({
    product_id: i.productId,
    product_name: i.name,
    quantity: i.quantity,
    unit_price: i.price,
  }))), { status: 201 });
}
