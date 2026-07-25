"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

export function NavigationProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startLoading = useCallback(() => {
    setLoading(true);
    setProgress(10);
    const t1 = setTimeout(() => setProgress(40), 100);
    const t2 = setTimeout(() => setProgress(70), 300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const finishLoading = useCallback(() => {
    setProgress(100);
    const t = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading) finishLoading();
  }, [pathname]);

  useEffect(() => {
    if (!loading) return;
    const timeout = setTimeout(finishLoading, 4000);
    return () => clearTimeout(timeout);
  }, [loading, finishLoading]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || anchor.hasAttribute("target")) return;
      if (href.startsWith("/") || href.startsWith(".")) {
        startLoading();
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [startLoading]);

  const show = loading || progress > 0;
  if (!show) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[9999] h-1 bg-primary shadow-lg shadow-primary/30 transition-[width,opacity] duration-150 ease-out"
      style={{ width: `${progress}%` }}
      aria-hidden
    />
  );
}
