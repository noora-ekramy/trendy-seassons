"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { useCart } from "@/lib/context/cart-context";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const prefix = `/${locale}`;
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();

  const getPrice = (item: (typeof items)[0]) => {
    const p = item.product;
    return p.isDeal ? p.price * (1 - p.discountPercent / 100) : p.price;
  };

  if (items.length === 0) {
    return (
      <StorefrontShell>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center">
          <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground/50" />
          <h1 className="text-2xl font-bold">{t("empty")}</h1>
          <p className="mt-2 text-muted-foreground">{t("empty_desc")}</p>
          <Link href={`${prefix}/products`}>
            <Button className="mt-6">{t("continue_shopping")}</Button>
          </Link>
        </div>
      </StorefrontShell>
    );
  }

  return (
    <StorefrontShell>
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={clearCart}>
            {t("clear")}
          </Button>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            {items.map((item) => {
              const price = getPrice(item);
              const name = locale === "ar" ? item.product.name_ar : item.product.name_en;
              return (
                <Card key={item.product.id} className="border-border/50 overflow-hidden">
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="flex gap-4 sm:min-w-0 sm:flex-1">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted/50">
                        <Image
                          src={item.product.images[0] || "/placeholder.svg"}
                          alt={name}
                          width={80}
                          height={80}
                          className="h-full w-full object-contain p-2"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <Link
                          href={`${prefix}/products/${item.product.id}`}
                          className="truncate text-sm font-semibold hover:text-primary sm:line-clamp-2"
                        >
                          {name}
                        </Link>
                        <span className="text-xs text-muted-foreground">
                          {item.product.brand}
                        </span>
                        <span className="text-sm font-bold text-primary">
                          {formatPrice(price)}
                        </span>
                        <span className="text-sm font-semibold sm:hidden">
                          {formatPrice(price * item.quantity)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end">
                      <div className="flex items-center rounded-md border border-input">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-e-none"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="flex h-8 w-8 items-center justify-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-s-none"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="hidden w-28 text-end sm:block">
                        <span className="text-sm font-semibold">
                          {formatPrice(price * item.quantity)}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <div className="w-full lg:w-80">
            <Card className="border-border/50 sm:sticky sm:top-20">
              <CardContent className="flex flex-col gap-4 p-6">
                <h2 className="font-semibold">{t("title")}</h2>
                <Separator />
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("subtotal")}</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("shipping")}</span>
                  <span className="font-medium text-green-500">{t("free_shipping")}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{t("order_total")}</span>
                  <span className="text-xl font-bold text-primary">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <Link href={`${prefix}/checkout`} className="w-full">
                  <Button className="w-full" size="lg">
                    {t("checkout")}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StorefrontShell>
  );
}
