import { Category, Product, Bundle, StoreSettings, Offer } from '@/types/database';

export const mockStoreSettings: StoreSettings = {
  id: 'setting-1',
  store_name: 'معرض المنتجات والعروض الشامل',
  whatsapp_number: '967733556683',
  currency: 'ر.ي',
  description: 'وجهتك الأولى لأفضل المنتجات الأصلية والعروض الحصرية بأفضل الأسعار الممكنة',
};

export const mockCategories: Category[] = [
  // 1. العناية بالمرأة
  {
    id: 'cat-women',
    name: 'العناية بالمرأة',
    slug: 'women-care',
    parent_id: null,
    icon_or_image: 'Sparkles',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'sub-women-skin',
    name: 'عناية بالبشرة',
    slug: 'skin-care-women',
    parent_id: 'cat-women',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'sub-women-hair',
    name: 'عناية بالشعر',
    slug: 'hair-care-women',
    parent_id: 'cat-women',
    display_order: 2,
    is_active: true,
  },
  {
    id: 'sub-women-makeup',
    name: 'مكياج وتجميل',
    slug: 'makeup',
    parent_id: 'cat-women',
    display_order: 3,
    is_active: true,
  },

  // 2. العناية بالرجل
  {
    id: 'cat-men',
    name: 'العناية بالرجل',
    slug: 'men-care',
    parent_id: null,
    icon_or_image: 'UserCheck',
    display_order: 2,
    is_active: true,
  },
  {
    id: 'sub-men-shaving',
    name: 'حلاقة وتشذيب',
    slug: 'shaving-grooming',
    parent_id: 'cat-men',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'sub-men-perfumes',
    name: 'عطور رجالية',
    slug: 'perfumes-men',
    parent_id: 'cat-men',
    display_order: 2,
    is_active: true,
  },

  // 3. مستلزمات الأطفال
  {
    id: 'cat-kids',
    name: 'مستلزمات الأطفال',
    slug: 'kids-care',
    parent_id: null,
    icon_or_image: 'Baby',
    display_order: 3,
    is_active: true,
  },
  {
    id: 'sub-kids-toys',
    name: 'ألعاب تعليمية',
    slug: 'toys-learning',
    parent_id: 'cat-kids',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'sub-kids-feeding',
    name: 'تغذية ورضاعة',
    slug: 'feeding-baby',
    parent_id: 'cat-kids',
    display_order: 2,
    is_active: true,
  },

  // 4. أجهزة وكهربائيات
  {
    id: 'cat-electronics',
    name: 'أجهزة وكهربائيات',
    slug: 'electronics',
    parent_id: null,
    icon_or_image: 'Zap',
    display_order: 4,
    is_active: true,
  },
  {
    id: 'sub-elec-kitchen',
    name: 'أجهزة المطبخ',
    slug: 'kitchen-appliances',
    parent_id: 'cat-electronics',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'sub-elec-styling',
    name: 'أجهزة تصفيف شعر',
    slug: 'electric-styling',
    parent_id: 'cat-electronics',
    display_order: 2,
    is_active: true,
  },

  // 5. إكسسوارات ومنوعات
  {
    id: 'cat-accessories',
    name: 'إكسسوارات ومنوعات',
    slug: 'accessories',
    parent_id: null,
    icon_or_image: 'Watch',
    display_order: 5,
    is_active: true,
  },
  {
    id: 'sub-acc-watches',
    name: 'ساعات ذكية',
    slug: 'smartwatches',
    parent_id: 'cat-accessories',
    display_order: 1,
    is_active: true,
  },
  {
    id: 'sub-acc-phone',
    name: 'ملحقات الهواتف',
    slug: 'phone-car-accessories',
    parent_id: 'cat-accessories',
    display_order: 2,
    is_active: true,
  },
];

// تاريخ انتهاء عروض تجريبي بعد 3 أيام
const futureDate3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
const futureDate1Day = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000 + 4 * 3600 * 1000).toISOString();
const startDateNow = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString();

