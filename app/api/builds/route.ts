import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { isDatabaseConfigured, query, queryAll, queryOne } from "@/lib/db";

export async function GET() {
  if (!isDatabaseConfigured()) return NextResponse.json([]);
  try {
    const builds = await queryAll(`SELECT * FROM builds ORDER BY created_at DESC`);
    const withProducts = await Promise.all(
      builds.map(async (b) => {
        const products = await queryAll(
          `SELECT p.* FROM build_products bp
           JOIN products p ON p.id = bp.product_id
           WHERE bp.build_id = $1
           ORDER BY bp.sort_order`,
          [b.id]
        );
        return { ...b, products };
      })
    );
    return NextResponse.json(withProducts);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminRequest(request)) return unauthorizedResponse();
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { name_en, name_ar, description_en, description_ar, price, tier, image, product_ids } = body;

  if (!name_en?.trim() || !name_ar?.trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const build = await queryOne(
    `INSERT INTO builds (name_en, name_ar, description_en, description_ar, price, tier, image)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [
      name_en,
      name_ar,
      description_en || "",
      description_ar || "",
      Number(price || 0),
      tier || "mid",
      image || "",
    ]
  );

  if (!build) return NextResponse.json({ error: "Insert failed" }, { status: 400 });

  const ids = (product_ids as string[]) || [];
  for (let i = 0; i < ids.length; i++) {
    await query(
      `INSERT INTO build_products (build_id, product_id, sort_order) VALUES ($1,$2,$3)
       ON CONFLICT DO NOTHING`,
      [build.id, ids[i], i]
    );
  }

  return NextResponse.json(build, { status: 201 });
}
