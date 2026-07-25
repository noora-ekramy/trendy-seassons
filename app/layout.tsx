import type { Metadata, Viewport } from "next";
import { Geist, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Trendy Seasons — Summer Style & Beauty",
    template: "%s | Trendy Seasons",
  },
  description:
    "Bags, scarves, makeup, sunscreen and summer essentials. Curated fashion and beauty delivered across Egypt.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F2" },
    { media: "(prefers-color-scheme: dark)", color: "#4A433A" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${cormorant.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
