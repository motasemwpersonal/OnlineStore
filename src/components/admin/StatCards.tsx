import React from 'react';
import { Product, Offer, Bundle, StoreSettings } from '@/types/database';
import {
  Eye,
  MousePointerClick,
  AlertTriangle,
  Package,
  Sparkles,
  TrendingUp,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

interface StatCardsProps {
  products: Product[];
  offers: Offer[];
  bundles: Bundle[];
  settings?: StoreSettings;
  onEditProduct: (product: Product) => void;
}

export const StatCards: React.FC<StatCardsProps> = ({
  products,
  offers,
  bundles,
  settings,
  onEditProduct,
}) => {
  const currency = settings?.currency || 'ر.ي';

  // 1. أعلى 5 منتجات زيارة ومشاهدة
  const topViewedProducts = [...products]
    .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
    .slice(0, 5);

  // 2. أكثر العروض والباقات نقراً
  const allInteractiveItems = [
    ...offers.map((o) => ({
      id: o.id,
      title: o.product?.name || 'عرض منتج',
      type: 'عرض فردي',
      clicks: o.clicks_count || 0,
      price: o.discount_price,
    })),
    ...bundles.map((b) => ({
      id: b.id,
      title: b.title,
      type: 'باقة توفير',
      clicks: b.clicks_count || 0,
      price: b.bundle_price,
    })),
  ]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  // 3. تنبيهات المخزون المنخفض
  const lowStockProducts = products.filter(
    (p) => p.stock_quantity <= (p.low_stock_threshold || 5)
  );

  return (
    <div className="space-y-6">
      {/* بطاقات الإحصائيات الأربع الرئيسية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 block mb-1">إجمالي المنتجات</span>
            <span className="text-2xl font-black text-gray-900 font-mono">{products.length}</span>
            <span className="text-[11px] text-emerald-600 block mt-1">
              {products.filter((p) => p.is_visible).length} منتج نشط ومعروض
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 block mb-1">العروض المجدولة</span>
            <span className="text-2xl font-black text-amber-600 font-mono">{offers.length}</span>
            <span className="text-[11px] text-amber-700 block mt-1">عروض نشطة وموقوتة</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 block mb-1">باقات التوفير</span>
            <span className="text-2xl font-black text-blue-600 font-mono">{bundles.length}</span>
            <span className="text-[11px] text-blue-700 block mt-1">مجموعات مجمعة ومخفضة</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-500 block mb-1">تنبيهات المخزون</span>
            <span
              className={`text-2xl font-black font-mono ${
                lowStockProducts.length > 0 ? 'text-red-600' : 'text-gray-900'
              }`}
            >
              {lowStockProducts.length}
            </span>
            <span className="text-[11px] text-red-500 block mt-1">منتجات قاربت على النفاد</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* جداول الإحصائيات التحليلية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* الأكثر مشاهدة */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">
                الأكثر مشاهدة (Top 5)
              </h3>
            </div>
            <span className="text-xs text-gray-400">حسب إحصائيات الزوار</span>
          </div>

          <div className="divide-y divide-gray-100">
            {topViewedProducts.map((p, idx) => (
              <div
                key={p.id}
                onClick={() => onEditProduct(p)}
                className="py-3 flex items-center justify-between hover:bg-gray-50 p-2 rounded-xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-xs font-bold font-mono text-gray-400">#{idx + 1}</span>
                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                    <img
                      src={p.images?.[0] || ''}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{p.name}</h4>
                    <span className="text-[11px] text-gray-500 font-mono">
                      {Number(p.base_price).toLocaleString('ar-EG')} {currency}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg shrink-0">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="font-mono">{p.views_count} زيارة</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* الأكثر تفاعلاً ونقراً */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MousePointerClick className="w-5 h-5 text-amber-600" />
              <h3 className="font-extrabold text-gray-900 text-sm sm:text-base">
                الأكثر تفاعلاً ونقراً
              </h3>
            </div>
            <span className="text-xs text-gray-400">عروض وباقات</span>
          </div>

          <div className="divide-y divide-gray-100">
            {allInteractiveItems.length > 0 ? (
              allInteractiveItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="py-3 flex items-center justify-between hover:bg-gray-50 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-xs font-bold font-mono text-gray-400">#{idx + 1}</span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">{item.title}</h4>
                      <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded">
                        {item.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg shrink-0">
                    <MousePointerClick className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-mono">{item.clicks} نقرة</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-gray-400">
                لا توجد إحصائيات نقرات كافية بعد
              </div>
            )}
          </div>
        </div>
      </div>

      {/* قسم تنبيهات المخزون الحرج */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50/70 border border-red-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3 text-red-800 font-extrabold text-sm sm:text-base">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span>تنبيهات المخزون الحرج (الكمية أقل من أو تساوي الحد الأدنى)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => onEditProduct(p)}
                className="bg-white p-3.5 rounded-2xl border border-red-100 flex items-center justify-between cursor-pointer hover:border-red-300 transition-colors shadow-2xs"
              >
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-gray-900 truncate">{p.name}</h5>
                  <div className="text-[11px] text-gray-500 mt-1">
                    الحد الأدنى للتنبيه: {p.low_stock_threshold}
                  </div>
                </div>
                <div className="text-left shrink-0">
                  <span
                    className={`text-xs font-black px-2.5 py-1 rounded-lg font-mono ${
                      p.stock_quantity === 0
                        ? 'bg-red-600 text-white'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {p.stock_quantity === 0 ? 'نفدت' : `${p.stock_quantity} متبقية`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
