"use client";

import { useState, useEffect } from "react";

/**
 * Renders children only after mount. Fixes Radix UI hydration mismatches
 * (Sheet, Tabs, Dialog) where server and client generate different IDs.
 */
export function ClientOnly({ children, fallback = null }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{fallback}</>;
  return <>{children}</>;
}
