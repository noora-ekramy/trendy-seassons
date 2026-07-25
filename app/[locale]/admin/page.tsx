"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Package,
  ShoppingBag,
  Users,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  TrendingUp,
  X,
  Save,
  Loader2,
  ArrowLeft,
  ImagePlus,
  FolderTree,
  Tag,
  Eye,
  Leaf,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

/* ─── Types ─── */
interface ProductRow {
  id: string;
  name_en: string;
  name_ar: string;
  description_en: string;
  description_ar: string;
  price: number;
  compare_price?: number;
  comparePrice?: number;
  category_id?: string;
  categoryId?: string;
  brand: string;
  stock: number;
  rating: number;
  review_count?: number;
  reviewCount?: number;
  specs: Record<string, string>;
  is_deal?: boolean;
  isDeal?: boolean;
  discount_percent?: number;
  discountPercent?: number;
  images?: string[];
  created_at?: string;
  createdAt?: string;
}

interface OrderRow {
  id: string;
  customer_name?: string;
  customerName?: string;
  customer_email?: string;
  customerEmail?: string;
  phone?: string;
  status: string;
  total: number;
  items: { productId?: string; name: string; quantity: number; price: number }[];
  created_at?: string;
  createdAt?: string;
  date?: string;
  shipping_address?: string;
  shippingAddress?: string;
  payment_method?: string;
  paymentMethod?: string;
}

interface CategoryRow {
  id: string;
  name_en: string;
  name_ar: string;
  slug: string;
  icon?: string;
  description_en?: string;
  description_ar?: string;
}

interface BuildRow {
  id: string;
  name_en: string;
  name_ar: string;
  description_en?: string;
  description_ar?: string;
  price: number;
  tier: string;
  image?: string | null;
  products?: { product_id: string; name_en: string; name_ar: string; price: number; quantity: number }[];
}

/* ─── Normalizers ─── */
function normalizeProduct(p: ProductRow): ProductRow {
  return {
    ...p,
    categoryId: p.category_id ?? p.categoryId,
    comparePrice: p.compare_price ?? p.comparePrice,
    reviewCount: p.review_count ?? p.reviewCount,
    isDeal: p.is_deal ?? p.isDeal,
    discountPercent: p.discount_percent ?? p.discountPercent,
    createdAt: p.created_at ?? p.createdAt,
  };
}

function normalizeOrder(o: OrderRow): OrderRow {
  return {
    ...o,
    customerName: o.customer_name ?? o.customerName ?? "",
    customerEmail: o.customer_email ?? o.customerEmail ?? "",
    createdAt: o.created_at ?? o.createdAt ?? o.date ?? "",
    shippingAddress: o.shipping_address ?? o.shippingAddress ?? "",
    paymentMethod: o.payment_method ?? o.paymentMethod ?? "",
  };
}

const emptyProduct = {
  name_en: "",
  name_ar: "",
  description_en: "",
  description_ar: "",
  price: 0,
  compare_price: 0,
  category_id: "",
  brand: "",
  stock: 0,
  is_deal: false,
  discount_percent: 0,
  images: [] as string[],
  specs: {} as Record<string, string>,
};

const emptyCategory = {
  name_en: "",
  name_ar: "",
  slug: "",
  icon: "Box",
  description_en: "",
  description_ar: "",
};

const emptyBuild = {
  name_en: "",
  name_ar: "",
  description_en: "",
  description_ar: "",
  price: 0,
  tier: "mid" as const,
  image: "",
  product_ids: [] as string[],
};

const ICON_OPTIONS = [
  "ShoppingBag", "Wind", "Sparkles", "Sun", "Glasses", "Gem", "Shirt", "Footprints",
];

