"use client";

import Link from "next/link";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/lib/context/cart-context";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/data/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ShoppingCart, Star } from "lucide-react";

const PLACEHOLDER = "/images/product-placeholder.jpg";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const t = useTranslations("products");
  const locale = useLocale();
  const { addItem } = useCart();

  const name = locale === "ar" ? product.name_ar : product.name_en;
  const effectivePrice = product.isDeal
    ? product.price * (1 - product.discountPercent / 100)
    : product.price;
  const isOutOfStock = product.stock === 0;
  const imageSrc =
    product.images.length > 0 && product.images[0] && !product.images[0].includes("placeholder.svg")
      ? product.images[0]
      : PLACEHOLDER;

  return (
    <Card className="group relative overflow-hidden border border-border/60 bg-card/90 backdrop-blur-sm transition-all duration-500 hover:border-primary/25 hover:shadow-[0_20px_50px_-20px_oklch(0.32_0.025_65_/_0.15)]">
      <div className="absolute start-3 top-3 z-10 flex flex-col gap-1.5">
        {product.isDeal && (
          <Badge className="rounded-sm border-0 bg-[#6B7358]/85 font-normal text-[#FAF7F2] shadow-none">
            -{product.discountPercent}%
          </Badge>
        )}
      </div>

      <Link href={`/${locale}/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-secondary/40">
          <Image
            src={imageSrc}
            alt={name}
            width={400}
            height={400}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        </div>
      </Link>

      <CardContent className="flex flex-col gap-3 p-5">
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {product.brand}
        </span>

        <Link href={`/${locale}/products/${product.id}`}>
          <h3 className="line-clamp-2 font-display text-lg font-normal leading-snug text-[#4A433A] transition-colors hover:text-[#6B7358]">
            {name}
          </h3>
        </Link>

        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < Math.floor(product.rating)
                  ? "fill-accent/80 text-accent"
                  : "text-border"
              }`}
            />
          ))}
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="text-lg font-medium tracking-tight text-foreground">
            {formatPrice(effectivePrice)}
          </span>
          {product.isDeal && product.comparePrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {isOutOfStock && (
          <Badge variant="destructive" className="w-fit text-xs">
            {t("out_of_stock")}
          </Badge>
        )}

        <Button
          size="sm"
          variant="outline"
          className="mt-1 w-full border-[#C4B8A5]/80 bg-[#FAF7F2]/40 text-[#4A433A] hover:border-[#6B7358]/40 hover:bg-[#6B7358]/90 hover:text-[#FAF7F2]"
          disabled={isOutOfStock}
          onClick={() => {
            addItem(product);
            toast.success(t("item_added"));
          }}
        >
          {isOutOfStock ? (
            t("out_of_stock")
          ) : (
            <>
              <ShoppingCart className="me-2 h-4 w-4" />
              {t("add_to_cart")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
