-- ==============================================================================
-- معرض المنتجات والعروض الشامل - قاعدة بيانات Supabase (PostgreSQL Schema)
-- ==============================================================================

-- تفعيل ملحق UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. جدول إعدادات المتجر (store_settings)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.store_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name TEXT NOT NULL DEFAULT 'معرض المنتجات والعروض الشامل',
    whatsapp_number TEXT NOT NULL DEFAULT '967733556683',
    currency TEXT NOT NULL DEFAULT 'ر.ي',
    description TEXT DEFAULT 'وجهتك الأولى للتسوق الشامل بأفضل العروض والخصومات الحصرية',
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ------------------------------------------------------------------------------
-- 2. جدول الأقسام الهرمي (categories)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    icon_or_image TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories(display_order);

-- ------------------------------------------------------------------------------
-- 3. جدول المنتجات (products)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    target_audience TEXT[] NOT NULL DEFAULT ARRAY['عام']::TEXT[],
    name TEXT NOT NULL,
    description TEXT,
    base_price NUMERIC(12, 2) NOT NULL CHECK (base_price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),
    images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    variants JSONB NOT NULL DEFAULT '[]'::JSONB,
    is_visible BOOLEAN NOT NULL DEFAULT true,
    views_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);

CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_visible ON public.products(is_visible);
CREATE INDEX IF NOT EXISTS idx_products_target_audience ON public.products USING GIN (target_audience);
CREATE INDEX IF NOT EXISTS idx_products_views_count ON public.products(views_count DESC);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- ------------------------------------------------------------------------------
-- 4. جدول العروض المجدولة (offers)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    discount_price NUMERIC(12, 2) NOT NULL CHECK (discount_price >= 0),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    clicks_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT check_dates CHECK (end_date > start_date)
);

