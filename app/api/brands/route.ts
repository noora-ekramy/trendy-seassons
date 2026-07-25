import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { isDatabaseConfigured, queryAll, queryOne } from "@/lib/db";

export async function GET() {
  if (isDatabaseConfigured()) {
    try {
      const brands = await queryAll(`SELECT * FROM brands ORDER BY name ASC`);
      if (brands.length > 0) return NextResponse.json(brands);

      const productBrands = await queryAll<{ brand: string }>(
        `SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND brand <> '' ORDER BY brand`
      );
      return NextResponse.json(productBrands.map((b) => ({ name: b.brand })));
    } catch (e) {
      console.error("[brands GET]", e);
    }
  }
  return NextResponse.json([]);
}

export async function POST(request: NextRequest) {
  if (!verifyAdminRequest(request)) return unauthorizedResponse();
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();
  const row = await queryOne(
    `INSERT INTO brands (name, description) VALUES ($1, $2)
     ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description
     RETURNING *`,
    [body.name, body.description || ""]
  );

  if (!row) return NextResponse.json({ error: "Insert failed" }, { status: 400 });
  return NextResponse.json(row, { status: 201 });
}
