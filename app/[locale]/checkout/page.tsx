"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { useCart } from "@/lib/context/cart-context";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const prefix = `/${locale}`;
  const { items, subtotal, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPlacing(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const firstName = formData.get("firstName") as string;
      const lastName = formData.get("lastName") as string;
      const city = formData.get("city") as string;
      const address = formData.get("address") as string;
      
      const orderData = {
        customerName: `${firstName} ${lastName}`.trim(),
        phone: formData.get("phone") as string,
        shippingAddress: `${address}, ${city}`.trim(),
        paymentMethod,
        total: subtotal,
        status: "pending",
        items: items.map((item) => ({
          productId: item.product.id,
          name: locale === "ar" ? item.product.name_ar : item.product.name_en,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error("Failed to create order");

      setOrderPlaced(true);
      clearCart();
    } catch (error) {
      console.error("Order creation failed:", error);
      alert(locale === "ar" ? "فشل إنشاء الطلب. حاول مرة أخرى." : "Failed to create order. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  if (orderPlaced) {
    return (
      <StorefrontShell>
        <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
          <CheckCircle2 className="mb-4 h-16 w-16 text-green-500" />
          <h1 className="text-2xl font-bold">{t("success_title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("success_desc")}</p>
          <p className="mt-3 rounded-lg bg-primary/10 px-4 py-2 font-medium text-primary">
            {locale === "ar" ? "هنتواصل معاك قريب" : "We will contact you soon."}
          </p>
          <Link href={prefix}>
            <Button className="mt-6">{t("back_home")}</Button>
          </Link>
        </div>
      </StorefrontShell>
    );
  }

  if (items.length === 0) {
    return (
      <StorefrontShell>
        <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-24 text-center">
          <p className="text-muted-foreground">
            {locale === "ar" ? "سلتك فارغة" : "Your cart is empty"}
          </p>
          <Link href={`${prefix}/products`}>
            <Button className="mt-4">
              {locale === "ar" ? "تسوق الآن" : "Shop Now"}
            </Button>
          </Link>
        </div>
      </StorefrontShell>
    );
  }

  return (
    <StorefrontShell>
      <div className="mx-auto max-w-5xl px-4 py-8 lg:px-6">
        <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex flex-1 flex-col gap-6">
              {/* Shipping Info */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">{t("shipping_info")}</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="firstName">{t("first_name")}</Label>
                    <Input id="firstName" name="firstName" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="lastName">{t("last_name")}</Label>
                    <Input id="lastName" name="lastName" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email">{t("email")}</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="phone">{t("phone")}</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder={locale === "ar" ? "+20 1XX XXX XXXX" : "+20 1XX XXX XXXX"}
                      className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      {locale === "ar"
                        ? "رقم واتساب مع رمز الدولة (مثال: +20 لمصر)"
                        : "Phone with WhatsApp — include country code (e.g. +20 for Egypt)"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <Label htmlFor="address">{t("address")}</Label>
                    <Input id="address" name="address" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="city">{t("city")}</Label>
                    <Input id="city" name="city" required />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="zip">{t("zip")}</Label>
                    <Input id="zip" name="zip" required />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">{t("payment_method")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center gap-3 rounded-md border border-input p-3">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="cursor-pointer">
                        {t("cod")}
                      </Label>
                    </div>
                    <div className="mt-2 flex items-center gap-3 rounded-md border border-input p-3">
                      <RadioGroupItem value="vodafone_cash" id="vodafone_cash" />
                      <Label htmlFor="vodafone_cash" className="cursor-pointer">
                        {t("vodafone_cash")}
                      </Label>
                    </div>
                    <div className="mt-2 flex items-center gap-3 rounded-md border border-input p-3">
                      <RadioGroupItem value="instapay" id="instapay" />
                      <Label htmlFor="instapay" className="cursor-pointer">
                        {t("instapay")}
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-80">
              <Card className="sticky top-20 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">{t("order_review")}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {items.map((item) => {
                    const name = locale === "ar" ? item.product.name_ar : item.product.name_en;
                    const price = item.product.isDeal
                      ? item.product.price * (1 - item.product.discountPercent / 100)
                      : item.product.price;
                    return (
                      <div key={item.product.id} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {name} x{item.quantity}
                        </span>
                        <span>{formatPrice(price * item.quantity)}</span>
                      </div>
                    );
                  })}
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span>{locale === "ar" ? "الإجمالي" : "Total"}</span>
                    <span className="text-primary">{formatPrice(subtotal)}</span>
                  </div>
                  <Button type="submit" size="lg" className="mt-2 w-full" disabled={placing}>
                    {placing 
                      ? (locale === "ar" ? "جاري الإرسال..." : "Placing order...") 
                      : t("place_order")
                    }
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </StorefrontShell>
  );
}
