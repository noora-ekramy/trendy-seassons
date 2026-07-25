import {
  products,
  getProductById as getProductByIdLocal,
  getProductsByCategory as getProductsByCategoryLocal,
  getDealProducts as getDealProductsLocal,
} from "./products";
import { categories } from "./categories";
import type { Build } from "./builds";
import { orders } from "./orders";
import {
  getProductsFromDb,
  getProductByIdFromDb,
  getDealProductsFromDb,
  getProductsByCategoryFromDb,
} from "./pg-products";
import { getCategoriesFromDb, getCategoryBySlugFromDb } from "./pg-categories";
import { isDatabaseConfigured } from "@/lib/db";

export async function getProducts() {
  if (isDatabaseConfigured()) {
    const data = await getProductsFromDb();
    if (data.length > 0) return data;
  }
  return products;
}

export async function getProductById(id: string) {
  if (isDatabaseConfigured()) {
    const p = await getProductByIdFromDb(id);
    if (p) return p;
  }
  return getProductByIdLocal(id) ?? null;
}

export async function getProductsByCategory(categoryId: string) {
  if (isDatabaseConfigured()) {
    const data = await getProductsByCategoryFromDb(categoryId);
    if (data.length > 0) return data;
  }
  return getProductsByCategoryLocal(categoryId);
}

export async function getDealProducts() {
  if (isDatabaseConfigured()) {
    const data = await getDealProductsFromDb();
    if (data.length > 0) return data;
  }
  return getDealProductsLocal();
}

export async function getFeaturedProducts() {
  const all = await getProducts();
  return all.slice(0, 8);
}

export async function getCategories() {
  if (isDatabaseConfigured()) {
    const data = await getCategoriesFromDb();
    if (data.length > 0) return data;
  }
  return categories;
}

export async function getCategoryBySlug(slug: string) {
  if (isDatabaseConfigured()) {
    const c = await getCategoryBySlugFromDb(slug);
    if (c) return c;
  }
  const cats = await getCategories();
  return cats.find((c) => c.slug === slug) ?? null;
}

export async function getCategoryById(id: string) {
  const cats = await getCategories();
  return cats.find((c) => c.id === id) ?? null;
}

export async function getBuilds(): Promise<Build[]> {
  return [];
}

export async function getBuildById(id: string): Promise<Build | null> {
  const builds = await getBuilds();
  return builds.find((b) => b.id === id) ?? null;
}

export { orders };
