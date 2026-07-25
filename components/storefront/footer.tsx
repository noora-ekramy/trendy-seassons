"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Mail, Phone, MapPin } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function Footer() {
  const t = useTranslations();
  const locale = useLocale();
  const prefix = `/${locale}`;

  return (
    <footer className="mt-auto border-t border-[#E5DDD0]/80 bg-gradient-to-b from-[#F3EDE3]/90 to-[#EDE6DA]/95">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <BrandLogo href={prefix} size="md" />
            <p className="max-w-xs text-sm leading-relaxed text-[#6B6358]/90">
              {t("home.hero_subtitle")}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-display text-base font-medium tracking-wide text-[#4A433A]">
              {locale === "ar" ? "روابط سريعة" : "Quick Links"}
            </h3>
            <nav className="flex flex-col gap-2.5">
              {[
                { label: t("nav.products"), href: "/products" },
                { label: t("nav.deals"), href: "/deals" },
                { label: t("nav.services"), href: "/services" },
                { label: t("nav.about"), href: "/about" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={`${prefix}${link.href}`}
                  className="text-sm text-[#6B6358] transition-colors hover:text-[#6B7358]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-display text-base font-medium tracking-wide text-[#4A433A]">
              {t("nav.contact")}
            </h3>
            <div className="flex flex-col gap-2.5 text-sm text-[#6B6358]">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#6B7358]/80" strokeWidth={1.5} />
                <span>{t("contact.address_value")}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 shrink-0 text-[#6B7358]/80" strokeWidth={1.5} />
                <span dir="ltr">{t("contact.phone_value")}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="h-3.5 w-3.5 shrink-0 text-[#6B7358]/80" strokeWidth={1.5} />
                <span>{t("contact.email_value")}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="font-display text-base font-medium tracking-wide text-[#4A433A]">
              {t("contact.hours")}
            </h3>
            <p className="text-sm leading-relaxed text-[#6B6358]">{t("contact.hours_value")}</p>
          </div>
        </div>

        <div className="mt-12 border-t border-[#D9D0C2]/80 pt-6 text-center">
          <p className="font-display text-sm tracking-wide text-[#6B6358]/80">
            &copy; {new Date().getFullYear()} Trendy Seasons
            <span className="mx-2 text-[#C4B8A5]">·</span>
            {locale === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved"}
          </p>
        </div>
      </div>
    </footer>
  );
}
