import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Noto_Sans_Arabic } from "next/font/google";
import { DocumentLocale } from "@/components/document-locale";
import { ThemeProvider } from "@/components/theme-provider";
import { CartProvider } from "@/lib/context/cart-context";
import { AuthProvider } from "@/lib/context/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { StorefrontLayout } from "@/components/storefront/storefront-layout";
import { NavigationProgress } from "@/components/navigation-progress";
import { Analytics } from "@vercel/analytics/next";

const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-noto-arabic",
  weight: ["400", "500", "600"],
  display: "swap",
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "ar" | "en")) {
    notFound();
  }

  const messages = await getMessages();
  const isRTL = locale === "ar";

  return (
    <div lang={locale} dir={isRTL ? "rtl" : "ltr"} className={notoArabic.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <DocumentLocale />
          <AuthProvider>
            <CartProvider>
              <StorefrontLayout>{children}</StorefrontLayout>
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </ThemeProvider>
      <NavigationProgress />
      <Toaster />
      <Analytics />
    </div>
  );
}
