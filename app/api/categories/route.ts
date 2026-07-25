import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { isDatabaseConfigured, queryOne, queryAll } from "@/lib/db";
import { getCategoriesFromDb } from "@/lib/data/pg-categories";
import { categories } from "@/lib/data/categories";

export async function GET() {
  if (isDatabaseConfigured()) {
    const data = await getCategoriesFromDb();
    if (data.length > 0) return NextResponse.json(data);
  }
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  if (!verifyAdminRequest(request)) return unauthorizedResponse();
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();
  const row = await queryOne(
    `INSERT INTO categories (name_en, name_ar, slug, icon, description_en, description_ar, product_count)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      body.name_en || "",
      body.name_ar || "",
      body.slug || "",
      body.icon || "Leaf",
      body.description_en || "",
      body.description_ar || "",
      Number(body.product_count || 0),
    ]
  );

  if (!row) return NextResponse.json({ error: "Insert failed" }, { status: 400 });
  return NextResponse.json(row, { status: 201 });
}
