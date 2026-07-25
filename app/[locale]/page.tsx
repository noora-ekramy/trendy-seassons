import { getProducts, getCategories } from "@/lib/data";
import { HomeContent } from "@/components/home/home-content";

export default async function HomePage() {
  const [allProducts, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);
  const featured = allProducts.slice(0, 8);
  const dealsSlice = allProducts.filter((p) => p.isDeal).slice(0, 4);

  return (
    <HomeContent
      featured={featured}
      deals={dealsSlice}
      categories={categories}
    />
  );
}
