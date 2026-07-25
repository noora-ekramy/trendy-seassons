import { getProducts, getCategories } from "@/lib/data";
import { ProductsContent } from "@/components/products/products-content";

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);

  return <ProductsContent initialProducts={products} categories={categories} />;
}
