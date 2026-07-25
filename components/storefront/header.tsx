"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCart } from "@/lib/context/cart-context";
import { LanguageSwitcher } from "@/components/language-switcher";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ClientOnly } from "@/components/client-only";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { ShoppingCart, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

const navLinks = [
  { key: "home", href: "" },
  { key: "products", href: "/products" },
  { key: "deals", href: "/deals" },
  { key: "services", href: "/services" },
  { key: "chat", href: "/chat" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
];

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { itemCount } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const prefix = `/${locale}`;

  const qParam = searchParams.get("q") ?? "";
  useEffect(() => {
    setSearchQuery(qParam);
  }, [qParam]);

  useEffect(() => {
    if (!mobileSearchOpen) return;
    requestAnimationFrame(() => {
      const el = document.getElementById("mobile-header-search") as HTMLInputElement | null;
      el?.focus();
      el?.select();
    });
  }, [mobileSearchOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-[100] w-full border-b border-border/40 bg-[#FAF7F2]/80 backdrop-blur-md">
      <div className="relative mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:min-h-16 sm:px-4 lg:px-6">
        <BrandLogo href={prefix} size="md" />

        <nav className="hidden items-center gap-0.5 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.key}
              href={`${prefix}${link.href}`}
              className="rounded-sm px-3 py-2 text-[13px] font-normal tracking-wide text-muted-foreground transition-colors hover:text-foreground"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div
          className={`absolute inset-0 z-[120] flex items-center gap-2 px-3 bg-[#FAF7F2]/95 backdrop-blur-md transition-all duration-200 ease-out sm:hidden ${
            mobileSearchOpen ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-1"
          }`}
        >
          <form
            className="flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              const q = searchQuery.trim();
              router.push(q ? `${prefix}/products?q=${encodeURIComponent(q)}` : `${prefix}/products`);
              setMobileSearchOpen(false);
            }}
          >
            <InputGroup className="h-10 border-border/60 bg-card/80">
              <InputGroupAddon>
                <Search className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="mobile-header-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                placeholder={t("search")}
                aria-label={t("search")}
                inputMode="search"
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === "Escape") setMobileSearchOpen(false);
                }}
              />
            </InputGroup>
          </form>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0"
            onClick={() => setMobileSearchOpen(false)}
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-0.5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = searchQuery.trim();
              router.push(q ? `${prefix}/products?q=${encodeURIComponent(q)}` : `${prefix}/products`);
            }}
            className="hidden sm:block w-[12rem] md:w-[16rem] lg:w-[18rem]"
          >
            <InputGroup className="h-9 border-border/50 bg-card/50">
              <InputGroupAddon>
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                placeholder={t("search")}
                aria-label={t("search")}
                inputMode="search"
                autoComplete="off"
                className="text-sm placeholder:text-muted-foreground/70"
              />
            </InputGroup>
          </form>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:hidden"
            onClick={() => setMobileSearchOpen(true)}
            aria-expanded={mobileSearchOpen}
          >
            <Search className="h-4 w-4" strokeWidth={1.5} />
            <span className="sr-only">{t("search")}</span>
          </Button>

          <LanguageSwitcher />

          <Link href={`${prefix}/cart`}>
            <Button variant="ghost" size="icon" className="relative h-9 w-9">
              <ShoppingCart className="h-4 w-4" strokeWidth={1.5} />
              {itemCount > 0 && (
                <Badge className="absolute -top-0.5 -end-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary/85 p-0 text-[10px] font-normal text-primary-foreground">
                  {itemCount}
                </Badge>
              )}
              <span className="sr-only">{t("cart")}</span>
            </Button>
          </Link>

          <ClientOnly
            fallback={
              <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden" aria-hidden>
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              </Button>
            }
          >
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 lg:hidden">
                  <Menu className="h-5 w-5" strokeWidth={1.5} />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side={locale === "ar" ? "left" : "right"}
                className="w-[min(18rem,100vw-2rem)] max-w-[90vw] border-border/50 bg-[#FAF7F2]"
              >
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="mt-2">
                  <BrandLogo size="md" />
                </div>
                <nav className="mt-8 flex flex-col gap-0.5">
                  {navLinks.map((link) => (
                    <Link
                      key={link.key}
                      href={`${prefix}${link.href}`}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-sm px-3 py-2.5 text-sm tracking-wide text-muted-foreground transition-colors hover:bg-secondary/80 hover:text-foreground"
                    >
                      {t(link.key)}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </ClientOnly>
        </div>
      </div>
    </header>
  );
}