/* ─── Component ─── */
export default function AdminPage() {
  const t = useTranslations("admin");
  const locale = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const buildFileInputRef = useRef<HTMLInputElement>(null);

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ordersToday: 0,
    totalProducts: 0,
    totalOrders: 0,
    source: "local" as "neon" | "local",
  });
  const [loading, setLoading] = useState(true);

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingBuildImage, setUploadingBuildImage] = useState(false);

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryRow | null>(null);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);

  const [brands, setBrands] = useState<string[]>([]);
  const [newBrand, setNewBrand] = useState("");
  const [imageUrlToAdd, setImageUrlToAdd] = useState("");

  const [orderPhoneFilter, setOrderPhoneFilter] = useState("");
  const [orderAmountMin, setOrderAmountMin] = useState("");
  const [orderAmountMax, setOrderAmountMax] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  const [builds, setBuilds] = useState<BuildRow[]>([]);
  const [showBuildForm, setShowBuildForm] = useState(false);
  const [editingBuild, setEditingBuild] = useState<BuildRow | null>(null);
  const [buildForm, setBuildForm] = useState(emptyBuild);

  /* ─── Data fetching ─── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, ordRes, catRes, statRes, buildsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders"),
        fetch("/api/categories"),
        fetch("/api/stats"),
        fetch("/api/builds"),
      ]);
      const [prodData, ordData, catData, statData, buildsData] = await Promise.all([
        prodRes.json(),
        ordRes.json(),
        catRes.json(),
        statRes.json(),
        buildsRes.json(),
      ]);
      const normalizedProducts = prodData.map(normalizeProduct);
      setProducts(normalizedProducts);
      setOrders(ordData.map(normalizeOrder));
      setCategories(catData);
      setStats(statData);
      setBuilds(Array.isArray(buildsData) ? buildsData : []);

      const uniqueBrands = [...new Set(normalizedProducts.map((p: ProductRow) => p.brand))].filter(Boolean).sort() as string[];
      setBrands(uniqueBrands);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      toast.error(locale === "ar" ? `حصل مشكلة في تحميل البيانات: ${msg}` : msg);
    }
    setLoading(false);
  }, [locale]);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* ─── Product CRUD ─── */
  function openAddProduct() {
    setEditingProduct(null);
    setProductForm(emptyProduct);
    setShowProductForm(true);
  }

  function openEditProduct(p: ProductRow) {
    setEditingProduct(p);
    setProductForm({
      name_en: p.name_en,
      name_ar: p.name_ar,
      description_en: p.description_en ?? "",
      description_ar: p.description_ar ?? "",
      price: p.price,
      compare_price: p.comparePrice ?? p.compare_price ?? 0,
      category_id: p.categoryId ?? p.category_id ?? "",
      brand: p.brand,
      stock: p.stock,
      is_deal: p.isDeal ?? p.is_deal ?? false,
      discount_percent: p.discountPercent ?? p.discount_percent ?? 0,
      images: p.images ?? [],
      specs: p.specs ?? {},
    });
    setShowProductForm(true);
  }

  async function saveProduct() {
    setSaving(true);
    try {
      const payload = {
        name_en: productForm.name_en,
        name_ar: productForm.name_ar,
        description_en: productForm.description_en,
        description_ar: productForm.description_ar,
        price: Number(productForm.price),
        compare_price: Number(productForm.compare_price) || null,
        category_id: productForm.category_id || null,
        brand: productForm.brand,
        stock: Number(productForm.stock),
        is_deal: productForm.is_deal,
        discount_percent: Number(productForm.discount_percent),
        images: productForm.images,
        specs: productForm.specs,
      };

      if (editingProduct) {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Update failed");
        }
        toast.success(locale === "ar" ? "تم تعديل المنتج" : "Product updated");
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Create failed");
        }
        toast.success(locale === "ar" ? "تم إضافة المنتج" : "Product created");
      }
      setShowProductForm(false);
      fetchData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Operation failed";
      toast.error(locale === "ar" ? `حصل مشكلة: ${msg}` : msg);
    }
    setSaving(false);
  }

  async function deleteProduct(id: string) {
    if (!confirm(locale === "ar" ? "متأكد إنك عايز تحذف المنتج ده؟" : "Delete this product?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || `Delete failed (${res.status})`);
      toast.success(locale === "ar" ? "تم حذف المنتج" : "Product deleted");
      fetchData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Delete failed";
      toast.error(locale === "ar" ? `مش قادر أحذف: ${msg}` : msg);
    }
  }

  /* ─── Image upload/delete ─── */
  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || `Upload failed (${res.status})`);
      }
      const { url } = data as { url?: string };
      if (!url) throw new Error("No URL returned from upload");
      setProductForm((f) => ({ ...f, images: [...f.images, url] }));
      toast.success(locale === "ar" ? "تم رفع الصورة" : "Image uploaded");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      toast.error(locale === "ar" ? `فشل رفع الصورة: ${msg}` : msg);
    }
    setUploading(false);
  }

  async function removeImage(url: string) {
    try {
      await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
    } catch { /* ignore */ }
    setProductForm((f) => ({ ...f, images: f.images.filter((u) => u !== url) }));
  }

  async function uploadBuildImage(file: File) {
    setUploadingBuildImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || `Upload failed (${res.status})`);
      }
      const { url } = data as { url?: string };
      if (!url) throw new Error("No URL returned from upload");
      setBuildForm((f) => ({ ...f, image: url }));
      toast.success(locale === "ar" ? "تم رفع الصورة" : "Image uploaded");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      toast.error(locale === "ar" ? `فشل رفع الصورة: ${msg}` : msg);
    }
    setUploadingBuildImage(false);
  }

  /* ─── Order operations ─── */
  async function updateOrderStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || `Update failed (${res.status})`);
      toast.success(locale === "ar" ? "تم تحديث حالة الطلب" : "Order status updated");
      fetchData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Update failed";
      toast.error(locale === "ar" ? `حصل مشكلة: ${msg}` : msg);
    }
  }

  async function deleteOrder(id: string) {
    if (!confirm(locale === "ar" ? "متأكد إنك عايز تحذف الطلب ده؟" : "Delete this order?")) return;
    try {
      const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || `Delete failed (${res.status})`);
      toast.success(locale === "ar" ? "تم حذف الطلب" : "Order deleted");
      fetchData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Delete failed";
      toast.error(locale === "ar" ? `مش قادر أحذف: ${msg}` : msg);
    }
  }

  /* ─── Category CRUD ─── */
  function openAddCategory() {
    setEditingCategory(null);
    setCategoryForm(emptyCategory);
    setShowCategoryForm(true);
  }

  function openEditCategory(c: CategoryRow) {
    setEditingCategory(c);
    setCategoryForm({
      name_en: c.name_en,
      name_ar: c.name_ar,
      slug: c.slug,
      icon: c.icon ?? "Box",
      description_en: c.description_en ?? "",
      description_ar: c.description_ar ?? "",
    });
    setShowCategoryForm(true);
  }

  async function saveCategory() {
    setSaving(true);
    try {
      const payload = {
        name_en: categoryForm.name_en,
        name_ar: categoryForm.name_ar,
        slug: categoryForm.slug || categoryForm.name_en.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        icon: categoryForm.icon,
        description_en: categoryForm.description_en,
        description_ar: categoryForm.description_ar,
      };

      if (editingCategory) {
        const res = await fetch(`/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data as { error?: string }).error || `Update failed (${res.status})`);
        toast.success(locale === "ar" ? "تم تعديل الفئة" : "Category updated");
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data as { error?: string }).error || `Create failed (${res.status})`);
        toast.success(locale === "ar" ? "تم إضافة الفئة" : "Category created");
      }
      setShowCategoryForm(false);
      fetchData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Operation failed";
      toast.error(locale === "ar" ? `حصل مشكلة: ${msg}` : msg);
    }
    setSaving(false);
  }

  async function deleteCategory(id: string) {
    if (!confirm(locale === "ar" ? "متأكد إنك عايز تحذف الفئة دي؟" : "Delete this category?")) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || `Delete failed (${res.status})`);
      toast.success(locale === "ar" ? "تم حذف الفئة" : "Category deleted");
      fetchData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Delete failed";
      toast.error(locale === "ar" ? `مش قادر أحذف: ${msg}` : msg);
    }
  }

  /* ─── Build CRUD ─── */
  function openAddBuild() {
    setEditingBuild(null);
    setBuildForm(emptyBuild);
    setShowBuildForm(true);
  }

  function openEditBuild(b: BuildRow) {
    setEditingBuild(b);
    setBuildForm({
      name_en: b.name_en,
      name_ar: b.name_ar,
      description_en: b.description_en ?? "",
      description_ar: b.description_ar ?? "",
      price: b.price,
      tier: b.tier ?? "mid",
      image: b.image ?? "",
      product_ids: (b.products ?? []).map((p) => p.product_id),
    });
    setShowBuildForm(true);
  }

  function toggleBuildProduct(productId: string) {
    setBuildForm((f) => ({
      ...f,
      product_ids: f.product_ids.includes(productId)
        ? f.product_ids.filter((id) => id !== productId)
        : [...f.product_ids, productId],
    }));
  }

  async function saveBuild() {
    if (!buildForm.name_en.trim() || !buildForm.name_ar.trim()) {
      toast.error(locale === "ar" ? "اسم التجميعة مطلوب" : "Build name is required");
      return;
    }
    if (buildForm.product_ids.length === 0) {
      toast.error(locale === "ar" ? "اختر منتج واحد على الأقل" : "Select at least one product");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name_en: buildForm.name_en.trim(),
        name_ar: buildForm.name_ar.trim(),
        description_en: buildForm.description_en?.trim() || null,
        description_ar: buildForm.description_ar?.trim() || null,
        price: Number(buildForm.price) || 0,
        tier: buildForm.tier,
        image: buildForm.image?.trim() || null,
        product_ids: buildForm.product_ids,
      };
      if (editingBuild) {
        const res = await fetch(`/api/builds/${editingBuild.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data as { error?: string }).error || "Update failed");
        toast.success(locale === "ar" ? "تم تعديل التجميعة" : "Build updated");
      } else {
        const res = await fetch("/api/builds", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data as { error?: string }).error || "Create failed");
        toast.success(locale === "ar" ? "تم إضافة التجميعة" : "Build created");
      }
      setShowBuildForm(false);
      fetchData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Operation failed";
      toast.error(locale === "ar" ? `حصل مشكلة: ${msg}` : msg);
    }
    setSaving(false);
  }

  async function deleteBuild(id: string) {
    if (!confirm(locale === "ar" ? "متأكد إنك عايز تحذف التجميعة دي؟" : "Delete this build?")) return;
    try {
      const res = await fetch(`/api/builds/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || `Delete failed (${res.status})`);
      toast.success(locale === "ar" ? "تم حذف التجميعة" : "Build deleted");
      fetchData();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Delete failed";
      toast.error(locale === "ar" ? `مش قادر أحذف: ${msg}` : msg);
    }
  }

  function addBrand() {
    const b = newBrand.trim();
    if (!b || brands.includes(b)) return;
    setBrands((prev) => [...prev, b].sort());
    setNewBrand("");
    toast.success(locale === "ar" ? `تمت إضافة براند "${b}"` : `Brand "${b}" added`);
  }

  function removeBrand(b: string) {
    setBrands((prev) => prev.filter((x) => x !== b));
    toast.success(locale === "ar" ? `تم حذف براند "${b}"` : `Brand "${b}" removed`);
  }

  /* ─── Helpers ─── */
  const statCards = [
    { icon: DollarSign, label: locale === "ar" ? "إجمالي الإيرادات" : t("total_revenue"), value: formatPrice(stats.totalRevenue), change: "+12.5%" },
    { icon: ShoppingBag, label: locale === "ar" ? "الطلبات" : t("orders_today"), value: String(stats.ordersToday), change: `+${stats.ordersToday}` },
    { icon: Package, label: locale === "ar" ? "المنتجات" : t("total_products"), value: String(stats.totalProducts), change: `${stats.totalProducts}` },
    { icon: Users, label: locale === "ar" ? "الطلبات الكلية" : "Total Orders", value: String(stats.totalOrders), change: `${stats.totalOrders}` },
  ];

  const statusOptions = [
    { value: "pending", label: locale === "ar" ? "قيد الانتظار" : "Pending" },
    { value: "processing", label: locale === "ar" ? "قيد المعالجة" : "Processing" },
    { value: "shipped", label: locale === "ar" ? "تم الشحن" : "Shipped" },
    { value: "delivered", label: locale === "ar" ? "تم التوصيل" : "Delivered" },
    { value: "cancelled", label: locale === "ar" ? "ملغي" : "Cancelled" },
  ];

  function statusBadge(status: string) {
    const cls =
      status === "delivered" ? "bg-green-100 text-green-700 border-green-200"
      : status === "processing" ? "bg-blue-100 text-blue-700 border-blue-200"
      : status === "shipped" ? "bg-purple-100 text-purple-700 border-purple-200"
      : status === "cancelled" ? "bg-red-100 text-red-700 border-red-200"
      : "bg-amber-100 text-amber-700 border-amber-200";
    return <Badge className={cls}>{statusOptions.find((s) => s.value === status)?.label ?? status}</Badge>;
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderPhoneFilter.trim()) {
        const phone = (o.phone || "").replace(/\D/g, "");
        const filter = orderPhoneFilter.replace(/\D/g, "");
        if (filter && !phone.includes(filter)) return false;
      }
      const min = orderAmountMin.trim() ? Number(orderAmountMin) : null;
      const max = orderAmountMax.trim() ? Number(orderAmountMax) : null;
      if (min != null && !isNaN(min) && o.total < min) return false;
      if (max != null && !isNaN(max) && o.total > max) return false;
      if (orderStatusFilter !== "all" && o.status !== orderStatusFilter) return false;
      return true;
    });
  }, [orders, orderPhoneFilter, orderAmountMin, orderAmountMax, orderStatusFilter]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary/20 via-white to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-secondary bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/90">
              <Leaf className="h-5 w-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{locale === "ar" ? "لوحة التحكم" : t("dashboard")}</h1>
              <p className="text-xs text-foreground/60">{locale === "ar" ? "إدارة Trendy Seasons" : "Trendy Seasons Store Management"}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => router.push(`/${locale}`)} className="gap-2 border-secondary text-primary hover:bg-secondary hover:border-primary/30 transition-all">
            <ArrowLeft className="h-4 w-4" />
            {locale === "ar" ? "العودة للمتجر" : "Back to Store"}
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 bg-secondary/50 p-1.5 rounded-lg">
            {[
              { value: "dashboard", label: locale === "ar" ? "الإحصائيات" : "Dashboard" },
              { value: "products", label: locale === "ar" ? "المنتجات" : "Products" },
              { value: "orders", label: locale === "ar" ? "الطلبات" : "Orders" },
              { value: "catalog", label: locale === "ar" ? "الفئات" : "Catalog" },
              { value: "settings", label: locale === "ar" ? "الإعدادات" : "Settings" },
            ].map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all rounded-md text-xs sm:text-sm">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ═══ Dashboard ═══ */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((stat, i) => (
                <Card key={i} className="group border border-secondary bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground/60">{stat.label}</p>
                        <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
                        <p className="mt-2 flex items-center gap-1 text-xs font-medium text-green-600"><TrendingUp className="h-3.5 w-3.5" />{stat.change}</p>
                      </div>
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-primary/10 group-hover:from-primary/20 group-hover:to-primary/30 transition-all">
                        <stat.icon className="h-7 w-7 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border border-secondary bg-white shadow-sm">
              <CardHeader className="border-b border-secondary"><CardTitle className="text-xl font-bold text-foreground">{locale === "ar" ? "الطلبات الأخيرة" : t("recent_orders")}</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow className="bg-secondary/30"><TableHead className="font-semibold text-foreground">#</TableHead><TableHead className="font-semibold text-foreground">{locale === "ar" ? "العميل" : "Customer"}</TableHead><TableHead className="font-semibold text-foreground">{locale === "ar" ? "الحالة" : "Status"}</TableHead><TableHead className="font-semibold text-foreground">{locale === "ar" ? "المبلغ" : "Amount"}</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {orders.slice(0, 5).map((order) => (
                        <TableRow key={order.id} className="hover:bg-secondary/20 transition-colors">
                          <TableCell className="font-medium text-foreground">{order.id.substring(0, 8)}</TableCell>
                          <TableCell className="text-foreground/80">{order.customerName}</TableCell>
                          <TableCell>{statusBadge(order.status)}</TableCell>
                          <TableCell className="font-semibold text-primary">{formatPrice(order.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══ Products ═══ */}
          <TabsContent value="products" className="space-y-6">
            {showProductForm ? (
              <Card className="border border-secondary bg-white shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b border-secondary">
                  <CardTitle className="text-xl font-bold text-foreground">
                    {editingProduct ? (locale === "ar" ? "تعديل المنتج" : "Edit Product") : (locale === "ar" ? "إضافة منتج جديد" : "Add New Product")}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowProductForm(false)} className="hover:bg-secondary"><X className="h-4 w-4" /></Button>
                </CardHeader>
                <CardContent className="space-y-5 p-6">
                  {/* Names */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{locale === "ar" ? "اسم المنتج (إنجليزي)" : "Product Name (EN)"}</Label>
                      <Input value={productForm.name_en} onChange={(e) => setProductForm((f) => ({ ...f, name_en: e.target.value }))} className="border-secondary focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label>{locale === "ar" ? "اسم المنتج (عربي)" : "Product Name (AR)"}</Label>
                      <Input value={productForm.name_ar} onChange={(e) => setProductForm((f) => ({ ...f, name_ar: e.target.value }))} className="border-secondary focus:border-primary" dir="rtl" />
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>{locale === "ar" ? "الوصف (إنجليزي)" : "Description (EN)"}</Label>
                      <Textarea value={productForm.description_en} onChange={(e) => setProductForm((f) => ({ ...f, description_en: e.target.value }))} rows={3} className="border-secondary focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label>{locale === "ar" ? "الوصف (عربي)" : "Description (AR)"}</Label>
                      <Textarea value={productForm.description_ar} onChange={(e) => setProductForm((f) => ({ ...f, description_ar: e.target.value }))} rows={3} className="border-secondary focus:border-primary" dir="rtl" />
                    </div>
                  </div>

                  {/* Photos */}
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2"><ImagePlus className="h-4 w-4 text-primary" />{locale === "ar" ? "صور المنتج" : "Product Photos"}</Label>
                    <div className="flex flex-wrap gap-3">
                      {productForm.images.map((url) => (
                        <div key={url} className="group/img relative h-24 w-24 overflow-hidden rounded-lg border border-secondary">
                          <Image src={url} alt="" width={96} height={96} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(url)}
                            className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-5 w-5 text-white" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-primary/30 text-primary hover:bg-secondary transition-colors disabled:opacity-50"
                      >
                        {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                        <span className="text-[10px]">{locale === "ar" ? "أضف صور" : "Add photos"}</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.jpg,.jpeg,.png,.gif,.webp,.bmp,.tiff,.tif,.svg,.ico,.avif,.heic,.heif,.jfif,.apng,.jpx,.j2k"
                        multiple
                        className="hidden"
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (files?.length) {
                            for (let i = 0; i < files.length; i++) {
                              await uploadImage(files[i]);
                            }
                            e.target.value = "";
                          }
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder={locale === "ar" ? "أو الصق رابط صورة (http...)" : "Or paste image URL (http...)"}
                        value={imageUrlToAdd}
                        onChange={(e) => setImageUrlToAdd(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (imageUrlToAdd.trim().startsWith("http")) {
                              setProductForm((f) => ({ ...f, images: [...f.images, imageUrlToAdd.trim()] }));
                              setImageUrlToAdd("");
                            }
                          }
                        }}
                        className="max-w-xs border-secondary focus:border-primary"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="shrink-0 border-primary text-primary hover:bg-secondary"
                        onClick={() => {
                          if (imageUrlToAdd.trim().startsWith("http")) {
                            setProductForm((f) => ({ ...f, images: [...f.images, imageUrlToAdd.trim()] }));
                            setImageUrlToAdd("");
                          } else {
                            toast.error(locale === "ar" ? "أدخل رابط صحيح يبدأ بـ http" : "Enter a valid URL starting with http");
                          }
                        }}
                      >
                        {locale === "ar" ? "أضف" : "Add"}
                      </Button>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid gap-5 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label>{locale === "ar" ? "السعر (ج.م)" : "Price (EGP)"}</Label>
                      <Input type="number" value={productForm.price} onChange={(e) => setProductForm((f) => ({ ...f, price: Number(e.target.value) }))} className="border-secondary focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label>{locale === "ar" ? "السعر قبل الخصم" : "Compare Price"}</Label>
                      <Input type="number" value={productForm.compare_price} onChange={(e) => setProductForm((f) => ({ ...f, compare_price: Number(e.target.value) }))} className="border-secondary focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label>{locale === "ar" ? "المخزون" : "Stock"}</Label>
                      <Input type="number" value={productForm.stock} onChange={(e) => setProductForm((f) => ({ ...f, stock: Number(e.target.value) }))} className="border-secondary focus:border-primary" />
                    </div>
                    <div className="space-y-2">
                      <Label>{locale === "ar" ? "نسبة الخصم %" : "Discount %"}</Label>
                      <Input type="number" value={productForm.discount_percent} onChange={(e) => setProductForm((f) => ({ ...f, discount_percent: Number(e.target.value) }))} className="border-secondary focus:border-primary" />
                    </div>
                  </div>

                  {/* Brand / Category / Deal */}
                  <div className="grid gap-5 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>{locale === "ar" ? "البراند" : "Brand"}</Label>
                      <Select value={productForm.brand} onValueChange={(val) => setProductForm((f) => ({ ...f, brand: val }))}>
                        <SelectTrigger className="border-secondary focus:border-primary"><SelectValue placeholder={locale === "ar" ? "اختار براند" : "Select brand"} /></SelectTrigger>
                        <SelectContent>
                          {brands.map((b) => (<SelectItem key={b} value={b}>{b}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{locale === "ar" ? "الفئة" : "Category"}</Label>
                      <Select value={productForm.category_id} onValueChange={(val) => setProductForm((f) => ({ ...f, category_id: val }))}>
                        <SelectTrigger className="border-secondary focus:border-primary"><SelectValue placeholder={locale === "ar" ? "اختار فئة" : "Select category"} /></SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{locale === "ar" ? cat.name_ar : cat.name_en}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end gap-3 pb-1">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={productForm.is_deal} onChange={(e) => setProductForm((f) => ({ ...f, is_deal: e.target.checked }))} className="h-4 w-4 rounded border-secondary text-primary focus:ring-primary" />
                        <span className="text-sm font-medium text-foreground">{locale === "ar" ? "عرض خاص" : "Is Deal"}</span>
                      </label>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-secondary">
                    <Button variant="outline" onClick={() => setShowProductForm(false)} className="border-secondary">{locale === "ar" ? "إلغاء" : "Cancel"}</Button>
                    <Button onClick={saveProduct} disabled={saving || !productForm.name_en} className="gap-2 bg-primary text-white hover:bg-primary/90">
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      {locale === "ar" ? "حفظ" : "Save"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{locale === "ar" ? "المنتجات" : "Products"}</h2>
                    <p className="mt-1 text-sm text-foreground/60">{locale === "ar" ? `${products.length} منتج في المتجر` : `${products.length} products in store`}</p>
                  </div>
                  <Button onClick={openAddProduct} className="gap-2 bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg transition-all">
                    <Plus className="h-4 w-4" />{locale === "ar" ? "إضافة منتج" : "Add Product"}
                  </Button>
                </div>
                <Card className="border border-secondary bg-white shadow-sm">
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-secondary/30">
                            <TableHead className="font-semibold text-foreground">{locale === "ar" ? "المنتج" : "Product"}</TableHead>
                            <TableHead className="font-semibold text-foreground">{locale === "ar" ? "البراند" : "Brand"}</TableHead>
                            <TableHead className="font-semibold text-foreground">{locale === "ar" ? "السعر" : "Price"}</TableHead>
                            <TableHead className="font-semibold text-foreground">{locale === "ar" ? "المخزون" : "Stock"}</TableHead>
                            <TableHead className="font-semibold text-foreground">{locale === "ar" ? "الحالة" : "Status"}</TableHead>
                            <TableHead className="font-semibold text-foreground">{locale === "ar" ? "الإجراءات" : "Actions"}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product) => (
                            <TableRow key={product.id} className="hover:bg-secondary/20 transition-colors">
                              <TableCell className="font-medium text-foreground max-w-[200px] truncate">{locale === "ar" ? product.name_ar : product.name_en}</TableCell>
                              <TableCell className="text-foreground/70">{product.brand}</TableCell>
                              <TableCell className="font-semibold text-primary">{formatPrice(product.price)}</TableCell>
                              <TableCell className="text-foreground/80">{product.stock}</TableCell>
                              <TableCell><Badge className={product.stock > 0 ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>{product.stock > 0 ? (locale === "ar" ? "متوفر" : "In Stock") : (locale === "ar" ? "نفد" : "Out of Stock")}</Badge></TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm" onClick={() => openEditProduct(product)} className="hover:bg-secondary hover:text-primary"><Edit className="h-4 w-4" /></Button>
                                  <Button variant="ghost" size="sm" onClick={() => deleteProduct(product.id)} className="hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* ═══ Orders ═══ */}
          <TabsContent value="orders" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{locale === "ar" ? "الطلبات" : "Orders"}</h2>
              <p className="mt-1 text-sm text-foreground/60">{locale === "ar" ? `${filteredOrders.length} طلب` : `${filteredOrders.length} orders`}</p>
            </div>
            <div className="flex flex-wrap gap-3 items-center rounded-lg border border-secondary bg-secondary/20 p-4">
              <Input
                placeholder={locale === "ar" ? "تصفية حسب الهاتف" : "Filter by phone"}
                value={orderPhoneFilter}
                onChange={(e) => setOrderPhoneFilter(e.target.value)}
                className="w-40 h-9 border-secondary"
              />
              <Input
                type="number"
                placeholder={locale === "ar" ? "حد أدنى" : "Min amount"}
                value={orderAmountMin}
                onChange={(e) => setOrderAmountMin(e.target.value)}
                className="w-28 h-9 border-secondary"
              />
              <Input
                type="number"
                placeholder={locale === "ar" ? "حد أقصى" : "Max amount"}
                value={orderAmountMax}
                onChange={(e) => setOrderAmountMax(e.target.value)}
                className="w-28 h-9 border-secondary"
              />
              <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                <SelectTrigger className="w-36 h-9 border-secondary"><SelectValue placeholder={locale === "ar" ? "الحالة" : "Status"} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{locale === "ar" ? "الكل" : "All"}</SelectItem>
                  {statusOptions.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <Card className="border border-secondary bg-white shadow-sm">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30">
                        <TableHead className="font-semibold text-foreground">#</TableHead>
                        <TableHead className="font-semibold text-foreground">{locale === "ar" ? "العميل" : "Customer"}</TableHead>
                        <TableHead className="font-semibold text-foreground">{locale === "ar" ? "التاريخ" : "Date"}</TableHead>
                        <TableHead className="font-semibold text-foreground">{locale === "ar" ? "المبلغ" : "Amount"}</TableHead>
                        <TableHead className="font-semibold text-foreground">{locale === "ar" ? "الدفع" : "Payment"}</TableHead>
                        <TableHead className="font-semibold text-foreground">{locale === "ar" ? "الحالة" : "Status"}</TableHead>
                        <TableHead className="font-semibold text-foreground">{locale === "ar" ? "العناصر" : "Items"}</TableHead>
                        <TableHead className="font-semibold text-foreground">{locale === "ar" ? "تغيير" : "Update"}</TableHead>
                        <TableHead className="font-semibold text-foreground">{locale === "ar" ? "حذف" : "Delete"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-secondary/20 transition-colors">
                          <TableCell className="font-medium text-foreground">{order.id.substring(0, 8)}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{order.customerName}</p>
                              <p className="text-xs text-foreground/50">{order.phone || order.customerEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground/60">{order.createdAt?.substring(0, 10)}</TableCell>
                          <TableCell className="font-semibold text-primary">{formatPrice(order.total)}</TableCell>
                          <TableCell className="text-foreground/70">
                            {order.paymentMethod === "cod" ? (locale === "ar" ? "كاش" : "COD") : order.paymentMethod === "instapay" ? "InstaPay" : order.paymentMethod === "vodafone_cash" ? (locale === "ar" ? "فودافون كاش" : "Vodafone Cash") : order.paymentMethod}
                          </TableCell>
                          <TableCell>{statusBadge(order.status)}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="hover:bg-secondary hover:text-primary">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader>
                                  <DialogTitle>{locale === "ar" ? `طلب #${order.id.substring(0, 8)}` : `Order #${order.id.substring(0, 8)}`}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <p className="text-muted-foreground">{locale === "ar" ? "العميل" : "Customer"}</p>
                                    <p className="font-medium">{order.customerName}</p>
                                    <p className="text-muted-foreground">{locale === "ar" ? "الهاتف" : "Phone"}</p>
                                    <p className="font-medium">{order.phone || "—"}</p>
                                    <p className="text-muted-foreground">{locale === "ar" ? "العنوان" : "Address"}</p>
                                    <p className="font-medium col-span-1">{order.shippingAddress || "—"}</p>
                                    <p className="text-muted-foreground">{locale === "ar" ? "الإجمالي" : "Total"}</p>
                                    <p className="font-semibold text-primary">{formatPrice(order.total)}</p>
                                  </div>
                                  <div>
                                    <p className="mb-2 font-medium text-sm">{locale === "ar" ? "العناصر" : "Order Items"}</p>
                                    {(order.items ?? []).length > 0 ? (
                                      <div className="rounded-lg border border-secondary divide-y divide-secondary">
                                        {(order.items ?? []).map((item: { productId?: string; name: string; quantity: number; price: number }, idx: number) => (
                                          <div key={item.productId || idx} className="flex items-center justify-between px-3 py-2 text-sm">
                                            <span className="text-foreground">{item.name} × {item.quantity}</span>
                                            <span className="font-medium text-primary">{formatPrice((item.price ?? 0) * (item.quantity ?? 1))}</span>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">{locale === "ar" ? "لا توجد عناصر مسجلة" : "No items recorded"}</p>
                                    )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                          <TableCell>
                            <Select value={order.status} onValueChange={(val) => updateOrderStatus(order.id, val)}>
                              <SelectTrigger className="h-8 w-[120px] border-secondary text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>{statusOptions.map((s) => (<SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>))}</SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" onClick={() => deleteOrder(order.id)} className="hover:bg-red-50 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* ═══ Catalog (Categories + Brands) ═══ */}
          <TabsContent value="catalog" className="space-y-8">
            {/* Categories Section */}
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <FolderTree className="h-6 w-6 text-primary" />
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{locale === "ar" ? "الفئات" : "Categories"}</h2>
                    <p className="text-sm text-foreground/60">{locale === "ar" ? `${categories.length} فئة` : `${categories.length} categories`}</p>
                  </div>
                </div>
                <Button onClick={openAddCategory} className="gap-2 bg-primary text-white hover:bg-primary/90 shadow-md">
                  <Plus className="h-4 w-4" />{locale === "ar" ? "إضافة فئة" : "Add Category"}
                </Button>
              </div>

              {showCategoryForm && (
                <Card className="border border-primary/30 bg-white shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between border-b border-secondary">
                    <CardTitle className="text-lg font-bold text-foreground">
                      {editingCategory ? (locale === "ar" ? "تعديل الفئة" : "Edit Category") : (locale === "ar" ? "إضافة فئة جديدة" : "New Category")}
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setShowCategoryForm(false)}><X className="h-4 w-4" /></Button>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{locale === "ar" ? "اسم الفئة (إنجليزي)" : "Name (EN)"}</Label>
                        <Input value={categoryForm.name_en} onChange={(e) => setCategoryForm((f) => ({ ...f, name_en: e.target.value }))} className="border-secondary focus:border-primary" />
                      </div>
                      <div className="space-y-2">
                        <Label>{locale === "ar" ? "اسم الفئة (عربي)" : "Name (AR)"}</Label>
                        <Input value={categoryForm.name_ar} onChange={(e) => setCategoryForm((f) => ({ ...f, name_ar: e.target.value }))} className="border-secondary focus:border-primary" dir="rtl" />
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input value={categoryForm.slug} onChange={(e) => setCategoryForm((f) => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" className="border-secondary focus:border-primary" />
                      </div>
                      <div className="space-y-2">
                        <Label>{locale === "ar" ? "الأيقونة" : "Icon"}</Label>
                        <Select value={categoryForm.icon} onValueChange={(val) => setCategoryForm((f) => ({ ...f, icon: val }))}>
                          <SelectTrigger className="border-secondary focus:border-primary"><SelectValue /></SelectTrigger>
                          <SelectContent>{ICON_OPTIONS.map((ic) => (<SelectItem key={ic} value={ic}>{ic}</SelectItem>))}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>{locale === "ar" ? "الوصف (إنجليزي)" : "Description (EN)"}</Label>
                        <Input value={categoryForm.description_en} onChange={(e) => setCategoryForm((f) => ({ ...f, description_en: e.target.value }))} className="border-secondary focus:border-primary" />
                      </div>
                      <div className="space-y-2">
                        <Label>{locale === "ar" ? "الوصف (عربي)" : "Description (AR)"}</Label>
                        <Input value={categoryForm.description_ar} onChange={(e) => setCategoryForm((f) => ({ ...f, description_ar: e.target.value }))} className="border-secondary focus:border-primary" dir="rtl" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-3 border-t border-secondary">
                      <Button variant="outline" onClick={() => setShowCategoryForm(false)} className="border-secondary">{locale === "ar" ? "إلغاء" : "Cancel"}</Button>
                      <Button onClick={saveCategory} disabled={saving || !categoryForm.name_en} className="gap-2 bg-primary text-white hover:bg-primary/90">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {locale === "ar" ? "حفظ" : "Save"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border border-secondary bg-white shadow-sm">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-secondary/30">
                          <TableHead className="font-semibold text-foreground">{locale === "ar" ? "الاسم (EN)" : "Name (EN)"}</TableHead>
                          <TableHead className="font-semibold text-foreground">{locale === "ar" ? "الاسم (AR)" : "Name (AR)"}</TableHead>
                          <TableHead className="font-semibold text-foreground">Slug</TableHead>
                          <TableHead className="font-semibold text-foreground">{locale === "ar" ? "الأيقونة" : "Icon"}</TableHead>
                          <TableHead className="font-semibold text-foreground">{locale === "ar" ? "الإجراءات" : "Actions"}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((cat) => (
                          <TableRow key={cat.id} className="hover:bg-secondary/20 transition-colors">
                            <TableCell className="font-medium text-foreground">{cat.name_en}</TableCell>
                            <TableCell className="text-foreground/80" dir="rtl">{cat.name_ar}</TableCell>
                            <TableCell className="text-foreground/60 font-mono text-xs">{cat.slug}</TableCell>
                            <TableCell className="text-primary">{cat.icon}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => openEditCategory(cat)} className="hover:bg-secondary hover:text-primary"><Edit className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="sm" onClick={() => deleteCategory(cat.id)} className="hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Brands Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Tag className="h-6 w-6 text-primary" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{locale === "ar" ? "البراندات" : "Brands"}</h2>
                  <p className="text-sm text-foreground/60">{locale === "ar" ? `${brands.length} براند` : `${brands.length} brands`}</p>
                </div>
              </div>

              <Card className="border border-secondary bg-white shadow-sm">
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-3">
                    <Input
                      value={newBrand}
                      onChange={(e) => setNewBrand(e.target.value)}
                      placeholder={locale === "ar" ? "اكتب اسم البراند الجديد..." : "Enter new brand name..."}
                      className="border-secondary focus:border-primary"
                      onKeyDown={(e) => { if (e.key === "Enter") addBrand(); }}
                    />
                    <Button onClick={addBrand} disabled={!newBrand.trim()} className="gap-2 bg-primary text-white hover:bg-primary/90 shrink-0">
                      <Plus className="h-4 w-4" />{locale === "ar" ? "أضف" : "Add"}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {brands.map((b) => (
                      <Badge key={b} className="gap-1.5 bg-secondary text-primary border-primary/20 px-3 py-1.5 text-sm hover:bg-primary/10">
                        {b}
                        <button type="button" onClick={() => removeBrand(b)} className="hover:text-red-500 transition-colors">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {brands.length === 0 && (
                      <p className="text-sm text-foreground/40">{locale === "ar" ? "لا توجد براندات بعد" : "No brands yet"}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ═══ Settings ═══ */}
          <TabsContent value="settings" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">{locale === "ar" ? "الإعدادات" : "Settings"}</h2>
              <p className="mt-1 text-sm text-foreground/60">{locale === "ar" ? "إعدادات المتجر العامة" : "General store settings"}</p>
            </div>
            <Card className="border border-secondary bg-white shadow-sm">
              <CardHeader className="border-b border-secondary">
                <CardTitle className="text-xl font-bold text-foreground">{locale === "ar" ? "إعدادات المتجر" : "Store Settings"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 p-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">{locale === "ar" ? "اسم المتجر" : "Store Name"}</Label>
                  <Input defaultValue="Trendy Seasons" className="border-secondary focus:border-primary focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">{locale === "ar" ? "عنوان المتجر" : "Store Address"}</Label>
                  <Input defaultValue="Cairo, Egypt" className="border-secondary focus:border-primary focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">{locale === "ar" ? "هاتف المتجر" : "Store Phone"}</Label>
                  <Input defaultValue="+20 123 456 7890" className="border-secondary focus:border-primary focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">{locale === "ar" ? "بريد المتجر" : "Store Email"}</Label>
                  <Input defaultValue="support@trendyseasons.com" className="border-secondary focus:border-primary focus:ring-primary/20" />
                </div>
                <div className="rounded-lg border border-secondary bg-secondary/20 p-4">
                  <h3 className="font-semibold text-foreground">{locale === "ar" ? "حالة قاعدة البيانات" : "Database Status"}</h3>
                  <p className="mt-1 text-sm text-foreground/60">
                    {stats.source === "neon"
                      ? (locale === "ar" ? "متصل بـ Neon ✓" : "Connected to Neon ✓")
                      : (locale === "ar" ? "يعمل ببيانات محلية — أضف DATABASE_URL للتفعيل" : "Using local data — add DATABASE_URL to connect")}
                  </p>
                </div>
                <div className="pt-4">
                  <Button className="bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg transition-all">{locale === "ar" ? "حفظ الإعدادات" : "Save Settings"}</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