export const mockOffers: Offer[] = [
  {
    id: 'offer-1',
    product_id: 'prod-1',
    discount_price: 18500,
    start_date: startDateNow,
    end_date: futureDate3Days,
    is_active: true,
    clicks_count: 34,
  },
  {
    id: 'offer-2',
    product_id: 'prod-3',
    discount_price: 24000,
    start_date: startDateNow,
    end_date: futureDate1Day,
    is_active: true,
    clicks_count: 52,
  },
  {
    id: 'offer-3',
    product_id: 'prod-5',
    discount_price: 12500,
    start_date: startDateNow,
    end_date: futureDate3Days,
    is_active: true,
    clicks_count: 19,
  },
];

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    category_id: 'sub-women-skin',
    target_audience: ['نساء', 'عام'],
    name: 'سيروم الهيالورونيك وفيتامين سي المركز لترطيب البشرة',
    description: 'تركيبة متطورة تمنح بشرتك نضارة فورية وترطيباً عميقاً يدوم 48 ساعة، يقلل من ظهور الخطوط الدقيقة ويوحد لون البشرة.',
    base_price: 24000,
    stock_quantity: 15,
    low_stock_threshold: 5,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248597359-07b98d36183f?auto=format&fit=crop&w=800&q=80',
    ],
    variants: [
      { name: 'الحجم', options: ['30 مل', '50 مل'] },
    ],
    is_visible: true,
    views_count: 142,
    active_offer: mockOffers[0],
  },
  {
    id: 'prod-2',
    category_id: 'sub-men-shaving',
    target_audience: ['رجال'],
    name: 'ماكينة حلاقة وتشذيب اللحية الاحترافية المقاومة للماء',
    description: 'محرك ياباني قوي مع شفرات تيتانيوم حادة قابلة للغسل، بطارية ليثيوم تدوم 120 دقيقة وشاشة رقمية توضح نسبة الشحن.',
    base_price: 32000,
    stock_quantity: 4, // تنبيه مخزون منخفض!
    low_stock_threshold: 5,
    images: [
      'https://images.unsplash.com/photo-1621607512214-68297480165e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80',
    ],
    variants: [
      { name: 'اللون', options: ['أسود كربوني', 'فضي مطفي'] },
    ],
    is_visible: true,
    views_count: 98,
    active_offer: null,
  },
  {
    id: 'prod-3',
    category_id: 'sub-acc-watches',
    target_audience: ['رجال', 'نساء', 'عام'],
    name: 'ساعة ذكية بشاشة AMOLED ومراقبة الصحة والاتصال',
    description: 'تدعم استقبال المكالمات وقراءة الإشعارات باللغة العربية، قياس النبض والأكسجين، وبطارية جبارة تدوم حتى 10 أيام.',
    base_price: 35000,
    stock_quantity: 22,
    low_stock_threshold: 6,
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
    ],
    variants: [
      { name: 'لون الإطار', options: ['أسود', 'ذهبي وردي', 'فضي'] },
      { name: 'نوع السوار', options: ['سيليكون رياضي', 'جلد كلاسيكي'] },
    ],
    is_visible: true,
    views_count: 215,
    active_offer: mockOffers[1],
  },
  {
    id: 'prod-4',
    category_id: 'sub-kids-toys',
    target_audience: ['أطفال'],
    name: 'طقم تركيب وبناء روبوت ذكي للأطفال لتعليم البرمجة والعلوم',
    description: 'لعبة تعليمية تنمي ذكاء ومهارات التفكير الإبداعي لدى الطفل، متوافقة مع تطبيقات الهاتف وسهلة التركيب والمرح.',
    base_price: 18000,
    stock_quantity: 8,
    low_stock_threshold: 3,
    images: [
      'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80',
    ],
    variants: [
      { name: 'الفئة العمرية', options: ['6-8 سنوات', '9-12 سنة'] },
    ],
    is_visible: true,
    views_count: 87,
    active_offer: null,
  },
  {
    id: 'prod-5',
    category_id: 'sub-elec-kitchen',
    target_audience: ['عام'],
    name: 'قلاية هوائية رقمية سعة 6 لتر موفرة للطاقة بدون زيت',
    description: 'طهي صحي ومقرمش بنسبة دهون أقل 85%، شاشة لمس بـ 8 برامج طهي مسبقة مع وعاء مانع للالتصاق سهل التنظيف.',
    base_price: 19500,
    stock_quantity: 2, // منخفض جداً
    low_stock_threshold: 4,
    images: [
      'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=800&q=80',
    ],
    variants: [
      { name: 'اللون', options: ['أسود ملكي', 'أبيض رخامي'] },
    ],
    is_visible: true,
    views_count: 173,
    active_offer: mockOffers[2],
  },
  {
    id: 'prod-6',
    category_id: 'sub-women-makeup',
    target_audience: ['نساء'],
    name: 'مجموعة أحمر شفاه وثبات مخملي 6 ألوان جذابة',
    description: 'ألوان كلاسيكية وعصرية تدوم طوال اليوم بلمسة غير لامعة، مرطبة وتحتوي على فيتامين E لحماية الشفاه.',
    base_price: 15000,
    stock_quantity: 0, // نفدت الكمية لاختبار شارة نفاذ الكمية
    low_stock_threshold: 5,
    images: [
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
    ],
    variants: [],
    is_visible: true,
    views_count: 120,
    active_offer: null,
  },
];

export const mockBundles: Bundle[] = [
  {
    id: 'bundle-1',
    title: 'بكج العناية الفاخرة للرجل (حلاقة + عطر + إكسسوار)',
    description: 'توفير استثنائي يجمع ماكينة الحلاقة التيتانيوم، مع ساعة ذكية متطورة، وعطر متميز لأناقة مكتملة.',
    bundle_price: 52000,
    original_total_price: 67000,
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    start_date: startDateNow,
    end_date: futureDate3Days,
    is_active: true,
    clicks_count: 67,
    items: [
      { product_id: 'prod-2', quantity: 1, product: mockProducts[1] },
      { product_id: 'prod-3', quantity: 1, product: mockProducts[2] },
    ],
  },
  {
    id: 'bundle-2',
    title: 'بكج نضارة وجمال البشرة (سيروم + هدايا إضافية)',
    description: 'احصلي على السيروم المرطب مع مستحضرات مرافقة بخصم حصري ومغري لفترة محدودة جداً.',
    bundle_price: 28000,
    original_total_price: 39000,
    image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    start_date: startDateNow,
    end_date: futureDate1Day,
    is_active: true,
    clicks_count: 45,
    items: [
      { product_id: 'prod-1', quantity: 1, product: mockProducts[0] },
      { product_id: 'prod-6', quantity: 1, product: mockProducts[5] },
    ],
  },
];
