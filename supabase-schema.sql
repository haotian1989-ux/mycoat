-- MYCOAT Supabase Database Schema
-- 在 Supabase SQL Editor 中执行此脚本（上线云模式前）

-- 产品表（羽绒服）
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('men', 'women', 'unisex')),
  subcategory TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  details JSONB NOT NULL DEFAULT '[]',
  materials TEXT NOT NULL DEFAULT '',
  dimensions TEXT NOT NULL DEFAULT '',
  colors JSONB NOT NULL DEFAULT '[]',
  sizes JSONB NOT NULL DEFAULT '[]',
  images JSONB NOT NULL DEFAULT '[]',
  video_url TEXT NOT NULL DEFAULT '',
  in_stock BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  new_arrival BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 子分类（男装/女装下挂）
CREATE TABLE IF NOT EXISTS product_subcategories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('men', 'women', 'unisex')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 首页 Hero
CREATE TABLE IF NOT EXISTS homepage_hero (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id = true),
  image TEXT NOT NULL DEFAULT '',
  tagline TEXT NOT NULL DEFAULT '',
  headline TEXT NOT NULL DEFAULT '',
  subtext TEXT NOT NULL DEFAULT '',
  primary_btn_label TEXT NOT NULL DEFAULT '',
  secondary_btn_label TEXT NOT NULL DEFAULT '',
  promise_title TEXT NOT NULL DEFAULT '',
  promise_1_title TEXT NOT NULL DEFAULT '',
  promise_1_text TEXT NOT NULL DEFAULT '',
  promise_2_title TEXT NOT NULL DEFAULT '',
  promise_2_text TEXT NOT NULL DEFAULT '',
  promise_3_title TEXT NOT NULL DEFAULT '',
  promise_3_text TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO homepage_hero (id) VALUES (true) ON CONFLICT DO NOTHING;

-- 首页区块
CREATE TABLE IF NOT EXISTS homepage_sections (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  link TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 联系方式
CREATE TABLE IF NOT EXISTS contact_links (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('whatsapp', 'telegram')),
  label TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Our Story / About 页面
CREATE TABLE IF NOT EXISTS about_page (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id = true),
  hero_image TEXT NOT NULL DEFAULT '',
  hero_tagline TEXT NOT NULL DEFAULT '',
  hero_title TEXT NOT NULL DEFAULT '',
  section1_label TEXT NOT NULL DEFAULT '',
  section1_heading TEXT NOT NULL DEFAULT '',
  section1_text TEXT NOT NULL DEFAULT '',
  section1_image TEXT NOT NULL DEFAULT '',
  section2_label TEXT NOT NULL DEFAULT '',
  section2_heading TEXT NOT NULL DEFAULT '',
  section2_text TEXT NOT NULL DEFAULT '',
  section2_image TEXT NOT NULL DEFAULT '',
  cta_text TEXT NOT NULL DEFAULT '',
  cta_link TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO about_page (id) VALUES (true) ON CONFLICT DO NOTHING;

-- 支付设置（PayPal + USDT；前台结算页需公开读取收款信息）
CREATE TABLE IF NOT EXISTS payment_settings (
  id BOOLEAN PRIMARY KEY DEFAULT true CHECK (id = true),
  paypal_username TEXT NOT NULL DEFAULT '',
  paypal_email TEXT NOT NULL DEFAULT '',
  usdt_address TEXT NOT NULL DEFAULT '',
  usdt_network TEXT NOT NULL DEFAULT 'TRC-20 (Tron Network)',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO payment_settings (id) VALUES (true) ON CONFLICT DO NOTHING;

-- 客户订单（结算页提交，含支付方式）
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  postal_code TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  items JSONB NOT NULL DEFAULT '[]',
  subtotal INTEGER NOT NULL DEFAULT 0,
  shipping INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 评论
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  author TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 权限策略 ──
-- 前台（anon key）只读目录/首页/联系方式/关于/支付设置；
-- 客户可提交订单和评论（INSERT）；
-- 所有增删改由服务端 /api/admin 使用 service_role key 完成（service_role 默认绕过 RLS）。
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_hero ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 清理旧版宽松写策略（避免重复执行后仍保留 public_insert/update/delete）
DROP POLICY IF EXISTS "public_read" ON products;
DROP POLICY IF EXISTS "public_insert" ON products;
DROP POLICY IF EXISTS "public_update" ON products;
DROP POLICY IF EXISTS "public_delete" ON products;
DROP POLICY IF EXISTS "public_read" ON product_subcategories;
DROP POLICY IF EXISTS "public_insert" ON product_subcategories;
DROP POLICY IF EXISTS "public_update" ON product_subcategories;
DROP POLICY IF EXISTS "public_delete" ON product_subcategories;
DROP POLICY IF EXISTS "public_read" ON homepage_hero;
DROP POLICY IF EXISTS "public_insert" ON homepage_hero;
DROP POLICY IF EXISTS "public_update" ON homepage_hero;
DROP POLICY IF EXISTS "public_read" ON homepage_sections;
DROP POLICY IF EXISTS "public_insert" ON homepage_sections;
DROP POLICY IF EXISTS "public_update" ON homepage_sections;
DROP POLICY IF EXISTS "public_delete" ON homepage_sections;
DROP POLICY IF EXISTS "public_read" ON contact_links;
DROP POLICY IF EXISTS "public_insert" ON contact_links;
DROP POLICY IF EXISTS "public_update" ON contact_links;
DROP POLICY IF EXISTS "public_delete" ON contact_links;
DROP POLICY IF EXISTS "public_read" ON about_page;
DROP POLICY IF EXISTS "public_insert" ON about_page;
DROP POLICY IF EXISTS "public_update" ON about_page;
DROP POLICY IF EXISTS "public_read" ON orders;
DROP POLICY IF EXISTS "public_insert" ON orders;
DROP POLICY IF EXISTS "public_update" ON orders;
DROP POLICY IF EXISTS "public_delete" ON orders;
DROP POLICY IF EXISTS "public_read" ON reviews;
DROP POLICY IF EXISTS "public_insert" ON reviews;

CREATE POLICY "public_read" ON products FOR SELECT USING (true);
CREATE POLICY "public_read" ON product_subcategories FOR SELECT USING (true);
CREATE POLICY "public_read" ON homepage_hero FOR SELECT USING (true);
CREATE POLICY "public_read" ON homepage_sections FOR SELECT USING (true);
CREATE POLICY "public_read" ON contact_links FOR SELECT USING (true);
CREATE POLICY "public_read" ON about_page FOR SELECT USING (true);
CREATE POLICY "public_read" ON payment_settings FOR SELECT USING (true);
CREATE POLICY "public_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "public_read" ON reviews FOR SELECT USING (true);
CREATE POLICY "public_insert" ON reviews FOR INSERT WITH CHECK (true);
