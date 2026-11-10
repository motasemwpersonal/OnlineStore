import React from 'react';
import { StoreSettings } from '@/types/database';
import { Sparkles, Flame, ShieldCheck, Tag } from 'lucide-react';

interface BannerProps {
  settings?: StoreSettings;
  onExploreOffers: () => void;
}

export const Banner: React.FC<BannerProps> = ({ settings, onExploreOffers }) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 text-white p-6 sm:p-10 mb-8 shadow-xl">
      {/* عناصر خلفية جمالية */}
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-60 h-60 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold mb-4 backdrop-blur-sm border border-white/10">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>تخفيضات كبرى وعروض حصرية مجدولة</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black leading-tight mb-3">
          {settings?.store_name || 'معرض المنتجات والعروض الشامل'}
        </h2>

        <p className="text-sm sm:text-base text-gray-200 font-tajawal mb-6 leading-relaxed">
          {settings?.description ||
            'اكتشف تشكيلة واسعة من مستلزمات العناية، الأجهزة الكهربائية، الإلكترونيات، ومستلزمات الأطفال بأسعار تنافسية وخيارات دفع وطلب سهلة ومباشرة.'}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onExploreOffers}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-gray-950 font-black px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Flame className="w-4 h-4 text-red-600" />
            <span>استكشف عروض التخفيض والباقات</span>
          </button>

          <div className="flex items-center gap-2 text-xs text-emerald-200 font-bold px-3 py-2 bg-white/5 rounded-xl border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>طلب آمن ومباشر عبر واتساب</span>
          </div>
        </div>
      </div>
    </div>
  );
};
