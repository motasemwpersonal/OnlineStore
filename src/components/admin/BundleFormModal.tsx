import React, { useState, useEffect } from 'react';
import { Bundle, Product } from '@/types/database';
import { createBundle, updateBundle } from '@/lib/api';
import { X, Package, Plus, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface BundleFormModalProps {
  bundle: Bundle | null;
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface SelectedBundleItem {
  product_id: string;
  quantity: number;
}

export const BundleFormModal: React.FC<BundleFormModalProps> = ({
  bundle,
  products,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [bundlePrice, setBundlePrice] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedItems, setSelectedItems] = useState<SelectedBundleItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (bundle) {
      setTitle(bundle.title);
      setDescription(bundle.description || '');
      setImageUrl(bundle.image_url || '');
      setBundlePrice(Number(bundle.bundle_price));
      setStartDate(bundle.start_date.substring(0, 16));
      setEndDate(bundle.end_date.substring(0, 16));
      setIsActive(bundle.is_active);
      setSelectedItems(
        bundle.items?.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
        })) || []
      );
    } else {
      setTitle('');
      setDescription('');
      setImageUrl('');
      setBundlePrice(0);
      const now = new Date();
      const inSevenDays = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      setStartDate(now.toISOString().substring(0, 16));
      setEndDate(inSevenDays.toISOString().substring(0, 16));
      setIsActive(true);
      setSelectedItems([]);
    }
  }, [bundle]);

  // حساب المجموع الأصلي لمنتجات الباقة تلقائياً
  const calculatedOriginalTotal = selectedItems.reduce((sum, item) => {
    const prod = products.find((p) => p.id === item.product_id);
    return sum + (prod ? Number(prod.base_price) * item.quantity : 0);
  }, 0);

  const calculatedSavings = Math.max(0, calculatedOriginalTotal - bundlePrice);

  const addItemToBundle = () => {
    if (products.length === 0) return;
    const available = products.find(
      (p) => !selectedItems.some((it) => it.product_id === p.id)
    );
    if (!available) {
      toast.info('تمت إضافة جميع المنتجات المتاحة');
      return;
    }
    setSelectedItems([...selectedItems, { product_id: available.id, quantity: 1 }]);
  };

  const removeItemFromBundle = (idx: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof SelectedBundleItem, value: any) => {
    const updated = [...selectedItems];
    updated[idx] = { ...updated[idx], [field]: value };
    setSelectedItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('يرجى إدخال عنوان الباقة');
      return;
    }
    if (selectedItems.length === 0) {
      toast.error('يجب تضمين منتج واحد على الأقل داخل الباقة');
      return;
    }
    if (bundlePrice <= 0) {
      toast.error('يرجى تحديد سعر الباقة المخفض');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('تاريخ نهاية صلاحية الباقة يجب أن يكون بعد البداية');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        bundle_price: bundlePrice,
        original_total_price: calculatedOriginalTotal,
        image_url:
          imageUrl ||
          products.find((p) => p.id === selectedItems[0]?.product_id)?.images?.[0] ||
          '',
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        is_active: isActive,
      };

      if (bundle) {
        await updateBundle(bundle.id, payload, selectedItems);
        toast.success('تم تحديث باقة التوفير بنجاح');
      } else {
        await createBundle(payload, selectedItems);
        toast.success('تم إنشاء باقة التوفير الجديدة بنجاح');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'فشلت العملية');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto relative animate-slide-up">
        <button
          type="button"
          onClick={onClose}
          aria-label="إغلاق النافذة"
          className="absolute top-5 left-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base sm:text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
          <Package className="w-5 h-5 text-amber-500" />
          <span>{bundle ? 'تعديل باقة التوفير' : 'إنشاء باقة توفير مجمعة جديدة'}</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              عنوان الباقة *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: بكج النضارة الشاملة (3 منتجات بسعر مخفض)"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              وصف محتويات الباقة
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="تفاصيل ما تحتويه الباقة ومزايا اقتنائها معاً..."
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              رابط صورة الباقة
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://... (اختياري، إن تُرِك فارغاً سيتم استخدام صورة أول منتج)"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono text-left"
              dir="ltr"
            />
          </div>

          {/* اختيار عناصر ومنتجات الباقة */}
          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/60">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-gray-900">
                  المنتجات المشمولة داخل الباقة
                </h4>
                <p className="text-[11px] text-gray-500 font-tajawal">
                  اختر عدة منتجات من نفس القسم أو أقسام مختلفة
                </p>
              </div>
              <button
                type="button"
                onClick={addItemToBundle}
                className="bg-white hover:bg-gray-100 text-emerald-700 border border-emerald-300 font-bold text-xs px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة منتج للباقة</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {selectedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs"
                >
                  <select
                    value={item.product_id}
                    onChange={(e) => updateItem(idx, 'product_id', e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg p-2 text-xs focus:outline-none"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({Number(p.base_price).toLocaleString('ar-EG')} ر.ي)
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[11px] text-gray-500">الكمية:</span>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, 'quantity', Number(e.target.value))}
                      className="w-16 border border-gray-200 rounded-lg p-1.5 text-xs text-center font-mono"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItemFromBundle(idx)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {selectedItems.length === 0 && (
                <div className="text-center py-4 text-xs text-gray-400">
                  اضغط على زر "إضافة منتج للباقة" لاختيار أول منتج.
                </div>
              )}
            </div>

            {/* الحساب التلقائي للأسعار */}
            <div className="mt-4 pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between text-xs gap-2">
              <span className="text-gray-600 font-medium">
                المجموع التراكمي لأسعار المنتجات الأصلية:
              </span>
              <span className="font-bold text-gray-900 font-mono text-sm">
                {calculatedOriginalTotal.toLocaleString('ar-EG')} ر.ي
              </span>
            </div>
          </div>

          {/* سعر الباقة والتوفير */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                سعر الباقة الإجمالي المخفض *
              </label>
              <input
                type="number"
                required
                min={0}
                value={bundlePrice}
                onChange={(e) => setBundlePrice(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div className="flex items-center pt-5">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 w-full flex items-center justify-between text-xs">
                <span className="text-amber-900 font-bold">قيمة توفير العميل:</span>
                <span className="font-black text-amber-700 font-mono text-sm">
                  {calculatedSavings.toLocaleString('ar-EG')} ر.ي
                </span>
              </div>
            </div>
          </div>

          {/* تواريخ الصلاحية */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                تاريخ بداية الباقة *
              </label>
              <input
                type="datetime-local"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                تاريخ نهاية الباقة *
              </label>
              <input
                type="datetime-local"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span>الباقة نشطة ومتاحة للطلب الآن</span>
            </label>
          </div>

          <div className="pt-4 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors disabled:opacity-50"
            >
              {loading ? 'جارٍ الحفظ...' : 'حفظ الباقة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
