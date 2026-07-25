export interface Category {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  icon: string;
  description_en: string;
  description_ar: string;
  productCount: number;
}

export const categories: Category[] = [
  {
    id: "cat-1",
    name_en: "Bags",
    name_ar: "شنط",
    slug: "bags",
    icon: "ShoppingBag",
    description_en: "Totes, crossbody bags, and summer straw handbags",
    description_ar: "شنط tote وcrossbody وشنط القش للصيف",
    productCount: 3,
  },
  {
    id: "cat-2",
    name_en: "Scarves & Wraps",
    name_ar: "طرح وشالات",
    slug: "scarves-wraps",
    icon: "Wind",
    description_en: "Light linen scarves and elegant summer wraps",
    description_ar: "طرح كتان خفيفة وشالات صيفية أنيقة",
    productCount: 2,
  },
  {
    id: "cat-3",
    name_en: "Makeup",
    name_ar: "ميك أب",
    slug: "makeup",
    icon: "Sparkles",
    description_en: "Lipsticks, blush, and glow essentials for sunny days",
    description_ar: "أحمر شفاه، بلاشر، وأساسيات الإشراق للأيام المشمسة",
    productCount: 3,
  },
  {
    id: "cat-4",
    name_en: "Skincare & Sunscreen",
    name_ar: "عناية بالبشرة وواقي شمس",
    slug: "skincare-sunscreen",
    icon: "Sun",
    description_en: "SPF protection, serums, and hydrating summer skincare",
    description_ar: "حماية SPF، سيرums، وعناية مرطبة للصيف",
    productCount: 3,
  },
  {
    id: "cat-5",
    name_en: "Sunglasses",
    name_ar: "نظارات شمسية",
    slug: "sunglasses",
    icon: "Glasses",
    description_en: "UV-protection sunglasses in trendy summer styles",
    description_ar: "نظارات شمسية بحماية UV بستايلات صيفية عصرية",
    productCount: 2,
  },
  {
    id: "cat-6",
    name_en: "Accessories",
    name_ar: "إكسسوارات",
    slug: "accessories",
    icon: "Gem",
    description_en: "Jewelry, hair clips, and chic summer add-ons",
    description_ar: "مجوهرات، مشابك شعر، وإكسسوارات صيفية أنيقة",
    productCount: 2,
  },
  {
    id: "cat-7",
    name_en: "Summer Dresses",
    name_ar: "فساتين صيفية",
    slug: "summer-dresses",
    icon: "Shirt",
    description_en: "Flowy dresses and linen styles for warm weather",
    description_ar: "فساتين فلوي وستايلات كتان للجو الحار",
    productCount: 2,
  },
  {
    id: "cat-8",
    name_en: "Sandals",
    name_ar: "صنادل",
    slug: "sandals",
    icon: "Footprints",
    description_en: "Comfortable sandals and slides for beach and city",
    description_ar: "صنادل مريحة وslides للبحر والمدينة",
    productCount: 2,
  },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
