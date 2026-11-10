import React, { useState } from 'react';
import { Offer, Bundle, Product, StoreSettings } from '@/types/database';
import { deleteOffer, deleteBundle, updateOffer, updateBundle } from '@/lib/api';
import { OfferFormModal } from './OfferFormModal';
import { BundleFormModal } from './BundleFormModal';
import {
  Flame,
  Package,
  Plus,
  Edit2,
  Trash2,
  Clock,
  MousePointerClick,
  Sparkles,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface OffersBundlesManagerProps {
  offers: Offer[];
  bundles: Bundle[];
  products: Product[];
  settings?: StoreSettings;
  onRefresh: () => void;
}

export const OffersBundlesManager: React.FC<OffersBundlesManagerProps> = ({
  offers,
  bundles,
  products,
  settings,
  onRefresh,
}) => {
  const currency = settings?.currency || 'ر.ي';

  const [activeSubTab, setActiveSubTab] = useState<'offers' | 'bundles'>('offers');

  // نوافذ النماذج
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<Bundle | null>(null);

  const handleDeleteOffer = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العرض؟')) {
      try {
        await deleteOffer(id);
        toast.success('تم حذف العرض بنجاح');
        onRefresh();
      } catch (err: any) {
        toast.error('فشل حذف العرض: ' + err.message);
      }
    }
  };

  const handleDeleteBundle = async (id: string, title: string) => {
    if (window.confirm(`هل أنت متأكد من حذف باقة "${title}"؟`)) {
      try {
        await deleteBundle(id);
        toast.success('تم حذف الباقة بنجاح');
        onRefresh();
      } catch (err: any) {
        toast.error('فشل حذف الباقة: ' + err.message);
      }
    }
  };

  const handleToggleOfferActive = async (offer: Offer) => {
    try {
      await updateOffer(offer.id, { is_active: !offer.is_active });
      toast.success(offer.is_active ? 'تم تعطيل العرض' : 'تم تفعيل العرض');
      onRefresh();
    } catch (err: any) {
      toast.error('فشل تحديث العرض: ' + err.message);
    }
  };

  const handleToggleBundleActive = async (bundle: Bundle) => {
    try {
      await updateBundle(bundle.id, { is_active: !bundle.is_active });
      toast.success(bundle.is_active ? 'تم تعطيل الباقة' : 'تم تفعيل الباقة');
      onRefresh();
    } catch (err: any) {
      toast.error('فشل تحديث الباقة: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* شريط التبديل العلوي والأزرار */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* التبديل بين العروض والباقات */}
        <div className="flex items-center gap-2 bg-gray-100 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setActiveSubTab('offers')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'offers'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Flame className="w-4 h-4 text-red-500" />
            <span>العروض الفردية المجدولة ({offers.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('bundles')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeSubTab === 'bundles'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4 text-amber-500" />
            <span>باقات التوفير ({bundles.length})</span>
          </button>
        </div>

        {/* زر الإضافة حسب التبويب */}
        {activeSubTab === 'offers' ? (
          <button
            onClick={() => {
              setEditingOffer(null);
              setIsOfferModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>جدولة عرض جديد</span>
          </button>
        ) : (
          <button
            onClick={() => {
              setEditingBundle(null);
              setIsBundleModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء باقة جديدة</span>
          </button>
        )}
      </div>

      {/* 1. جدول العروض الفردية */}
      {activeSubTab === 'offers' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">المنتج</th>
                  <th className="py-3.5 px-3">سعر العرض</th>
                  <th className="py-3.5 px-3">السعر الأصلي</th>
                  <th className="py-3.5 px-3">تاريخ البداية</th>
                  <th className="py-3.5 px-3">تاريخ النهاية</th>
                  <th className="py-3.5 px-3">النقرات</th>
                  <th className="py-3.5 px-3">الحالة</th>
                  <th className="py-3.5 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {offers.length > 0 ? (
                  offers.map((offer) => {
                    const prod = offer.product || products.find((p) => p.id === offer.product_id);
                    const now = new Date();
                    const isExpired = new Date(offer.end_date) < now;
                    const isPending = new Date(offer.start_date) > now;

                    return (
                      <tr key={offer.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900 line-clamp-1">
                            {prod?.name || 'منتج غير معروف'}
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono font-bold text-red-600">
                          {Number(offer.discount_price).toLocaleString('ar-EG')} {currency}
                        </td>

                        <td className="py-3 px-3 font-mono line-through text-gray-400">
                          {prod ? Number(prod.base_price).toLocaleString('ar-EG') : '-'} {currency}
                        </td>

                        <td className="py-3 px-3 font-mono text-gray-500 text-[11px]" dir="ltr">
                          {new Date(offer.start_date).toLocaleDateString('ar-EG')}
                        </td>

                        <td className="py-3 px-3 font-mono text-gray-500 text-[11px]" dir="ltr">
                          {new Date(offer.end_date).toLocaleDateString('ar-EG')}
                        </td>

                        <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                          {offer.clicks_count || 0}
                        </td>

                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleOfferActive(offer)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                              isExpired
                                ? 'bg-gray-100 text-gray-500'
                                : isPending
                                ? 'bg-blue-50 text-blue-700'
                                : offer.is_active
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {isExpired
                              ? 'منتهي'
                              : isPending
                              ? 'مجدول قريباً'
                              : offer.is_active
                              ? 'نشط حالياً'
                              : 'معطل'}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingOffer(offer);
                                setIsOfferModalOpen(true);
                              }}
                              className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                              title="تعديل العرض"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteOffer(offer.id)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="حذف العرض"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      لا توجد عروض تخفيض مجدولة حالياً.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. جدول باقات التوفير */}
      {activeSubTab === 'bundles' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold">
                <tr>
                  <th className="py-3.5 px-4">عنوان الباقة</th>
                  <th className="py-3.5 px-3">سعر الباقة</th>
                  <th className="py-3.5 px-3">السعر الأصلي</th>
                  <th className="py-3.5 px-3">قيمة التوفير</th>
                  <th className="py-3.5 px-3">النقرات</th>
                  <th className="py-3.5 px-3">الحالة</th>
                  <th className="py-3.5 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {bundles.length > 0 ? (
                  bundles.map((bundle) => {
                    const savings = Math.max(
                      0,
                      Number(bundle.original_total_price) - Number(bundle.bundle_price)
                    );
                    const now = new Date();
                    const isExpired = new Date(bundle.end_date) < now;

                    return (
                      <tr key={bundle.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900 line-clamp-1">
                            {bundle.title}
                          </div>
                          <span className="text-[10px] text-gray-400">
                            {bundle.items?.length || 0} منتجات مشمولة
                          </span>
                        </td>

                        <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                          {Number(bundle.bundle_price).toLocaleString('ar-EG')} {currency}
                        </td>

                        <td className="py-3 px-3 font-mono line-through text-gray-400">
                          {Number(bundle.original_total_price).toLocaleString('ar-EG')} {currency}
                        </td>

                        <td className="py-3 px-3 font-mono font-black text-amber-700">
                          {savings.toLocaleString('ar-EG')} {currency}
                        </td>

                        <td className="py-3 px-3 font-mono font-bold text-gray-600">
                          {bundle.clicks_count || 0}
                        </td>

                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleBundleActive(bundle)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                              isExpired
                                ? 'bg-gray-100 text-gray-500'
                                : bundle.is_active
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {isExpired ? 'منتهية' : bundle.is_active ? 'نشطة' : 'معطلة'}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setEditingBundle(bundle);
                                setIsBundleModalOpen(true);
                              }}
                              className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                              title="تعديل الباقة"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBundle(bundle.id, bundle.title)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="حذف الباقة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      لا توجد باقات توفير مضافة حتى الآن.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* نوافذ المودال */}
      <OfferFormModal
        offer={editingOffer}
        products={products}
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        onSuccess={onRefresh}
      />

      <BundleFormModal
        bundle={editingBundle}
        products={products}
        isOpen={isBundleModalOpen}
        onClose={() => setIsBundleModalOpen(false)}
        onSuccess={onRefresh}
      />
    </div>
  );
};
