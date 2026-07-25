import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { isDatabaseConfigured, query, queryOne } from "@/lib/db";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminRequest(request)) return unauthorizedResponse();
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ success: true, note: "Local order — status change is visual only" });
  }

  const body = await request.json();
  const row = await queryOne(
    `UPDATE orders SET
      status = COALESCE($1, status),
      customer_name = COALESCE($2, customer_name),
      phone = COALESCE($3, phone),
      address = COALESCE($4, address),
      payment_method = COALESCE($5, payment_method),
      total = COALESCE($6, total)
    WHERE id = $7
    RETURNING *`,
    [
      body.status ?? null,
      body.customer_name ?? body.customerName ?? null,
      body.phone ?? null,
      body.address ?? body.shippingAddress ?? null,
      body.payment_method ?? body.paymentMethod ?? null,
      body.total !== undefined ? Number(body.total) : null,
      id,
    ]
  );

  if (!row) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json(row);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminRequest(request)) return unauthorizedResponse();
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ success: true, note: "Local order removed from view" });
  }

  await query(`DELETE FROM orders WHERE id = $1`, [id]);
  return NextResponse.json({ success: true });
}
