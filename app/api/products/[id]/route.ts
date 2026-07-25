import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { isDatabaseConfigured, query, queryAll, queryOne } from "@/lib/db";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getProductImages(productId: string): Promise<string[]> {
  const rows = await queryAll<{ image_url: string }>(
    `SELECT image_url FROM product_images WHERE product_id = $1 ORDER BY display_order`,
    [productId]
  );
  return rows.map((r) => r.image_url);
}

function mapDbRow(row: Record<string, unknown>, images: string[]) {
  return {
    id: row.id,
    name_en: row.name_en ?? row.name ?? "",
    name_ar: row.name_ar ?? row.name ?? "",
    description_en: row.description_en ?? row.description ?? "",
    description_ar: row.description_ar ?? row.description ?? "",
    price: Number(row.price ?? 0),
    comparePrice: row.compare_price != null ? Number(row.compare_price) : undefined,
    images,
    categoryId: row.category_id ?? null,
    brand: row.brand ?? "",
    brandId: row.brand_id ?? null,
    stock: Number(row.stock ?? 0),
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    specs: (row.specs as Record<string, string>) ?? {},
    isDeal: row.is_deal ?? false,
    discountPercent: Number(row.discount_percent ?? 0),
    createdAt: row.created_at ?? "",
    condition: row.condition ?? "new",
    available: row.available ?? true,
  };
}

async function syncImages(productId: string, images: string[]) {
  await query(`DELETE FROM product_images WHERE product_id = $1`, [productId]);
  for (let i = 0; i < images.length; i++) {
    await query(
      `INSERT INTO product_images (product_id, image_url, display_order, is_primary)
       VALUES ($1, $2, $3, $4)`,
      [productId, images[i], i, i === 0]
    );
  }
  await query(`UPDATE products SET image_url = $1 WHERE id = $2`, [
    images[0] || null,
    productId,
  ]);
}

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

  const nameEn = body.name_en;
  const nameAr = body.name_ar;
  const descEn = body.description_en;
  const descAr = body.description_ar;
  const price = body.price !== undefined ? Number(body.price) : undefined;
  const brand = body.brand;
  const stock = body.stock !== undefined ? Number(body.stock) : undefined;
  const condition = body.condition;
  const categoryId = body.category_id;
  const comparePrice = body.compare_price !== undefined ? body.compare_price : undefined;
  const isDeal = body.is_deal;
  const discountPercent = body.discount_percent;
  const specs = body.specs;

  // Non-UUID local mock IDs → insert as new DB product
  if (!UUID_RE.test(id)) {
    const product = await queryOne(
      `INSERT INTO products (
        name, name_en, name_ar, description, description_en, description_ar,
        price, brand, stock, condition, available, category_id, compare_price,
        is_deal, discount_percent, specs
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb
      ) RETURNING *`,
      [
        nameEn || "",
        nameEn || "",
        nameAr || "",
        descEn || "",
        descEn || "",
        descAr || "",
        price ?? 0,
        brand || "",
        stock ?? 0,
        condition || "new",
        (stock ?? 0) > 0,
        categoryId || null,
        comparePrice != null ? Number(comparePrice) : null,
        isDeal ?? false,
        Number(discountPercent || 0),
        JSON.stringify(specs || {}),
      ]
    );
    if (!product) return NextResponse.json({ error: "Insert failed" }, { status: 400 });
    if (Array.isArray(body.images)) await syncImages(String(product.id), body.images);
    const images = await getProductImages(String(product.id));
    return NextResponse.json(mapDbRow(product, images), { status: 201 });
  }

  const product = await queryOne(
    `UPDATE products SET
      name = COALESCE($1, name),
      name_en = COALESCE($1, name_en),
      name_ar = COALESCE($2, name_ar),
      description = COALESCE($3, description),
      description_en = COALESCE($3, description_en),
      description_ar = COALESCE($4, description_ar),
      price = COALESCE($5, price),
      brand = COALESCE($6, brand),
      stock = COALESCE($7, stock),
      available = COALESCE($8, available),
      condition = COALESCE($9, condition),
      category_id = COALESCE($10, category_id),
      compare_price = COALESCE($11, compare_price),
      is_deal = COALESCE($12, is_deal),
      discount_percent = COALESCE($13, discount_percent),
      specs = COALESCE($14::jsonb, specs)
    WHERE id = $15
    RETURNING *`,
    [
      nameEn ?? null,
      nameAr ?? null,
      descEn ?? null,
      descAr ?? null,
      price ?? null,
      brand ?? null,
      stock ?? null,
      stock !== undefined ? stock > 0 : null,
      condition ?? null,
      categoryId ?? null,
      comparePrice != null ? Number(comparePrice) : null,
      isDeal ?? null,
      discountPercent !== undefined ? Number(discountPercent) : null,
      specs !== undefined ? JSON.stringify(specs) : null,
      id,
    ]
  );

  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  if (Array.isArray(body.images)) await syncImages(id, body.images);
  const images = await getProductImages(id);
  return NextResponse.json(mapDbRow(product, images));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminRequest(_request)) return unauthorizedResponse();
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const { id } = await params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ success: true, note: "Local product removed from view" });
  }

  await query(`DELETE FROM products WHERE id = $1`, [id]);
  return NextResponse.json({ success: true });
}
