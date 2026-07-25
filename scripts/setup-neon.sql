-- Trendy Seasons — Neon Postgres schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT DEFAULT 'Leaf',
  description_en TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  product_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT DEFAULT '',
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  description TEXT DEFAULT '',
  description_en TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  compare_price NUMERIC(12, 2),
  image_url TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand TEXT DEFAULT '',
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  stock INTEGER DEFAULT 0,
  rating NUMERIC(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  specs JSONB DEFAULT '{}'::jsonb,
  is_deal BOOLEAN DEFAULT false,
  discount_percent INTEGER DEFAULT 0,
  condition TEXT DEFAULT 'new',
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  address TEXT DEFAULT '',
  payment_method TEXT DEFAULT '',
  total NUMERIC(12, 2) DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  -- TEXT so mock IDs (prod-4) and Neon UUIDs both work for order history
  product_id TEXT,
  product_name TEXT DEFAULT '',
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(12, 2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en TEXT NOT NULL DEFAULT '',
  name_ar TEXT NOT NULL DEFAULT '',
  description_en TEXT DEFAULT '',
  description_ar TEXT DEFAULT '',
  price NUMERIC(12, 2) DEFAULT 0,
  tier TEXT DEFAULT 'mid',
  image TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS build_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (build_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_deal ON products(is_deal);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);

-- Seed fashion categories (skip if already present)
INSERT INTO categories (id, name_en, name_ar, slug, icon, description_en, description_ar, product_count)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'Bags', 'شنط', 'bags', 'ShoppingBag', 'Totes, crossbody bags, and summer straw handbags', 'شنط tote وcrossbody وشنط القش للصيف', 0),
  ('11111111-1111-1111-1111-111111111102', 'Scarves & Wraps', 'طرح وشالات', 'scarves-wraps', 'Wind', 'Light linen scarves and elegant summer wraps', 'طرح كتان خفيفة وشالات صيفية أنيقة', 0),
  ('11111111-1111-1111-1111-111111111103', 'Makeup', 'ميك أب', 'makeup', 'Sparkles', 'Lipsticks, blush, and glow essentials', 'أحمر شفاه، بلاشر، وأساسيات الإشراق', 0),
  ('11111111-1111-1111-1111-111111111104', 'Skincare & Sunscreen', 'عناية بالبشرة وواقي شمس', 'skincare-sunscreen', 'Sun', 'SPF protection and hydrating summer skincare', 'حماية SPF وعناية مرطبة للصيف', 0),
  ('11111111-1111-1111-1111-111111111105', 'Sunglasses', 'نظارات شمسية', 'sunglasses', 'Glasses', 'UV-protection sunglasses in trendy styles', 'نظارات شمسية بحماية UV', 0),
  ('11111111-1111-1111-1111-111111111106', 'Accessories', 'إكسسوارات', 'accessories', 'Gem', 'Jewelry, hair clips, and chic summer add-ons', 'مجوهرات ومشابك شعر وإكسسوارات', 0),
  ('11111111-1111-1111-1111-111111111107', 'Summer Dresses', 'فساتين صيفية', 'summer-dresses', 'Shirt', 'Flowy dresses and linen styles', 'فساتين فلوي وستايلات كتان', 0),
  ('11111111-1111-1111-1111-111111111108', 'Sandals', 'صنادل', 'sandals', 'Footprints', 'Comfortable sandals and slides', 'صنادل مريحة وslides', 0)
ON CONFLICT (slug) DO NOTHING;
