import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { isDatabaseConfigured, query, queryOne } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminRequest(request)) return unauthorizedResponse();
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id } = await params;
  const body = await request.json();
  const row = await queryOne(
    `UPDATE categories SET
      name_en = COALESCE($1, name_en),
      name_ar = COALESCE($2, name_ar),
      slug = COALESCE($3, slug),
      icon = COALESCE($4, icon),
      description_en = COALESCE($5, description_en),
      description_ar = COALESCE($6, description_ar),
      product_count = COALESCE($7, product_count)
    WHERE id = $8
    RETURNING *`,
    [
      body.name_en ?? null,
      body.name_ar ?? null,
      body.slug ?? null,
      body.icon ?? null,
      body.description_en ?? null,
      body.description_ar ?? null,
      body.product_count !== undefined ? Number(body.product_count) : null,
      id,
    ]
  );

  if (!row) return NextResponse.json({ error: "Category not found" }, { status: 404 });
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
  await query(`DELETE FROM categories WHERE id = $1`, [id]);
  return NextResponse.json({ success: true });
}
