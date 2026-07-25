"use client";

import { useLocale } from "next-intl";
import { useEffect } from "react";

/**
 * Sets documentElement lang and dir from the current locale (for RTL and a11y).
 * Root layout has a single <html>; we sync it with the active locale here.
 */
export function DocumentLocale() {
  const locale = useLocale();
  const isRTL = locale === "ar";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [locale, isRTL]);

  return null;
}
