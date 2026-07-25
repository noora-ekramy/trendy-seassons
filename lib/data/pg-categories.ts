import { isDatabaseConfigured, queryAll, queryOne } from "@/lib/db";
import type { Category } from "./categories";

function mapRow(row: Record<string, unknown>): Category {
  return {
    id: String(row.id),
    name_en: String(row.name_en ?? ""),
    name_ar: String(row.name_ar ?? ""),
    slug: String(row.slug ?? ""),
    icon: String(row.icon ?? "Leaf"),
    description_en: String(row.description_en ?? ""),
    description_ar: String(row.description_ar ?? ""),
    productCount: Number(row.product_count ?? 0),
  };
}

export async function getCategoriesFromDb(): Promise<Category[]> {
  if (!isDatabaseConfigured()) return [];
  try {
    const rows = await queryAll(`SELECT * FROM categories ORDER BY slug ASC`);
    return rows.map(mapRow);
  } catch (e) {
    console.error("[pg-categories]", e);
    return [];
  }
}

export async function getCategoryBySlugFromDb(slug: string): Promise<Category | null> {
  if (!isDatabaseConfigured()) return null;
  const row = await queryOne(`SELECT * FROM categories WHERE slug = $1`, [slug]);
  return row ? mapRow(row) : null;
}