CREATE INDEX IF NOT EXISTS idx_offers_product_id ON public.offers(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_dates ON public.offers(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_offers_active ON public.offers(is_active);

-- ------------------------------------------------------------------------------
-- 5. جدول عروض الباقات (bundles)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bundles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    bundle_price NUMERIC(12, 2) NOT NULL CHECK (bundle_price >= 0),
    original_total_price NUMERIC(12, 2) NOT NULL CHECK (original_total_price >= 0),
    image_url TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    clicks_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT check_bundle_dates CHECK (end_date > start_date)
);

CREATE INDEX IF NOT EXISTS idx_bundles_dates ON public.bundles(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_bundles_active ON public.bundles(is_active);

-- ------------------------------------------------------------------------------
-- 6. جدول عناصر الباقات (bundle_items)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bundle_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bundle_id UUID NOT NULL REFERENCES public.bundles(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle_id ON public.bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_product_id ON public.bundle_items(product_id);

-- ------------------------------------------------------------------------------
-- 7. الدوال البرمجية (RPC Functions)
-- ------------------------------------------------------------------------------

-- دالة زيادة عدد مشاهدات المنتج بأمان
CREATE OR REPLACE FUNCTION public.increment_product_views(row_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.products
    SET views_count = views_count + 1
    WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- دالة زيادة عدد النقرات على العرض أو الباقة
CREATE OR REPLACE FUNCTION public.increment_offer_clicks(row_id UUID, is_bundle BOOLEAN DEFAULT FALSE)
RETURNS VOID AS $$
BEGIN
    IF is_bundle THEN
        UPDATE public.bundles
        SET clicks_count = clicks_count + 1
        WHERE id = row_id;
    ELSE
        UPDATE public.offers
        SET clicks_count = clicks_count + 1
        WHERE id = row_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 8. سياسات الأمان على مستوى الصفوف (Row Level Security - RLS)
-- ------------------------------------------------------------------------------

-- دالة مساعدة محكمة للتحقق من صلاحيات المدير (Admin Check)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        auth.role() = 'authenticated' AND (
            (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin' OR
            (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
            (auth.jwt() ->> 'email') = 'motasemwpersonal@gmail.com' OR
            (auth.jwt() ->> 'email') ILIKE '%admin%'
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- تفعيل RLS على جميع الجداول
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;

-- 8.1 سياسات إعدادات المتجر (store_settings)
CREATE POLICY "Public read store settings" ON public.store_settings
    FOR SELECT TO public USING (true);

CREATE POLICY "Admin update store settings" ON public.store_settings
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8.2 سياسات الأقسام (categories)
CREATE POLICY "Public read active categories" ON public.categories
    FOR SELECT TO public USING (is_active = true OR public.is_admin());

CREATE POLICY "Admin manage categories" ON public.categories
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8.3 سياسات المنتجات (products)
CREATE POLICY "Public read visible products" ON public.products
    FOR SELECT TO public USING (is_visible = true OR public.is_admin());

CREATE POLICY "Admin manage products" ON public.products
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8.4 سياسات العروض (offers)
CREATE POLICY "Public read active offers" ON public.offers
    FOR SELECT TO public USING (
        (is_active = true AND NOW() >= start_date AND NOW() <= end_date) OR public.is_admin()
    );

CREATE POLICY "Admin manage offers" ON public.offers
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8.5 سياسات الباقات (bundles)
CREATE POLICY "Public read active bundles" ON public.bundles
    FOR SELECT TO public USING (
        (is_active = true AND NOW() >= start_date AND NOW() <= end_date) OR public.is_admin()
    );

CREATE POLICY "Admin manage bundles" ON public.bundles
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8.6 سياسات عناصر الباقات (bundle_items)
CREATE POLICY "Public read bundle items" ON public.bundle_items
    FOR SELECT TO public USING (
        public.is_admin() OR
        EXISTS (
            SELECT 1 FROM public.bundles b
            WHERE b.id = bundle_items.bundle_id
            AND b.is_active = true
            AND NOW() >= b.start_date
            AND NOW() <= b.end_date
        )
    );

CREATE POLICY "Admin manage bundle items" ON public.bundle_items
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 9. إعداد مساحة التخزين (Supabase Storage Bucket: product-images)
-- ------------------------------------------------------------------------------

-- إنشاء الحاوية إن لم تكن موجودة وجعلها عامة للقراءة
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- سياسات تخزين الصور المحكمة
CREATE POLICY "Public view product images" ON storage.objects
    FOR SELECT TO public
    USING (bucket_id = 'product-images');

CREATE POLICY "Admin upload product images" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admin update product images" ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = 'product-images' AND public.is_admin())
    WITH CHECK (bucket_id = 'product-images' AND public.is_admin());

CREATE POLICY "Admin delete product images" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'product-images' AND public.is_admin());

-- ------------------------------------------------------------------------------
-- 10. البيانات الأولية (Seed Data)
-- ------------------------------------------------------------------------------

-- إدخال إعدادات المتجر الافتراضية
INSERT INTO public.store_settings (store_name, whatsapp_number, currency, description)
VALUES (
    'معرض المنتجات والعروض الشامل',
    '967733556683',
    'ر.ي',
    'وجهتك المتكاملة لأفضل المنتجات والعروض الحصرية للأجهزة، العناية، والمستلزمات'
) ON CONFLICT DO NOTHING;

-- إدخال الأقسام الرئيسية والفرعية
DO $$
DECLARE
    cat_women UUID;
    cat_men UUID;
    cat_kids UUID;
    cat_electronics UUID;
    cat_accessories UUID;
BEGIN
    -- 1. العناية بالمرأة
    INSERT INTO public.categories (name, slug, icon_or_image, display_order, is_active)
    VALUES ('العناية بالمرأة', 'women-care', 'Sparkles', 1, true)
    RETURNING id INTO cat_women;

    INSERT INTO public.categories (name, slug, parent_id, display_order, is_active) VALUES
    ('عناية بالبشرة', 'skin-care-women', cat_women, 1, true),
    ('عناية بالشعر', 'hair-care-women', cat_women, 2, true),
    ('مكياج وتجميل', 'makeup', cat_women, 3, true),
    ('عطور نسائية', 'perfumes-women', cat_women, 4, true);

    -- 2. العناية بالرجل
    INSERT INTO public.categories (name, slug, icon_or_image, display_order, is_active)
    VALUES ('العناية بالرجل', 'men-care', 'UserCheck', 2, true)
    RETURNING id INTO cat_men;

    INSERT INTO public.categories (name, slug, parent_id, display_order, is_active) VALUES
    ('حلاقة وتشذيب', 'shaving-grooming', cat_men, 1, true),
    ('عطور رجالية', 'perfumes-men', cat_men, 2, true),
    ('عناية شخصية', 'personal-care-men', cat_men, 3, true);

    -- 3. مستلزمات الأطفال
    INSERT INTO public.categories (name, slug, icon_or_image, display_order, is_active)
    VALUES ('مستلزمات الأطفال', 'kids-care', 'Baby', 3, true)
    RETURNING id INTO cat_kids;

    INSERT INTO public.categories (name, slug, parent_id, display_order, is_active) VALUES
    ('ألعاب تعليمية وترفيه', 'toys-learning', cat_kids, 1, true),
    ('تغذية ورضاعة', 'feeding-baby', cat_kids, 2, true),
    ('عناية وصحة الطفل', 'baby-health-care', cat_kids, 3, true);

    -- 4. أجهزة وكهربائيات
    INSERT INTO public.categories (name, slug, icon_or_image, display_order, is_active)
    VALUES ('أجهزة وكهربائيات', 'electronics', 'Zap', 4, true)
    RETURNING id INTO cat_electronics;

    INSERT INTO public.categories (name, slug, parent_id, display_order, is_active) VALUES
    ('أجهزة المطبخ الحديثة', 'kitchen-appliances', cat_electronics, 1, true),
    ('إضاءة وأجهزة ذكية', 'smart-lighting', cat_electronics, 2, true),
    ('أجهزة تصفيف وعناية كهربائية', 'electric-styling', cat_electronics, 3, true);

    -- 5. إكسسوارات ومنوعات
    INSERT INTO public.categories (name, slug, icon_or_image, display_order, is_active)
    VALUES ('إكسسوارات ومنوعات', 'accessories', 'Watch', 5, true)
    RETURNING id INTO cat_accessories;

    INSERT INTO public.categories (name, slug, parent_id, display_order, is_active) VALUES
    ('ساعات ذكية وأساور', 'smartwatches', cat_accessories, 1, true),
    ('حقائب ومحافظ', 'bags-wallets', cat_accessories, 2, true),
    ('إكسسوارات الهواتف والسيارات', 'phone-car-accessories', cat_accessories, 3, true);

END $$;
