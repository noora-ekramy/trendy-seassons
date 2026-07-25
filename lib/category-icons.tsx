import {
  ShoppingBag,
  Wind,
  Sparkles,
  Sun,
  Glasses,
  Gem,
  Shirt,
  Footprints,
  Leaf,
  type LucideIcon,
} from "lucide-react";

export const categoryIconMap: Record<string, LucideIcon> = {
  ShoppingBag,
  Wind,
  Sparkles,
  Sun,
  Glasses,
  Gem,
  Shirt,
  Footprints,
  Leaf,
};

export function getCategoryIcon(iconName: string, className = "h-10 w-10") {
  const Icon = categoryIconMap[iconName] ?? Leaf;
  return <Icon className={className} />;
}
