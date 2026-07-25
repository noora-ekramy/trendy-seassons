import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { isDatabaseConfigured, query, queryAll, queryOne } from "@/lib/db";

async function getBuildWithProducts(id: string) {
  const build = await queryOne(`SELECT * FROM builds WHERE id = $1`, [id]);
  if (!build) return null;
  const products = await queryAll(
    `SELECT p.* FROM build_products bp
     JOIN products p ON p.id = bp.product_id
     WHERE bp.build_id = $1
     ORDER BY bp.sort_order`,
    [id]
  );
  return { ...build, products };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const build = await getBuildWithProducts(id);
  if (!build) return NextResponse.json({ error: "Build not found" }, { status: 404 });
  return NextResponse.json(build);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminRequest(request)) return unauthorizedResponse();
  const { id } = await params;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();
  const { name_en, name_ar, description_en, description_ar, price, tier, image, product_ids } = body;

  const build = await queryOne(
    `UPDATE builds SET
       name_en = COALESCE($2, name_en),
       name_ar = COALESCE($3, name_ar),
       description_en = COALESCE($4, description_en),
       description_ar = COALESCE($5, description_ar),
       price = COALESCE($6, price),
       tier = COALESCE($7, tier),
       image = COALESCE($8, image),
       updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      name_en != null ? String(name_en).trim() : null,
      name_ar != null ? String(name_ar).trim() : null,
      description_en != null ? String(description_en).trim() || null : null,
      description_ar != null ? String(description_ar).trim() || null : null,
      price != null ? Number(price) : null,
      tier != null && ["budget", "mid", "high"].includes(tier) ? tier : null,
      image != null ? String(image).trim() || null : null,
    ]
  );

  if (!build) {
    return NextResponse.json({ error: "Build not found" }, { status: 404 });
  }

  if (Array.isArray(product_ids)) {
    await query(`DELETE FROM build_products WHERE build_id = $1`, [id]);
    for (let i = 0; i < product_ids.length; i++) {
      if (!product_ids[i]) continue;
      await query(
        `INSERT INTO build_products (build_id, product_id, sort_order) VALUES ($1,$2,$3)
         ON CONFLICT DO NOTHING`,
        [id, product_ids[i], i]
      );
    }
  }

  const full = await getBuildWithProducts(id);
  return NextResponse.json(full ?? build);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminRequest(request)) return unauthorizedResponse();
  const { id } = await params;
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  await query(`DELETE FROM builds WHERE id = $1`, [id]);
  return NextResponse.json({ ok: true });
}
