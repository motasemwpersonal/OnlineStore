# معرض المنتجات والعروض الشامل 🛍️✨
تطبيق متجر إلكتروني متكامل وعصري يدعم اللغة العربية واتجاه RTL بالكامل، مبني بأحدث التقنيات مع لوحة تحكم إدارية شاملة ونظام طلب مباشر عبر واتساب.

## 🚀 التقنيات المستخدمة (Tech Stack)
- **الواجهة الأمامية (Frontend):** React 18+ (TypeScript)، Vite، Tailwind CSS (RTL، خطوط 'Cairo' و 'Tajawal').
- **إدارة الحالة:** Zustand مع حفظ تلقائي في `localStorage`.
- **التوجيه (Routing):** React Router DOM v6.
- **الأيقونات والتنبيهات:** Lucide React، مكتبة Sonner للإشعارات التفاعلية.
- **ضغط الصور:** `browser-image-compression` (ضغط الصور تلقائياً في المتصفح وتحويلها لصيغة WebP قبل الرفع).
- **قاعدة البيانات والخدمات السحابية (BaaS):** Supabase (PostgreSQL، Auth، Storage bucket `product-images`، RPC Functions، Row Level Security RLS).

---

## 🗄️ إعداد وتجهيز قاعدة بيانات Supabase
1. أنشئ مشروعاً جديداً على [Supabase](https://supabase.com).
2. توجه إلى تبويب **SQL Editor** داخل لوحة تحكم Supabase.
3. انسخ محتويات الملف `supabase/schema.sql` والصقها ثم اضغط **Run**.
4. سيقوم الملف بإنشاء:
   - كافة الجداول: `store_settings`, `categories`, `products`, `offers`, `bundles`, `bundle_items`.
   - العلاقات والمفاتيح الأجنبية والفهارس (Indexes).
   - الدوال البرمجية الآمنة: `increment_product_views`, `increment_offer_clicks`.
   - سياسات الأمان RLS للجداول وحاوية الصور `product-images`.
   - البيانات الأولية للأقسام الرئيسية والفرعية وإعدادات المتجر الافتراضية.
5. انسخ رابط المشروع `Project URL` والمفتاح العام `Anon Key` من إعدادات API في Supabase، وضعهما في ملف `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 💻 تشغيل المشروع محلياً
```bash
# تثبيت الحزم (إن لم تكن مثبتة)
npm install

# تشغيل خادم التطوير
npm run dev

# بناء المشروع للإنتاج
npm run build
```

---

## 🔐 لوحة التحكم الإدارية (Admin Dashboard)
- **رابط الدخول:** `/admin/login`
- **حساب المدير التجريبي (في حال العمل بدون ربط Supabase):**
  - **البريد:** `admin@store.com`
  - **كلمة المرور:** `admin123`
- **المزايا:**
  - لوحة إحصائيات سريعة: الأكثر مشاهدة، الأكثر نقراً وتفاعلاً، وتنبيهات انخفاض المخزون.
  - إدارة شجرة الأقسام الهرمية (رئيسية وفرعية).
  - إضافة وتعديل المنتجات مع رفع الصور وضغطها تلقائياً بالمتصفح، وإدارة الخيارات المتعددة (Variants).
  - زر الإخفاء السريع للمنتجات.
  - جدولة العروض الفردية بمؤقت تنازلي حي.
  - إنشاء باقات التوفير المجمعة مع الحساب التلقائي للأسعار والتوفير.
  - تخصيص إعدادات المتجر ورقم الواتساب والعملة.
