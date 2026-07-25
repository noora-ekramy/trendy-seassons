import { isDatabaseConfigured, queryAll, queryOne } from "@/lib/db";
import type { Product } from "./products";

type ProductRow = Record<string, unknown>;

async function imagesForProducts(ids: string[]): Promise<Record<string, string[]>> {
  if (ids.length === 0) return {};
  const rows = await queryAll<{ product_id: string; image_url: string }>(
    `SELECT product_id, image_url FROM product_images
     WHERE product_id = ANY($1::uuid[])
     ORDER BY display_order ASC`,
    [ids]
  );
  const map: Record<string, string[]> = {};
  for (const r of rows) {
    if (!map[r.product_id]) map[r.product_id] = [];
    map[r.product_id].push(r.image_url);
  }
  return map;
}

function mapRow(row: ProductRow, images: string[]): Product {
  return {
    id: String(row.id),
    name_en: String(row.name_en ?? ""),
    name_ar: String(row.name_ar ?? ""),
    description_en: String(row.description_en ?? ""),
    description_ar: String(row.description_ar ?? ""),
    price: Number(row.price ?? 0),
    comparePrice: row.compare_price != null ? Number(row.compare_price) : undefined,
    images:
      images.length > 0
        ? images
        : row.image_url
          ? [String(row.image_url)]
          : [],
    categoryId: row.category_id ? String(row.category_id) : "",
    brand: String(row.brand ?? ""),
    stock: Number(row.stock ?? 0),
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    specs: (row.specs as Record<string, string>) ?? {},
    isDeal: Boolean(row.is_deal),
    discountPercent: Number(row.discount_percent ?? 0),
    createdAt: String(row.created_at ?? ""),
  };
}

async function withImages(rows: ProductRow[]): Promise<Product[]> {
  const ids = rows.map((r) => String(r.id));
  const byId = await imagesForProducts(ids);
  return rows.map((row) => mapRow(row, byId[String(row.id)] ?? []));
}

export async function getProductsFromDb(): Promise<Product[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    const rows = await queryAll(`SELECT * FROM products ORDER BY created_at DESC`);
    return withImages(rows);
  } catch (e) {
    console.error("[pg-products]", e);
    return [];
  }
}

export async function getProductByIdFromDb(id: string): Promise<Product | null> {
  if (!isDatabaseConfigured()) return null;
  const row = await queryOne(`SELECT * FROM products WHERE id = $1`, [id]);
  if (!row) return null;
  const [product] = await withImages([row]);
  return product ?? null;
}

export async function getDealProductsFromDb(): Promise<Product[]> {
  if (!isDatabaseConfigured()) return [];
  const rows = await queryAll(`SELECT * FROM products WHERE is_deal = true ORDER BY created_at DESC`);
  return withImages(rows);
}

export async function getProductsByCategoryFromDb(categoryId: string): Promise<Product[]> {
  if (!isDatabaseConfigured()) return [];
  const rows = await queryAll(
    `SELECT * FROM products WHERE category_id = $1 ORDER BY created_at DESC`,
    [categoryId]
  );
  return withImages(rows);
}
