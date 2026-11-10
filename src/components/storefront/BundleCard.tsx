import React from 'react';
import { Bundle, StoreSettings } from '@/types/database';
import { CountdownBadge } from '@/components/common/CountdownBadge';
import { useCartStore } from '@/store/useCartStore';
import { incrementOfferClicks } from '@/lib/api';
import { Package, ShoppingBag, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface BundleCardProps {
  bundle: Bundle;
  settings?: StoreSettings;
}

export const BundleCard: React.FC<BundleCardProps> = ({ bundle, settings }) => {
  const { addBundle } = useCartStore();
  const currency = settings?.currency || 'ر.ي';

  const savings = Math.max(0, Number(bundle.original_total_price) - Number(bundle.bundle_price));
  const discountPercent =
    bundle.original_total_price > bundle.bundle_price
      ? Math.round((savings / Number(bundle.original_total_price)) * 100)
      : 0;

  const handleAddBundle = () => {
    addBundle(bundle, 1);
    incrementOfferClicks(bundle.id, true);
    toast.success(`تمت إضافة باقة "${bundle.title}" إلى السلة بنجاح 🎉`);
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-amber-300 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between relative group">
      {/* شارة باقة توفير خاصة */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-spin" />
        <span>باقة توفير {discountPercent}%</span>
      </div>

      <div>
        {/* صورة الباقة */}
        <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
          <img
            src={
              bundle.image_url ||
              'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'
            }
            alt={bundle.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
            <h3 className="text-white font-extrabold text-base sm:text-lg line-clamp-1">
              {bundle.title}
            </h3>
          </div>
        </div>

        {/* المؤقت التنازلي للباقة */}
        <div className="px-4 pt-3">
          <CountdownBadge endDate={bundle.end_date} />
        </div>

        {/* تفاصيل المنتجات المشمولة داخل الباقة */}
        <div className="p-4 sm:p-5">
          {bundle.description && (
            <p className="text-xs text-gray-600 mb-4 font-tajawal leading-relaxed">
              {bundle.description}
            </p>
          )}

          <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-3 mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-2">
              <Package className="w-4 h-4 text-amber-600" />
              <span>محتويات هذه الباقة:</span>
            </div>
            <ul className="space-y-1.5 text-xs text-gray-700">
              {bundle.items && bundle.items.length > 0 ? (
                bundle.items.map((it, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {it.quantity > 1 ? `${it.quantity}x ` : ''}
                      {it.product?.name || 'منتج مشمول بالباقة'}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-gray-500">تحتوي على مجموعة مختارة من أفضل المنتجات المتكاملة</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* الأسعار وزر الإضافة */}
      <div className="p-4 sm:p-5 pt-0">
        <div className="bg-gray-50 rounded-2xl p-3 mb-3 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-black text-emerald-700 font-mono">
                {Number(bundle.bundle_price).toLocaleString('ar-EG')}
              </span>
              <span className="text-xs font-bold text-gray-600">{currency}</span>
            </div>
            <div className="text-xs text-gray-400 line-through font-mono">
              بدلاً من {Number(bundle.original_total_price).toLocaleString('ar-EG')} {currency}
            </div>
          </div>

          <div className="text-left">
            <span className="text-[11px] text-gray-500 block">قيمة توفيرك:</span>
            <span className="text-xs font-black text-amber-600 font-mono">
              {savings.toLocaleString('ar-EG')} {currency}
            </span>
          </div>
        </div>

        <button
          onClick={handleAddBundle}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>اطلب الباقة الآن ووفر {savings.toLocaleString('ar-EG')} {currency}</span>
        </button>
      </div>
    </div>
  );
};
