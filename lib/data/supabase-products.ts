import { supabaseAdmin } from "@/lib/supabase/server";
import type { Product } from "./products";

const TABLE = "products";

async function getProductImages(productId: string): Promise<string[]> {
  if (!supabaseAdmin) return [];
  const { data } = await supabaseAdmin
    .from("product_images")
    .select("image_url")
    .eq("product_id", productId)
    .order("display_order");
  return (data ?? []).map((r: { image_url: string }) => r.image_url);
}

async function fetchProductsWithImages(rows: Record<string, unknown>[]): Promise<Product[]> {
  if (rows.length === 0) return [];
  const ids = rows.map((r) => r.id as string);
  const { data: imgData } = await supabaseAdmin!
    .from("product_images")
    .select("product_id, image_url")
    .in("product_id", ids)
    .order("display_order");
  const imagesByProduct: Record<string, string[]> = {};
  for (const r of imgData ?? []) {
    const pid = r.product_id;
    if (!imagesByProduct[pid]) imagesByProduct[pid] = [];
    imagesByProduct[pid].push(r.image_url);
  }
  return rows.map((row) => {
    const imgs = imagesByProduct[row.id as string];
    const effectiveImages = imgs?.length ? imgs : (row.image_url ? [String(row.image_url)] : []);
    return mapRow(row, effectiveImages);
  });
}

function mapRow(row: Record<string, unknown>, imagesOverride?: string[]): Product {
  const images = imagesOverride ?? (
    Array.isArray(row.images) && row.images.length > 0
      ? row.images.map(String)
      : row.image_url
        ? [String(row.image_url)]
        : []
  );
  return {
    id: String(row.id),
    name_en: String(row.name_en),
    name_ar: String(row.name_ar),
    description_en: String(row.description_en ?? ""),
    description_ar: String(row.description_ar ?? ""),
    price: Number(row.price),
    comparePrice: row.compare_price ? Number(row.compare_price) : undefined,
    images,
    categoryId: String(row.category_id),
    brand: String(row.brand),
    stock: Number(row.stock ?? 0),
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    specs: (row.specs as Record<string, string>) ?? {},
    isDeal: Boolean(row.is_deal),
    discountPercent: Number(row.discount_percent ?? 0),
    createdAt: String(row.created_at ?? ""),
  };
}

export async function getProductsFromSupabase(): Promise<Product[]> {
  if (!supabaseAdmin) return [];
  try {
    const { data, error } = await supabaseAdmin.from(TABLE).select("*").order("created_at", { ascending: false });
    if (error) return [];
    return fetchProductsWithImages(data ?? []);
  } catch {
    return [];
  }
}

export async function getProductByIdFromSupabase(id: string): Promise<Product | null> {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("id", id).single();
  if (error || !data) return null;
  const images = await getProductImages(id);
  const effectiveImages = images.length > 0 ? images : (data.image_url ? [String(data.image_url)] : []);
  return mapRow(data, effectiveImages);
}

export async function getDealProductsFromSupabase(): Promise<Product[]> {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("is_deal", true);
  if (error) return [];
  return fetchProductsWithImages(data ?? []);
}

export async function getProductsByCategoryFromSupabase(categoryId: string): Promise<Product[]> {
  if (!supabaseAdmin) return [];
  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("category_id", categoryId);
  if (error) return [];
  return fetchProductsWithImages(data ?? []);
}
