import React, { useState, useEffect } from 'react';
import { Product, StoreSettings } from '@/types/database';
import { CountdownBadge } from '@/components/common/CountdownBadge';
import { Badge } from '@/components/common/Badge';
import { useCartStore } from '@/store/useCartStore';
import { incrementProductViews } from '@/lib/api';
import { X, ShoppingBag, Plus, Minus, Check, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ProductDetailsModalProps {
  product: Product | null;
  settings?: StoreSettings;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  settings,
  onClose,
}) => {
  const { addProduct } = useCartStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  // تحديث الخيارات الافتراضية وزيادة عدد المشاهدات عند فتح النافذة
  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setQuantity(1);
      incrementProductViews(product.id);

      // تعيين أول خيار افتراضي لكل نوع
      if (product.variants && product.variants.length > 0) {
        const initialVars: Record<string, string> = {};
        product.variants.forEach((v) => {
          if (v.options && v.options.length > 0) {
            initialVars[v.name] = v.options[0];
          }
        });
        setSelectedVariants(initialVars);
      } else {
        setSelectedVariants({});
      }
    }
  }, [product]);

  if (!product) return null;

  const currency = settings?.currency || 'ر.ي';

  // حساب العرض
  const now = new Date();
  const hasActiveOffer =
    product.active_offer &&
    product.active_offer.is_active &&
    new Date(product.active_offer.end_date) > now &&
    new Date(product.active_offer.start_date) <= now;

  const currentPrice = hasActiveOffer
    ? Number(product.active_offer!.discount_price)
    : Number(product.base_price);
  const originalPrice = Number(product.base_price);
  const isOutOfStock = product.stock_quantity === 0;

  const discountPercent =
    hasActiveOffer && originalPrice > currentPrice
      ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
      : 0;

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ['https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80'];

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('عذراً، هذا المنتج غير متوفر حالياً');
      return;
    }

    // التحقق من تحديد كافة الخيارات
    if (product.variants && product.variants.length > 0) {
      for (const v of product.variants) {
        if (!selectedVariants[v.name]) {
          toast.warning(`يرجى تحديد ${v.name}`);
          return;
        }
      }
    }

    addProduct(product, quantity, selectedVariants);
    toast.success(`تمت إضافة ${quantity} من "${product.name}" إلى السلة`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col md:flex-row relative max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          aria-label="إغلاق تفاصيل المنتج"
          className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-white/90 text-gray-700 hover:bg-gray-100 flex items-center justify-center shadow-md transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* معرض الصور والتنقل بينها */}
        <div className="md:w-1/2 bg-gray-50 p-4 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-l border-gray-100">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-inner mb-3">
            <img
              src={images[selectedImageIndex] || images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {hasActiveOffer && discountPercent > 0 && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-600 text-white text-xs font-black px-3 py-1 rounded-xl shadow-lg">
                <Flame className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
                <span>وفر {discountPercent}%</span>
              </div>
            )}
          </div>

          {/* مصغرات الصور */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-emerald-600 scale-105 shadow-sm'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* المؤقت التنازلي إن وجد عرض ساري */}
          {hasActiveOffer && product.active_offer && (
            <div className="mt-3">
              <CountdownBadge endDate={product.active_offer.end_date} />
            </div>
          )}
        </div>

        {/* تفاصيل المنتج والخيارات والإضافة */}
        <div className="md:w-1/2 p-5 sm:p-7 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* الشارات والتصنيفات */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
              {product.category && (
                <Badge variant="primary" size="sm">
                  {product.category.name}
                </Badge>
              )}
              {product.target_audience?.map((aud) => (
                <Badge key={aud} variant="secondary" size="sm">
                  {aud}
                </Badge>
              ))}
              {isOutOfStock ? (
                <Badge variant="danger" size="sm">
                  نفدت الكمية
                </Badge>
              ) : (
                <Badge variant="info" size="sm">
                  متوفر ({product.stock_quantity} قطعة)
                </Badge>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-snug mb-3">
              {product.name}
            </h2>

            {/* السعر */}
            <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3.5 mb-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-500 block mb-0.5">السعر الحالي:</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-emerald-800 font-mono">
                    {currentPrice.toLocaleString('ar-EG')}
                  </span>
                  <span className="text-sm font-bold text-gray-700">{currency}</span>
                </div>
              </div>

              {hasActiveOffer && originalPrice > currentPrice && (
                <div className="text-left">
                  <span className="text-xs text-gray-400 block">السعر الأصلي:</span>
                  <span className="text-sm text-gray-400 line-through font-mono">
                    {originalPrice.toLocaleString('ar-EG')} {currency}
                  </span>
                </div>
              )}
            </div>

            {/* الوصف */}
            {product.description && (
              <div className="mb-5 text-gray-600 text-sm leading-relaxed font-tajawal bg-gray-50 p-3.5 rounded-2xl">
                {product.description}
              </div>
            )}

            {/* الخيارات المتعددة (Variants) */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4 mb-5 border-t border-gray-100 pt-4">
                {product.variants.map((v) => (
                  <div key={v.name}>
                    <label className="text-xs font-bold text-gray-700 block mb-2">
                      {v.name}: <span className="text-emerald-700">{selectedVariants[v.name]}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {v.options.map((opt) => {
                        const isChosen = selectedVariants[v.name] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setSelectedVariants((prev) => ({ ...prev, [v.name]: opt }))
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                              isChosen
                                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/30'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                            }`}
                          >
                            {isChosen && <Check className="w-3.5 h-3.5" />}
                            <span>{opt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* محدد الكمية وزر الإضافة */}
          <div className="border-t border-gray-100 pt-4 mt-auto">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-bold text-gray-700">الكمية:</span>
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-bold text-sm font-mono text-gray-900">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock_quantity || 99, q + 1))
                  }
                  disabled={quantity >= product.stock_quantity}
                  className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm shadow-md transition-all ${
                isOutOfStock
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white shadow-emerald-600/30'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {isOutOfStock ? 'نفدت الكمية حالياً' : 'أضف إلى السلة واستمر في التسوق'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
