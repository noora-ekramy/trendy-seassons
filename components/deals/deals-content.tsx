"use client";

import { useTranslations } from "next-intl";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { ProductCard } from "@/components/storefront/product-card";
import { Badge } from "@/components/ui/badge";
import { Flame } from "lucide-react";
import type { Product } from "@/lib/data/products";

interface DealsContentProps {
  deals: Product[];
}

export function DealsContent({ deals }: DealsContentProps) {
  const t = useTranslations("deals");

  return (
    <StorefrontShell>
      <section className="bg-gradient-to-b from-primary/10 to-background py-12 text-center">
        <div className="mx-auto max-w-7xl px-4">
          <Badge variant="secondary" className="mb-3 gap-1 px-3 py-1">
            <Flame className="h-3 w-3" />
            {t("limited")}
          </Badge>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        {deals.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">{t("no_deals")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {deals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </StorefrontShell>
  );
}
