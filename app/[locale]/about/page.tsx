"use client";

import { useTranslations } from "next-intl";
import { StorefrontShell } from "@/components/storefront/storefront-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Users, ShoppingBag, Award } from "lucide-react";

export default function AboutPage() {
  const t = useTranslations("about");

  const stats = [
    { icon: Package, value: "200+", label: t("stats_products") },
    { icon: Users, value: "2000+", label: t("stats_customers") },
    { icon: ShoppingBag, value: "5000+", label: t("stats_orders") },
    { icon: Award, value: "3+", label: t("stats_years") },
  ];

  return (
    <StorefrontShell>
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6">
        <div className="mb-16 text-center">
          <h1 className="mb-4 font-display text-4xl font-light tracking-tight text-[#4A433A] sm:text-5xl lg:text-6xl">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[#6B6358]">
            {t("subtitle")}
          </p>
        </div>

        <div className="mb-20 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {stats.map((stat, index) => (
            <Card key={index} className="border-border/50 bg-card/80 text-center backdrop-blur-sm">
              <CardContent className="flex flex-col items-center gap-3 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/80">
                  <stat.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <div className="font-display text-3xl font-light text-[#4A433A]">{stat.value}</div>
                <div className="text-sm text-[#6B6358]">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mb-16 grid gap-6 lg:grid-cols-2 lg:gap-10">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="mb-4 font-display text-2xl font-light text-[#4A433A]">{t("story")}</h2>
              <p className="leading-relaxed text-[#6B6358]">{t("story_text")}</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="mb-4 font-display text-2xl font-light text-[#4A433A]">{t("mission")}</h2>
              <p className="leading-relaxed text-[#6B6358]">{t("mission_text")}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          {[
            { title: t("value_quality_title"), desc: t("value_quality_desc") },
            { title: t("value_trust_title"), desc: t("value_trust_desc") },
            { title: t("value_value_title"), desc: t("value_value_desc") },
          ].map((value, index) => (
            <Card key={index} className="border-border/50 bg-card/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="mb-2 font-display text-xl font-medium text-[#4A433A]">{value.title}</h3>
                <p className="text-sm leading-relaxed text-[#6B6358]">{value.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </StorefrontShell>
  );
}
