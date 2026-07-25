"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { ProductCard } from "@/components/storefront/product-card";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/data/products";
import type { Category } from "@/lib/data/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal, Search } from "lucide-react";

interface ProductsContentProps {
  initialProducts: Product[];
  categories: Category[];
}

export function ProductsContent({ initialProducts, categories }: ProductsContentProps) {
  const t = useTranslations("products");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialQuery = searchParams.get("q") || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState("newest");
  const [priceRange, setPriceRange] = useState([1, 200000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialQuery);

  useEffect(() => {
    setSearchQuery(initialQuery);
  }, [initialQuery]);

  const filteredProducts = useMemo(() => {
    let result = [...initialProducts];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name_en.toLowerCase().includes(q) ||
          p.name_ar.includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== "all") {
      const cat = categories.find((c) => c.slug === selectedCategory);
      if (cat) result = result.filter((p) => p.categoryId === cat.id);
    }
    result = result.filter((p) => {
      const price = p.isDeal ? p.price * (1 - p.discountPercent / 100) : p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });
    if (inStockOnly) result = result.filter((p) => p.stock > 0);
    switch (sortBy) {
      case "price_low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "popular":
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return result;
  }, [initialProducts, selectedCategory, sortBy, priceRange, inStockOnly, searchQuery, categories]);

  const FilterSidebar = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">{t("filter")}</Label>
        <div className="relative">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={locale === "ar" ? "ابحث..." : "Search..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            className="ps-9"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">{t("category")}</Label>
        <div className="flex flex-wrap gap-1.5">
          <Badge variant={selectedCategory === "all" ? "default" : "outline"} className="cursor-pointer" onClick={() => setSelectedCategory("all")}>
            {t("all_categories")}
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={selectedCategory === cat.slug ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(cat.slug)}
            >
              {locale === "ar" ? cat.name_ar : cat.name_en}
            </Badge>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Label className="text-sm font-medium">{t("price_range")}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={200000}
            value={priceRange[0]}
            onChange={(e) => setPriceRange(([_, max]) => [Math.max(1, Math.min(200000, Number(e.target.value) || 1)), max])}
            className="h-9 w-full text-sm"
          />
          <span className="text-muted-foreground">–</span>
          <Input
            type="number"
            min={1}
            max={200000}
            value={priceRange[1]}
            onChange={(e) => setPriceRange(([min, _]) => [min, Math.max(1, Math.min(200000, Number(e.target.value) || 200000))])}
            className="h-9 w-full text-sm"
          />
        </div>
        <p className="text-xs text-muted-foreground">{locale === "ar" ? "من 1 إلى 200,000 ج.م" : "1 to 200,000 EGP"}</p>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="in-stock" checked={inStockOnly} onCheckedChange={(v) => setInStockOnly(v === true)} />
        <Label htmlFor="in-stock" className="cursor-pointer text-sm">
          {t("in_stock")}
        </Label>
      </div>
    </div>
  );

  return (
    <StorefrontShell>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold sm:text-2xl">{t("title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("items_found", { count: filteredProducts.length })}</p>
          </div>
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0 gap-2 lg:hidden">
                  <SlidersHorizontal className="h-4 w-4" />
                  {t("filter")}
                </Button>
              </SheetTrigger>
              <SheetContent side={locale === "ar" ? "left" : "right"} className="w-[min(20rem,100vw-2rem)]">
                <SheetTitle>{t("filter")}</SheetTitle>
                <div className="mt-6">
                  <FilterSidebar />
                </div>
              </SheetContent>
            </Sheet>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="min-w-0 shrink-0 sm:w-44">
                <SelectValue placeholder={t("sort")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t("sort_newest")}</SelectItem>
                <SelectItem value="price_low">{t("sort_price_low")}</SelectItem>
                <SelectItem value="price_high">{t("sort_price_high")}</SelectItem>
                <SelectItem value="popular">{t("sort_popular")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-8">
          <aside className="hidden w-64 shrink-0 lg:block">
            <FilterSidebar />
          </aside>
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg text-muted-foreground">{t("no_products")}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </StorefrontShell>
  );
}
