import React, { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { StoreSettings } from '@/types/database';
import { generateWhatsAppOrderUrl, CustomerOrderInfo } from '@/lib/whatsapp';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Send,
  MessageCircle,
  Package,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';

interface CartDrawerProps {
  settings?: StoreSettings;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ settings }) => {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getOriginalTotalPrice,
    getTotalSavings,
  } = useCartStore();

  const [customerInfo, setCustomerInfo] = useState<CustomerOrderInfo>({
    customerName: '',
    phone: '',
    city: '',
    address: '',
    notes: '',
  });

  const [showCustomerForm, setShowCustomerForm] = useState(false);

  if (!isOpen) return null;

  const defaultSettings: StoreSettings = settings || {
    id: 'default',
    store_name: 'معرض المنتجات والعروض',
    whatsapp_number: '967770000000',
    currency: 'ر.ي',
  };

  const currency = defaultSettings.currency || 'ر.ي';
  const totalPrice = getTotalPrice();
  const originalTotalPrice = getOriginalTotalPrice();
  const totalSavings = getTotalSavings();

  const handleCheckoutWhatsApp = () => {
    if (items.length === 0) {
      toast.warning('السلة فارغة، أضف بعض المنتجات أولاً');
      return;
    }

    const whatsappUrl = generateWhatsAppOrderUrl(items, defaultSettings, customerInfo);
    if (!whatsappUrl) {
      toast.error('تعذر إنشاء رابط الواتساب، يرجى مراجعة إعدادات المتجر');
      return;
    }

    window.open(whatsappUrl, '_blank');
    toast.success('تم تجهيز طلبك ونقلك إلى واتساب لإتمامه بنجاح! 🎉');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* خلفية معتمة قابلة للنقر للإغلاق */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 pr-0 sm:pr-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* رأس السلة */}
          <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-700 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold">سلة المشتريات</h2>
                <span className="text-xs text-emerald-100">
                  {items.length} {items.length === 1 ? 'عنصر' : 'عناصر'} مضافة
                </span>
              </div>
            </div>

            <button
              onClick={closeCart}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* قائمة العناصر */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="font-bold text-gray-700 text-base mb-1">سلتك فارغة حالياً</h3>
                <p className="text-xs text-gray-500 font-tajawal mb-6">
                  استكشف أحدث المنتجات والعروض المخفضة وأضفها لسلتك بسهولة
                </p>
                <button
                  onClick={closeCart}
                  className="bg-emerald-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-emerald-700 shadow-sm transition-all"
                >
                  تصفح المنتجات الآن
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.cartItemId} className="pt-3 first:pt-0 flex gap-3">
                  {/* صورة العنصر */}
                  <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                    <img
                      src={
                        item.type === 'bundle'
                          ? item.bundle?.image_url || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80'
                          : item.product?.images?.[0] || 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=400&q=80'
                      }
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* التفاصيل والتحكم */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs sm:text-sm font-bold text-gray-900 line-clamp-1">
                          {item.type === 'bundle' ? item.bundle?.title : item.product?.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.cartItemId)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                          title="حذف العنصر"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* شارة باقة أو خيارات المنتج */}
                      {item.type === 'bundle' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md mt-0.5">
                          <Package className="w-3 h-3" />
                          <span>باقة توفير متكاملة</span>
                        </span>
                      ) : (
                        item.selectedVariants &&
                        Object.keys(item.selectedVariants).length > 0 && (
                          <div className="text-[11px] text-gray-500 flex flex-wrap gap-1 mt-0.5">
                            {Object.entries(item.selectedVariants).map(([k, v]) => (
                              <span key={k} className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        )
                      )}
                    </div>

                    {/* السعر وأزرار الزيادة والنقصان */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-r-lg"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold font-mono text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-l-lg"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-left font-mono">
                        <div className="text-xs sm:text-sm font-bold text-emerald-700">
                          {(item.unitPrice * item.quantity).toLocaleString('ar-EG')} {currency}
                        </div>
                        {item.originalPrice > item.unitPrice && (
                          <div className="text-[10px] text-gray-400 line-through">
                            {(item.originalPrice * item.quantity).toLocaleString('ar-EG')} {currency}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* الجزء السفلي: الإجماليات ونموذج العميل وزر الواتساب */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50/90 space-y-3">
              {/* زر إظهار/إخفاء بيانات التوصيل */}
              <button
                type="button"
                onClick={() => setShowCustomerForm(!showCustomerForm)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center justify-between w-full py-1"
              >
                <span>بيانات العميل وعنوان التوصيل (اختياري)</span>
                <span className="text-emerald-600">{showCustomerForm ? 'إخفاء' : 'إضافة'}</span>
              </button>

              {showCustomerForm && (
                <div className="space-y-2 p-3 bg-white rounded-2xl border border-gray-200 text-xs animate-slide-up">
                  <input
                    type="text"
                    placeholder="الاسم الكامل"
                    value={customerInfo.customerName}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, customerName: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="رقم الهاتف"
                      value={customerInfo.phone}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, phone: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="المدينة / المنطقة"
                      value={customerInfo.city}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, city: e.target.value })
                      }
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="العنوان التفصيلي أو أقرب معلم"
                    value={customerInfo.address}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, address: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="أي ملاحظات خاصة بالطلب"
                    value={customerInfo.notes}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, notes: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              )}

              {/* ملخص المبالغ والتوفير */}
              <div className="space-y-1.5 text-xs text-gray-600 pt-1">
                {totalSavings > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>المجموع قبل الخصم:</span>
                      <span className="font-mono line-through text-gray-400">
                        {originalTotalPrice.toLocaleString('ar-EG')} {currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-amber-700 font-bold">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>إجمالي التوفير في العروض:</span>
                      </span>
                      <span className="font-mono">
                        -{totalSavings.toLocaleString('ar-EG')} {currency}
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between items-baseline text-sm sm:text-base font-black text-gray-900 pt-2 border-t border-gray-200">
                  <span>المبلغ الإجمالي المطلوب:</span>
                  <div className="flex items-baseline gap-1 text-emerald-800 font-mono text-lg sm:text-xl">
                    <span>{totalPrice.toLocaleString('ar-EG')}</span>
                    <span className="text-xs font-bold text-gray-700">{currency}</span>
                  </div>
                </div>
              </div>

              {/* زر الإتمام عبر واتساب */}
              <button
                onClick={handleCheckoutWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#20ba59] active:scale-98 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2.5 text-sm sm:text-base transition-all"
              >
                <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
                <span>إتمام الطلب عبر واتساب</span>
              </button>

              <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
                <span>سيتم فتح تطبيق واتساب فوراً برسالة مرتبة</span>
                <button
                  onClick={clearCart}
                  className="text-red-500 hover:underline"
                >
                  إفراغ السلة
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
