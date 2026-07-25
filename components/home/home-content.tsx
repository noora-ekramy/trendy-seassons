"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { ProductCard } from "@/components/storefront/product-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCategoryIcon } from "@/lib/category-icons";
import {
  Truck,
  Shield,
  HeadphonesIcon,
  Leaf,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import type { Product } from "@/lib/data/products";
import type { Category } from "@/lib/data/categories";

interface HomeContentProps {
  featured: Product[];
  deals: Product[];
  categories: Category[];
}

export function HomeContent({ featured, deals, categories }: HomeContentProps) {
  const t = useTranslations("home");
  const locale = useLocale();
  const prefix = `/${locale}`;
  const isRTL = locale === "ar";
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <StorefrontShell>
      {/* Pull under fixed header so the photo reaches the very top of the screen */}
      <section className="relative -mt-14 min-h-[100svh] w-full overflow-hidden sm:-mt-16">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-summer.jpg"
            alt={t("hero_image_alt")}
            fill
            className="object-cover object-[center_22%]"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2]/40 via-[#FAF7F2]/45 to-[#FAF7F2]/90" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2]/35 via-transparent to-[#FAF7F2]/35" />
        </div>

        <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col items-center justify-center gap-8 px-4 pt-28 pb-24 text-center sm:pt-32 sm:pb-28">
          <h1 className="max-w-3xl font-display text-4xl font-light tracking-tight text-[#4A433A] sm:text-5xl lg:text-6xl">
            {t("hero_title")}
          </h1>
          <p className="max-w-xl text-pretty text-base leading-relaxed text-[#6B6358] sm:text-lg">
            {t("hero_subtitle")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href={`${prefix}/products`}>
              <Button size="lg" className="gap-2 px-10">
                {t("shop_now")}
                <ArrowIcon className="h-4 w-4" strokeWidth={1.5} />
              </Button>
            </Link>
            <Link href={`${prefix}/deals`}>
              <Button size="lg" variant="outline" className="border-[#C4B8A5]/80 bg-[#FAF7F2]/60 px-10 backdrop-blur-sm">
                {t("explore_deals")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:py-24 lg:px-6">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground/80">{t("featured_categories")}</p>
            <h2 className="font-display text-2xl font-light text-[#4A433A] sm:text-3xl">{t("featured_categories")}</h2>
          </div>
          <Link href={`${prefix}/products`}>
            <Button variant="ghost" className="gap-1 text-sm text-muted-foreground hover:text-primary">
              {t("view_all")} <ArrowIcon className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
          {categories.slice(0, 8).map((cat) => (
            <Link key={cat.id} href={`${prefix}/products?category=${cat.slug}`}>
              <Card className="group cursor-pointer border-border/50 bg-card/70 backdrop-blur-sm transition-all duration-500 hover:border-primary/20 hover:bg-card/90 hover:shadow-[0_16px_40px_-24px_oklch(0.32_0.025_65_/_0.2)]">
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F3EDE3] text-[#6B7358] transition-all duration-500 group-hover:bg-[#6B7358]/15">
                    {getCategoryIcon(cat.icon, "h-5 w-5")}
                  </div>
                  <span className="text-sm font-medium text-foreground/90">
                    {locale === "ar" ? cat.name_ar : cat.name_en}
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:py-20 lg:px-6">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground/80">{t("featured_products")}</p>
            <h2 className="font-display text-2xl font-light text-[#4A433A] sm:text-3xl">{t("featured_products")}</h2>
          </div>
          <Link href={`${prefix}/products`}>
            <Button variant="ghost" className="gap-1 text-sm text-muted-foreground hover:text-primary">
              {t("view_all")} <ArrowIcon className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {deals.length > 0 && (
        <section className="border-y border-[#E5DDD0]/70 bg-[#F3EDE3]/45 py-20 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-muted-foreground/80">{t("deals_section")}</p>
                <h2 className="font-display text-2xl font-light text-[#4A433A] sm:text-3xl">{t("deals_section")}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{t("deals_subtitle")}</p>
              </div>
              <Link href={`${prefix}/deals`}>
                <Button variant="ghost" className="gap-1 text-sm text-muted-foreground hover:text-primary">
                  {t("view_all")} <ArrowIcon className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {deals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h2 className="mb-12 text-center font-display text-2xl font-light text-[#4A433A] sm:text-3xl">{t("why_us")}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Truck, title: t("why_delivery"), desc: t("why_delivery_desc") },
              { icon: Shield, title: t("why_warranty"), desc: t("why_warranty_desc") },
              { icon: HeadphonesIcon, title: t("why_support"), desc: t("why_support_desc") },
              { icon: Leaf, title: t("why_prices"), desc: t("why_prices_desc") },
            ].map((item) => (
              <Card key={item.title} className="border-border/50 bg-card/70 backdrop-blur-sm transition-all duration-500 hover:bg-card/90">
                <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/70">
                    <item.icon className="h-6 w-6 text-primary" strokeWidth={1.25} />
                  </div>
                  <h3 className="font-display text-lg font-medium text-[#4A433A]">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </StorefrontShell>
  );
}
