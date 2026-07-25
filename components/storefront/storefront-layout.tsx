"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/storefront/header";
import { Footer } from "@/components/storefront/footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";

export function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.includes("/admin");
  const isAdminLogin = pathname?.includes("/admin/login");

  if (isAdmin || isAdminLogin) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="storefront-backdrop storefront-content-layer flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 pt-14 sm:pt-16">{children}</main>
        <Footer />
      </div>
      <WhatsAppFloat />
    </>
  );
}
