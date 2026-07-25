import { NextRequest, NextResponse } from "next/server";
import { verifyAdminRequest, unauthorizedResponse } from "@/lib/admin-auth";
import { isDatabaseConfigured, query, queryAll, queryOne } from "@/lib/db";
import { getProductsFromDb } from "@/lib/data/pg-products";
import { products } from "@/lib/data/products";

function mapDbRowToProduct(row: Record<string, unknown>, images: string[] = []) {
  const imgs =
    images.length > 0
      ? images
      : Array.isArray(row.images)
        ? row.images.map(String)
        : row.image_url
          ? [String(row.image_url)]
          : [];

  return {
    id: row.id,
    name_en: row.name_en ?? row.name ?? "",
    name_ar: row.name_ar ?? row.name ?? "",
    description_en: row.description_en ?? row.description ?? "",
    description_ar: row.description_ar ?? row.description ?? "",
    price: Number(row.price ?? 0),
    comparePrice: row.compare_price != null ? Number(row.compare_price) : undefined,
    images: imgs,
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
    available: row.available ?? true,
  };
}

export async function GET() {
  if (isDatabaseConfigured()) {
    const data = await getProductsFromDb();
    if (data.length > 0) return NextResponse.json(data);
  }
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  if (!verifyAdminRequest(request)) return unauthorizedResponse();
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  const body = await request.json();
  const nameEn = body.name_en || body.name || "";
  const nameAr = body.name_ar || body.name || "";
  const descEn = body.description_en || body.description || "";
  const descAr = body.description_ar || body.description || "";
  const stock = Number(body.stock || 0);

  const product = await queryOne(
    `INSERT INTO products (
      name, name_en, name_ar, description, description_en, description_ar,
      price, brand, stock, available, category_id, compare_price,
      is_deal, discount_percent, specs
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15::jsonb
    ) RETURNING *`,
    [
      nameEn,
      nameEn,
      nameAr,
      descEn,
      descEn,
      descAr,
      Number(body.price || 0),
      body.brand || "",
      stock,
      stock > 0,
      body.category_id || null,
      body.compare_price != null ? Number(body.compare_price) : null,
      body.is_deal ?? false,
      Number(body.discount_percent || 0),
      JSON.stringify(body.specs || {}),
    ]
  );

  if (!product) {
    return NextResponse.json({ error: "Failed to create product" }, { status: 400 });
  }

  const images = (body.images as string[]) || [];
  if (images.length > 0) {
    for (let i = 0; i < images.length; i++) {
      await query(
        `INSERT INTO product_images (product_id, image_url, display_order, is_primary)
         VALUES ($1, $2, $3, $4)`,
        [product.id, images[i], i, i === 0]
      );
    }
    await query(`UPDATE products SET image_url = $1 WHERE id = $2`, [images[0], product.id]);
  }

  const imgRows = await queryAll<{ image_url: string }>(
    `SELECT image_url FROM product_images WHERE product_id = $1 ORDER BY display_order`,
    [product.id]
  );

  return NextResponse.json(
    mapDbRowToProduct(product, imgRows.map((r) => r.image_url)),
    { status: 201 }
  );
}
