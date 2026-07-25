import { supabaseAdmin } from "@/lib/supabase/server";
import type { Category } from "./categories";

const TABLE = "categories";

function mapRow(row: Record<string, unknown>): Category {
  return {
    id: String(row.id),
    name_en: String(row.name_en),
    name_ar: String(row.name_ar),
    slug: String(row.slug),
    icon: String(row.icon),
    description_en: String(row.description_en ?? ""),
    description_ar: String(row.description_ar ?? ""),
    productCount: Number(row.product_count ?? 0),
  };
}

export async function getCategoriesFromSupabase(): Promise<Category[]> {
  if (!supabaseAdmin) return [];
  try {
    const { data, error } = await supabaseAdmin.from(TABLE).select("*").order("slug");
    if (error) {
      return [];
    }
    return (data ?? []).map(mapRow);
  } catch {
    return [];
  }
}

export async function getCategoryBySlugFromSupabase(slug: string): Promise<Category | null> {
  if (!supabaseAdmin) return null;
  const { data, error } = await supabaseAdmin.from(TABLE).select("*").eq("slug", slug).single();
  if (error || !data) return null;
  return mapRow(data);
}
