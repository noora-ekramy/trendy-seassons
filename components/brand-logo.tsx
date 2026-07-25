import Link from "next/link";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  href?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showMark?: boolean;
}

export function BrandLogo({
  href,
  className,
  size = "md",
  showMark = true,
}: BrandLogoProps) {
  const sizes = {
    sm: { text: "text-lg", mark: "h-7 w-7 text-[10px]" },
    md: { text: "text-xl sm:text-[1.35rem]", mark: "h-8 w-8 text-[11px]" },
    lg: { text: "text-2xl sm:text-3xl", mark: "h-10 w-10 text-xs" },
  };
  const s = sizes[size];

  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {showMark && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full border border-[#C4B8A5]/70 bg-[#F3EDE3]/80 text-[#6B7358]",
            s.mark
          )}
          aria-hidden
        >
          <span className="font-display font-medium tracking-[0.12em]">TS</span>
        </span>
      )}
      <span
        className={cn(
          "font-display font-light tracking-[0.04em] text-[#4A433A]",
          s.text
        )}
      >
        Trendy{" "}
        <span className="font-normal italic text-[#6B7358]">Seasons</span>
      </span>
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="shrink-0 transition-opacity hover:opacity-80">
        {content}
      </Link>
    );
  }

  return content;
}
