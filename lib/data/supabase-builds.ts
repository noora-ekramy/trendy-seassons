import { supabaseAdmin } from "@/lib/supabase/server";

export interface BuildProduct {
  productId: string;
  product_id: string;
  name_en: string;
  name_ar: string;
  price: number;
  quantity: number;
  sort_order: number;
}

export interface BuildFromDb {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  tier: "budget" | "mid" | "high";
  image: string | null;
  created_at: string;
  products: BuildProduct[];
}

export async function getBuildsFromSupabase(): Promise<BuildFromDb[]> {
  if (!supabaseAdmin) return [];
  try {
    const { data: builds, error } = await supabaseAdmin
      .from("builds")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !builds?.length) return [];

    const buildIds = builds.map((b) => b.id);
    const { data: items } = await supabaseAdmin
      .from("build_products")
      .select("build_id, product_id, quantity, sort_order")
      .in("build_id", buildIds);

    const productIds = [...new Set((items ?? []).map((i) => i.product_id))];
    if (productIds.length === 0) {
      return builds.map((b) => ({
        ...b,
        products: [],
      }));
    }

    const { data: prods } = await supabaseAdmin
      .from("products")
      .select("id, name_en, name_ar, price")
      .in("id", productIds);
    const prodMap = Object.fromEntries((prods ?? []).map((p) => [p.id, p]));

    const itemsByBuild: Record<string, { product_id: string; quantity: number; sort_order: number }[]> = {};
    for (const it of items ?? []) {
      if (!itemsByBuild[it.build_id]) itemsByBuild[it.build_id] = [];
      itemsByBuild[it.build_id].push({ product_id: it.product_id, quantity: it.quantity, sort_order: it.sort_order });
    }

    return builds.map((b) => {
      const buildItems = (itemsByBuild[b.id] ?? []).sort((a, b) => a.sort_order - b.sort_order);
      const products: BuildProduct[] = buildItems.map((it) => {
        const p = prodMap[it.product_id];
        return {
          productId: it.product_id,
          product_id: it.product_id,
          name_en: p?.name_en ?? "",
          name_ar: p?.name_ar ?? "",
          price: p ? Number(p.price) : 0,
          quantity: it.quantity,
          sort_order: it.sort_order,
        };
      });
      return {
        id: b.id,
        name_en: b.name_en,
        name_ar: b.name_ar,
        description_en: b.description_en ?? "",
        description_ar: b.description_ar ?? "",
        price: Number(b.price),
        tier: (b.tier ?? "mid") as "budget" | "mid" | "high",
        image: b.image ?? null,
        created_at: b.created_at ?? "",
        products,
      };
    });
  } catch {
    return [];
  }
}
