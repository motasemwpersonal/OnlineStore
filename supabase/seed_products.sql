-- ==============================================================================
-- إضافة منتجات وعروض وباقات تجريبية أولية إلى قاعدة بيانات Supabase
-- لتظهر المنتجات مباشرة في الموقع المنشور
-- ==============================================================================

DO $$
DECLARE
    -- معرفات الأقسام الفرعية من جدول categories
    cat_skin UUID;
    cat_shave UUID;
    cat_watch UUID;
    cat_toy UUID;
    cat_kitchen UUID;
    cat_makeup UUID;

    -- معرفات المنتجات الجديدة
    p1 UUID;
    p2 UUID;
    p3 UUID;
    p4 UUID;
    p5 UUID;
    p6 UUID;

    -- معرفات الباقات
    b1 UUID;
    b2 UUID;
BEGIN
    -- جلب معرفات الأقسام الفرعية حسب slug
    SELECT id INTO cat_skin FROM public.categories WHERE slug = 'skin-care-women' LIMIT 1;
    SELECT id INTO cat_shave FROM public.categories WHERE slug = 'shaving-grooming' LIMIT 1;
    SELECT id INTO cat_watch FROM public.categories WHERE slug = 'smartwatches' LIMIT 1;
    SELECT id INTO cat_toy FROM public.categories WHERE slug = 'toys-learning' LIMIT 1;
    SELECT id INTO cat_kitchen FROM public.categories WHERE slug = 'kitchen-appliances' LIMIT 1;
    SELECT id INTO cat_makeup FROM public.categories WHERE slug = 'makeup' LIMIT 1;

    -- التأكد من وجود الأقسام أولاً
    IF cat_skin IS NULL THEN
        RAISE EXCEPTION 'يرجى تشغيل ملف schema.sql أولاً لإنشاء الأقسام قبل إدراج المنتجات!';
    END IF;

    -- 1. سيروم الهيالورونيك
    INSERT INTO public.products (
        category_id, target_audience, name, description,
        base_price, stock_quantity, low_stock_threshold,
        images, variants, is_visible, views_count
    ) VALUES (
        cat_skin,
        ARRAY['نساء', 'عام']::TEXT[],
        'سيروم الهيالورونيك وفيتامين سي المركز لترطيب البشرة',
        'تركيبة متطورة تمنح بشرتك نضارة فورية وترطيباً عميقاً يدوم 48 ساعة، يقلل من ظهور الخطوط الدقيقة ويوحد لون البشرة.',
        24000, 15, 5,
        ARRAY[
            'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1608248597359-07b98d36183f?auto=format&fit=crop&w=800&q=80'
        ]::TEXT[],
        '[{"name": "الحجم", "options": ["30 مل", "50 مل"]}]'::JSONB,
        true, 142
    ) RETURNING id INTO p1;

    -- 2. ماكينة حلاقة
    INSERT INTO public.products (
        category_id, target_audience, name, description,
        base_price, stock_quantity, low_stock_threshold,
        images, variants, is_visible, views_count
    ) VALUES (
        cat_shave,
        ARRAY['رجال']::TEXT[],
        'ماكينة حلاقة وتشذيب اللحية الاحترافية المقاومة للماء',
        'محرك ياباني قوي مع شفرات تيتانيوم حادة قابلة للغسل، بطارية ليثيوم تدوم 120 دقيقة وشاشة رقمية توضح نسبة الشحن.',
        32000, 4, 5,
        ARRAY[
            'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80'
        ]::TEXT[],
        '[{"name": "اللون", "options": ["أسود كربوني", "فضي مطفي"]}]'::JSONB,
        true, 98
    ) RETURNING id INTO p2;

    -- 3. ساعة ذكية
    INSERT INTO public.products (
        category_id, target_audience, name, description,
        base_price, stock_quantity, low_stock_threshold,
        images, variants, is_visible, views_count
    ) VALUES (
        cat_watch,
        ARRAY['رجال', 'نساء', 'عام']::TEXT[],
        'ساعة ذكية بشاشة AMOLED ومراقبة الصحة والاتصال',
        'تدعم استقبال المكالمات وقراءة الإشعارات باللغة العربية، قياس النبض والأكسجين، وبطارية جبارة تدوم حتى 10 أيام.',
        35000, 22, 6,
        ARRAY[
            'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80'
        ]::TEXT[],
        '[{"name": "لون الإطار", "options": ["أسود", "ذهبي وردي", "فضي"]}, {"name": "نوع السوار", "options": ["سيليكون رياضي", "جلد كلاسيكي"]}]'::JSONB,
        true, 215
    ) RETURNING id INTO p3;

    -- 4. روبوت أطفال
    INSERT INTO public.products (
        category_id, target_audience, name, description,
        base_price, stock_quantity, low_stock_threshold,
        images, variants, is_visible, views_count
    ) VALUES (
        cat_toy,
        ARRAY['أطفال']::TEXT[],
        'طقم تركيب وبناء روبوت ذكي للأطفال لتعليم البرمجة والعلوم',
        'لعبة تعليمية تنمي ذكاء ومهارات التفكير الإبداعي لدى الطفل، متوافقة مع تطبيقات الهاتف وسهلة التركيب والمرح.',
        18000, 8, 3,
        ARRAY[
            'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80'
        ]::TEXT[],
        '[{"name": "الفئة العمرية", "options": ["6-8 سنوات", "9-12 سنة"]}]'::JSONB,
        true, 87
    ) RETURNING id INTO p4;

    -- 5. قلاية هوائية
    INSERT INTO public.products (
        category_id, target_audience, name, description,
        base_price, stock_quantity, low_stock_threshold,
        images, variants, is_visible, views_count
    ) VALUES (
        cat_kitchen,
        ARRAY['عام']::TEXT[],
        'قلاية هوائية رقمية سعة 6 لتر موفرة للطاقة بدون زيت',
        'طهي صحي ومقرمش بنسبة دهون أقل 85%، شاشة لمس بـ 8 برامج طهي مسبقة مع وعاء مانع للالتصاق سهل التنظيف.',
        19500, 2, 4,
        ARRAY[
            'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=800&q=80'
        ]::TEXT[],
        '[{"name": "اللون", "options": ["أسود ملكي", "أبيض رخامي"]}]'::JSONB,
        true, 173
    ) RETURNING id INTO p5;

    -- 6. مجموعة أحمر شفاه
    INSERT INTO public.products (
        category_id, target_audience, name, description,
        base_price, stock_quantity, low_stock_threshold,
        images, variants, is_visible, views_count
    ) VALUES (
        cat_makeup,
        ARRAY['نساء']::TEXT[],
        'مجموعة أحمر شفاه وثبات مخملي 6 ألوان جذابة',
        'ألوان كلاسيكية وعصرية تدوم طوال اليوم بلمسة غير لامعة، مرطبة وتحتوي على فيتامين E لحماية الشفاه.',
        15000, 0, 5,
        ARRAY[
            'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80'
        ]::TEXT[],
        '[]'::JSONB,
        true, 120
    ) RETURNING id INTO p6;

    -- --------------------------------------------------------------------------
    -- إضافة عروض التخفيض المجدولة (Offers)
    -- --------------------------------------------------------------------------
    INSERT INTO public.offers (product_id, discount_price, start_date, end_date, is_active, clicks_count)
    VALUES
    (p1, 18500, NOW() - INTERVAL '1 day', NOW() + INTERVAL '3 days', true, 34),
    (p3, 24000, NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day', true, 52),
    (p5, 12500, NOW() - INTERVAL '1 day', NOW() + INTERVAL '3 days', true, 19);

    -- --------------------------------------------------------------------------
    -- إضافة باقات التوفير (Bundles)
    -- --------------------------------------------------------------------------
    -- باقة الرجل
    INSERT INTO public.bundles (
        title, description, bundle_price, original_total_price,
        image_url, start_date, end_date, is_active, clicks_count
    ) VALUES (
        'بكج العناية الفاخرة للرجل (حلاقة + عطر + إكسسوار)',
        'توفير استثنائي يجمع ماكينة الحلاقة التيتانيوم مع ساعة ذكية متطورة لأناقة مكتملة.',
        52000, 67000,
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
        NOW() - INTERVAL '1 day', NOW() + INTERVAL '3 days', true, 67
    ) RETURNING id INTO b1;

    INSERT INTO public.bundle_items (bundle_id, product_id, quantity) VALUES
    (b1, p2, 1),
    (b1, p3, 1);

    -- باقة البشرة
    INSERT INTO public.bundles (
        title, description, bundle_price, original_total_price,
        image_url, start_date, end_date, is_active, clicks_count
    ) VALUES (
        'بكج نضارة وجمال البشرة (سيروم + هدايا إضافية)',
        'احصلي على السيروم المرطب مع مستحضرات مرافقة بخصم حصري ومغري لفترة محدودة جداً.',
        28000, 39000,
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
        NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day', true, 45
    ) RETURNING id INTO b2;

    INSERT INTO public.bundle_items (bundle_id, product_id, quantity) VALUES
    (b2, p1, 1),
    (b2, p6, 1);

END $$;

