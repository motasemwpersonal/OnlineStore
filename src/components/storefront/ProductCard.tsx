import React from 'react';
import { Product, StoreSettings } from '@/types/database';
import { CountdownBadge } from '@/components/common/CountdownBadge';
import { Badge } from '@/components/common/Badge';
import { useCartStore } from '@/store/useCartStore';
import { Eye, ShoppingBag, Check, Flame } from 'lucide-react';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  settings?: StoreSettings;
  onOpenDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  settings,
  onOpenDetails,
}) => {
  const { addProduct } = useCartStore();
  const currency = settings?.currency || 'ر.ي';

  // التحقق من صلاحية العرض الحالي
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

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) {
      toast.error('هذا المنتج غير متوفر حالياً');
      return;
    }

    // إذا كان للمنتج خيارات متعددة، نفتح نافذة التفاصيل لاختيار الخيارات
    if (product.variants && product.variants.length > 0) {
      onOpenDetails(product);
      return;
    }

    addProduct(product, 1);
    toast.success(`تمت إضافة "${product.name}" إلى السلة بنجاح`);
  };

  const mainImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80';

  return (
    <div
      onClick={() => onOpenDetails(product)}
      className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* شارة الخصم أو العرض الخاص */}
      {hasActiveOffer && discountPercent > 0 && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-lg shadow-red-500/30">
          <Flame className="w-3.5 h-3.5 text-yellow-300 animate-bounce" />
          <span>خصم {discountPercent}%</span>
        </div>
      )}

      {/* شارة نفاد الكمية */}
      {isOutOfStock && (
        <div className="absolute top-3 left-3 z-10 bg-gray-900/90 text-white text-xs font-bold px-3 py-1 rounded-xl shadow">
          نفدت الكمية
        </div>
      )}

      {/* صورة المنتج مع تأثير التكبير */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        <img
          src={mainImage}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
            isOutOfStock ? 'grayscale opacity-60' : ''
          }`}
          loading="lazy"
        />

        {/* زر معاينة سريع عند التحويم */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="bg-white/95 text-gray-900 text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>عرض التفاصيل</span>
          </span>
        </div>

        {/* شريط العداد التنازلي المدمج فوق الصورة */}
        {hasActiveOffer && product.active_offer && (
          <div className="absolute bottom-2 inset-x-2 z-10">
            <CountdownBadge endDate={product.active_offer.end_date} />
          </div>
        )}
      </div>

      {/* محتوى وتفاصيل البطاقة */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* الفئات والشارات */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {product.category && (
              <Badge variant="secondary" size="sm">
                {product.category.name}
              </Badge>
            )}
            {product.target_audience?.map((aud) => (
              <Badge
                key={aud}
                variant={aud === 'نساء' ? 'purple' : aud === 'رجال' ? 'info' : 'warning'}
                size="sm"
              >
                {aud}
              </Badge>
            ))}
          </div>

          {/* اسم المنتج */}
          <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>

          {/* وصف مصغر */}
          {product.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-1 font-tajawal">
              {product.description}
            </p>
          )}
        </div>

        {/* السعر وزر الإضافة للسلة */}
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-emerald-700 font-mono">
                {currentPrice.toLocaleString('ar-EG')}
              </span>
              <span className="text-xs font-bold text-gray-600">{currency}</span>
            </div>

            {hasActiveOffer && originalPrice > currentPrice && (
              <span className="text-xs text-gray-400 line-through font-mono block">
                {originalPrice.toLocaleString('ar-EG')} {currency}
              </span>
            )}
          </div>

          {/* زر الشراء أو الإضافة السريعة */}
          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-sm hover:shadow-md'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {product.variants?.length > 0 ? 'خيارات' : 'أضف'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
