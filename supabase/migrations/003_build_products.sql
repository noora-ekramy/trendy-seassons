-- Trendy Seasons - Build Products (Builds as list of products)
-- Run this in Supabase SQL Editor AFTER 001 and 002

-- Junction table: build <-> products (build = list of products)
CREATE TABLE IF NOT EXISTS build_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES builds(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(build_id, product_id)
);

-- Enable RLS
ALTER TABLE build_products ENABLE ROW LEVEL SECURITY;

-- Public read for storefront
CREATE POLICY "Public read build_products" ON build_products FOR SELECT USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_build_products_build ON build_products(build_id);
CREATE INDEX IF NOT EXISTS idx_build_products_product ON build_products(product_id);

-- Remove dummy/seed builds (builds will come from admin only)
DELETE FROM builds;
