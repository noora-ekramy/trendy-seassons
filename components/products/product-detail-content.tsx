"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { ProductCard } from "@/components/storefront/product-card";
import { useCart } from "@/lib/context/cart-context";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/data/products";
import type { Category } from "@/lib/data/categories";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ClientOnly } from "@/components/client-only";
import { toast } from "sonner";
import { ShoppingCart, Star, Minus, Plus, ChevronRight, ChevronLeft } from "lucide-react";

interface ProductDetailContentProps {
  product: Product;
  category: Category | null;
  related: Product[];
}

export function ProductDetailContent({ product, category, related }: ProductDetailContentProps) {
  const locale = useLocale();
  const t = useTranslations("products");
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  const name = locale === "ar" ? product.name_ar : product.name_en;
  const allImages = product.images?.length > 0 ? product.images : [];
  const description = locale === "ar" ? product.description_ar : product.description_en;
  const effectivePrice = product.isDeal ? product.price * (1 - product.discountPercent / 100) : product.price;
  const isRTL = locale === "ar";
  const prefix = `/${locale}`;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <StorefrontShell>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
          <Link href={prefix} className="hover:text-foreground">
            {locale === "ar" ? "الرئيسية" : "Home"}
          </Link>
          <Chevron className="h-3 w-3" />
          <Link href={`${prefix}/products`} className="hover:text-foreground">
            {t("title")}
          </Link>
          {category && (
            <>
              <Chevron className="h-3 w-3" />
              <span className="text-foreground">{locale === "ar" ? category.name_ar : category.name_en}</span>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="space-y-3">
            <div className="relative aspect-square overflow-hidden rounded-xl border border-border/50 bg-secondary/30">
              <Image
                src={
                  allImages[selectedImageIdx] && !allImages[selectedImageIdx].includes("placeholder.svg")
                    ? allImages[selectedImageIdx]
                    : "/images/product-placeholder.webp"
                }
                alt={name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={75}
              />
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setSelectedImageIdx((i) => (i === 0 ? allImages.length - 1 : i - 1))}
                    className="absolute start-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImageIdx((i) => (i === allImages.length - 1 ? 0 : i + 1))}
                    className="absolute end-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((url, idx) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setSelectedImageIdx(idx)}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedImageIdx === idx ? "border-primary" : "border-transparent hover:border-muted-foreground/30"
                    }`}
                  >
                    <Image src={url} alt="" width={64} height={64} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.brand}
              </Badge>
              <h1 className="text-2xl font-bold lg:text-3xl">{name}</h1>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < Math.floor(product.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviewCount} {t("reviews")})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className="text-2xl font-bold text-primary sm:text-3xl">{formatPrice(effectivePrice)}</span>
              {product.isDeal && (
                <>
                  <span className="text-base text-muted-foreground line-through sm:text-lg">{formatPrice(product.price)}</span>
                  <Badge className="shrink-0 bg-primary text-primary-foreground">-{product.discountPercent}%</Badge>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-destructive"}`} />
              <span className="text-sm">
                {product.stock > 0 ? `${locale === "ar" ? "متوفر" : "In Stock"} (${product.stock})` : t("out_of_stock")}
              </span>
            </div>

            <Separator />

            <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center rounded-md border border-input">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-e-none" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="flex h-10 w-12 items-center justify-center text-sm font-medium">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-s-none" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="lg"
                className="flex-1 gap-2"
                disabled={product.stock === 0}
                onClick={() => {
                  addItem(product, quantity);
                  toast.success(t("item_added"));
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                {t("add_to_cart")}
              </Button>
            </div>
          </div>
        </div>

        <ClientOnly
          fallback={
            <div className="mt-12">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center">
                        <span className="min-w-0 shrink-0 text-sm font-medium text-muted-foreground sm:w-40">{key}</span>
                        <span className="min-w-0 text-sm break-words">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          }
        >
          <Tabs defaultValue="specs" className="mt-12">
            <TabsList>
              <TabsTrigger value="specs">{t("specs")}</TabsTrigger>
              <TabsTrigger value="description">{t("description")}</TabsTrigger>
            </TabsList>
            <TabsContent value="specs" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center">
                        <span className="min-w-0 shrink-0 text-sm font-medium text-muted-foreground sm:w-40">{key}</span>
                        <span className="min-w-0 text-sm break-words">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="description" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <p className="leading-relaxed text-muted-foreground">{description}</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ClientOnly>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-xl font-bold">{t("related")}</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </StorefrontShell>
  );
}
