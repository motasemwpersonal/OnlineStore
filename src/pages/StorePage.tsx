import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Category,
  Product,
  Bundle,
  StoreSettings,
} from '@/types/database';
import {
  getStoreSettings,
  getCategories,
  getProducts,
  getBundles,
} from '@/lib/api';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { Banner } from '@/components/storefront/Banner';
import { AudienceFilter } from '@/components/storefront/AudienceFilter';
import { CategoryNav } from '@/components/storefront/CategoryNav';
import { BundlesSection } from '@/components/storefront/BundlesSection';
import { ProductCard } from '@/components/storefront/ProductCard';
import { ProductDetailsModal } from '@/components/storefront/ProductDetailsModal';
import { CartDrawer } from '@/components/storefront/CartDrawer';
import { Filter, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export const StorePage: React.FC = () => {
  const [settings, setSettings] = useState<StoreSettings | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // الفلاتر
  const [selectedAudience, setSelectedAudience] = useState<string>('الكل');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // نافذة تفاصيل المنتج
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);

  const bundlesRef = useRef<HTMLDivElement>(null);

  // تحميل البيانات الأولية
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [settingsData, catsData, prodsData, bundlesData] = await Promise.all([
        getStoreSettings(),
        getCategories(),
        getProducts({ includeHidden: false }),
        getBundles(true),
      ]);

      setSettings(settingsData);
      setCategories(catsData);
      setProducts(prodsData);
      setBundles(bundlesData);
    } catch (err) {
      console.error('فشل تحميل بيانات المتجر:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // تصفية المنتجات في الواجهة الأمامية بسلاسة وسرعة
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // 1. فلتر الفئة المستهدفة
      if (selectedAudience !== 'الكل') {
        const hasAudience =
          prod.target_audience.includes(selectedAudience as any) ||
          prod.target_audience.includes('عام');
        if (!hasAudience) return false;
      }

      // 2. فلتر القسم الرئيسي والفرعي
      if (selectedSubcategoryId !== 'all') {
        if (prod.category_id !== selectedSubcategoryId) return false;
      } else if (selectedCategoryId !== 'all') {
        // التحقق من القسم الرئيسي أو الأقسام الفرعية التابعة له
        const subCatIds = categories
          .filter((c) => c.parent_id === selectedCategoryId)
          .map((c) => c.id);
        const allowedIds = [selectedCategoryId, ...subCatIds];
        if (!allowedIds.includes(prod.category_id)) return false;
      }

      // 3. فلتر البحث النصي
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = prod.name.toLowerCase().includes(query);
        const matchesDesc = prod.description?.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc) return false;
      }

      return true;
    });
  }, [products, selectedAudience, selectedCategoryId, selectedSubcategoryId, searchQuery, categories]);

  const scrollToBundles = () => {
    bundlesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      {/* شريط التنقل العلوي */}
      <Navbar
        settings={settings}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* المحتوى الرئيسي للمتجر */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* البانر الإعلاني */}
        <Banner settings={settings} onExploreOffers={scrollToBundles} />

        {/* فلاتر الفئات السريعة (نساء، رجال، أطفال، عام) */}
        <AudienceFilter
          selectedAudience={selectedAudience}
          onSelectAudience={setSelectedAudience}
        />

        {/* فلاتر الأقسام الرئيسية والفرعية الهرمية */}
        <CategoryNav
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          selectedSubcategoryId={selectedSubcategoryId}
          onSelectSubcategory={setSelectedSubcategoryId}
        />

        {/* قسم الباقات المجمعة التوفيرية */}
        <div ref={bundlesRef}>
          <BundlesSection bundles={bundles} settings={settings} />
        </div>

        {/* عنوان شبكة المنتجات مع عداد النتائج */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              {selectedCategoryId === 'all'
                ? 'جميع المنتجات والعروض'
                : categories.find((c) => c.id === selectedCategoryId)?.name || 'المنتجات'}
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full font-mono">
              {filteredProducts.length} منتج
            </span>
          </div>

          {(selectedAudience !== 'الكل' || selectedCategoryId !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedAudience('الكل');
                setSelectedCategoryId('all');
                setSelectedSubcategoryId('all');
                setSearchQuery('');
              }}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 hover:underline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>إعادة ضبط الفلاتر</span>
            </button>
          )}
        </div>

        {/* حالة التحميل */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm animate-pulse space-y-3"
              >
                <div className="w-full aspect-square bg-gray-200 rounded-2xl" />
                <div className="h-4 bg-gray-200 rounded-md w-3/4" />
                <div className="h-3 bg-gray-100 rounded-md w-1/2" />
                <div className="h-6 bg-gray-200 rounded-xl w-1/3 pt-2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          /* شبكة المنتجات المتجاوبة */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                settings={settings}
                onOpenDetails={setActiveModalProduct}
              />
            ))}
          </div>
        ) : (
          /* حالة عدم وجود منتجات مطابقة للبحث أو الفلتر */
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto my-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-900 text-lg mb-1">لا توجد منتجات مطابقة</h3>
            <p className="text-xs text-gray-500 font-tajawal mb-5">
              لم نعثر على أي منتج يطابق خيارات التصفية الحالية. جرب تغيير الفئة أو البحث بكلمات أخرى.
            </p>
            <button
              onClick={() => {
                setSelectedAudience('الكل');
                setSelectedCategoryId('all');
                setSelectedSubcategoryId('all');
                setSearchQuery('');
              }}
              className="bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 shadow-sm transition-all"
            >
              عرض كافة المنتجات
            </button>
          </div>
        )}
      </main>

      {/* نافذة تفاصيل المنتج المودال */}
      <ProductDetailsModal
        product={activeModalProduct}
        settings={settings}
        onClose={() => setActiveModalProduct(null)}
      />

      {/* درج سلة الواتساب المنزلق */}
      <CartDrawer settings={settings} />

      {/* الفوتر */}
      <Footer settings={settings} />
    </div>
  );
};
