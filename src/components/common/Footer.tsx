import React from 'react';
import { StoreSettings } from '@/types/database';
import { ShoppingBag, ShieldCheck, Truck, Headphones, MessageCircle } from 'lucide-react';

interface FooterProps {
  settings?: StoreSettings;
}

export const Footer: React.FC<FooterProps> = ({ settings }) => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20 border-t border-gray-800">
      {/* شريط المزايا التسويقية */}
      <div className="border-b border-gray-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-800/50">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">توصيل سريع وموثوق</h4>
                <p className="text-xs text-gray-400 mt-0.5">توصيل لجميع المناطق بأسرع وقت</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-800/50">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">منتجات أصلية 100%</h4>
                <p className="text-xs text-gray-400 mt-0.5">جودة مضمونة وفحص دقيق لكل سلعة</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-800/50">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">طلب مباشر عبر واتساب</h4>
                <p className="text-xs text-gray-400 mt-0.5">تأكيد فوري للطلب وتنسيق التوصيل بسهولة</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gray-800/50">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">خدمة عملاء متواصلة</h4>
                <p className="text-xs text-gray-400 mt-0.5">جاهزون للرد على استفساراتكم واقتراحاتكم</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* المحتوى الرئيسي للفوتر */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{settings?.store_name}</h3>
              <p className="text-xs text-gray-400">{settings?.description}</p>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()} {settings?.store_name}. تم التطوير بأحدث التقنيات.
          </div>
        </div>
      </div>
    </footer>
  );
};
