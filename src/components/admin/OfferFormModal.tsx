import React, { useState, useEffect } from 'react';
import { Offer, Product } from '@/types/database';
import { createOffer, updateOffer } from '@/lib/api';
import { X, Flame, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface OfferFormModalProps {
  offer: Offer | null;
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const OfferFormModal: React.FC<OfferFormModalProps> = ({
  offer,
  products,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [productId, setProductId] = useState('');
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  // تنسيق التاريخ الافتراضي
  useEffect(() => {
    if (offer) {
      setProductId(offer.product_id);
      setDiscountPrice(Number(offer.discount_price));
      setStartDate(offer.start_date.substring(0, 16));
      setEndDate(offer.end_date.substring(0, 16));
      setIsActive(offer.is_active);
    } else {
      setProductId(products[0]?.id || '');
      setDiscountPrice(0);
      const now = new Date();
      const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      setStartDate(now.toISOString().substring(0, 16));
      setEndDate(inThreeDays.toISOString().substring(0, 16));
      setIsActive(true);
    }
  }, [offer, products]);

  const selectedProduct = products.find((p) => p.id === productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      toast.error('يرجى اختيار المنتج المشمول بالعرض');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('يجب أن يكون تاريخ ووقت نهاية العرض بعد تاريخ البداية');
      return;
    }
    if (selectedProduct && discountPrice >= Number(selectedProduct.base_price)) {
      toast.warning('سعر الخصم يجب أن يكون أقل من السعر الأساسي للمنتج');
    }

    setLoading(true);
    try {
      if (offer) {
        await updateOffer(offer.id, {
          product_id: productId,
          discount_price: discountPrice,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          is_active: isActive,
        });
        toast.success('تم تحديث العرض بنجاح');
      } else {
        await createOffer({
          product_id: productId,
          discount_price: discountPrice,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          is_active: isActive,
        });
        toast.success('تمت جدولة العرض الجديد بنجاح');
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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-gray-100 relative animate-slide-up">
        <button
          onClick={onClose}
          className="absolute top-5 left-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-base sm:text-lg font-black text-gray-900 mb-5 flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-500" />
          <span>{offer ? 'تعديل عرض مجدول' : 'جدولة عرض تخفيض جديد'}</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">المنتج المشمول *</label>
            <select
              required
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value);
                const p = products.find((prod) => prod.id === e.target.value);
                if (p && !offer) {
                  // اقتراح خصم 20%
                  setDiscountPrice(Math.round(Number(p.base_price) * 0.8));
                }
              }}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white"
            >
              <option value="">اختر المنتج...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (السعر الأصلي: {Number(p.base_price).toLocaleString('ar-EG')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              سعر التخفيض (سعر العرض) *
            </label>
            <input
              type="number"
              required
              min={0}
              value={discountPrice}
              onChange={(e) => setDiscountPrice(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
            />
            {selectedProduct && (
              <span className="text-[11px] text-gray-500 mt-1 block">
                السعر الأصلي: {Number(selectedProduct.base_price).toLocaleString('ar-EG')} | التوفير:{' '}
                {Math.max(0, Number(selectedProduct.base_price) - discountPrice).toLocaleString('ar-EG')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                تاريخ ووقت بداية العرض *
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
                تاريخ ووقت نهاية العرض *
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
              <span>العرض نشط ومفعل</span>
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
              {loading ? 'جارٍ الحفظ...' : 'حفظ العرض'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
