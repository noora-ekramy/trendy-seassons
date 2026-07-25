"use client";

import { useLocale, useTranslations } from "next-intl";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Gift, Heart, Sun } from "lucide-react";

function getWhatsAppHref(message: string) {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "201000000000";
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export default function ServicesPage() {
  const t = useTranslations("services");
  const locale = useLocale();

  const services = [
    { icon: Sparkles, title: t("styling_title"), desc: t("styling_desc") },
    { icon: Gift, title: t("gift_title"), desc: t("gift_desc") },
    { icon: Heart, title: t("beauty_title"), desc: t("beauty_desc") },
    { icon: Sun, title: t("picks_title"), desc: t("picks_desc") },
  ];

  return (
    <StorefrontShell>
      <section className="border-b border-border/40 bg-[#F3EDE3]/50 py-14 text-center">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="font-display text-3xl font-light tracking-tight text-[#4A433A] sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-3 text-[#6B6358]">{t("subtitle")}</p>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-14 lg:px-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {services.map((service) => (
            <Card
              key={service.title}
              className="border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-500 hover:border-primary/20 hover:shadow-[0_16px_40px_-24px_oklch(0.36_0.02_65_/_0.18)]"
            >
              <CardContent className="flex flex-col gap-4 p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/80">
                  <service.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl font-medium text-[#4A433A]">{service.title}</h3>
                <p className="text-sm leading-relaxed text-[#6B6358]">{service.desc}</p>
                <Button variant="outline" className="mt-1 w-fit" asChild>
                  <a
                    href={getWhatsAppHref(
                      locale === "ar"
                        ? `عايزة أطلب الخدمة دي: ${service.title}`
                        : `I'd like to request this service: ${service.title}`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("request_service")}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StorefrontShell>
  );
}
