import { notFound } from "next/navigation";
import { getProductById, getProductsByCategory, getCategoryById } from "@/lib/data";
import { ProductDetailContent } from "@/components/products/product-detail-content";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const [category, related] = await Promise.all([
    getCategoryById(product.categoryId),
    getProductsByCategory(product.categoryId).then((list) => list.filter((p) => p.id !== product.id).slice(0, 4)),
  ]);

  return <ProductDetailContent product={product} category={category} related={related} />;
}
