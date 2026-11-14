import React from 'react';
import { ShoppingBag, Search, ShieldCheck, Sparkles, PhoneCall } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { StoreSettings } from '@/types/database';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';
import { Link } from 'react-router-dom';

interface NavbarProps {
  settings?: StoreSettings;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ settings, searchQuery, onSearchChange }) => {
  const { toggleCart, getItemsCount } = useCartStore();
  const itemsCount = getItemsCount();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (document.activeElement as HTMLElement)?.blur();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
      {/* الشريط العلوي المصغر للملاحظات ورقم الواتساب */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="font-medium">عروض وتخفيضات حصرية لفترة محدودة على كافة الأقسام!</span>
          </div>
          {settings?.whatsapp_number && (
            <a
              href={`https://wa.me/${normalizeWhatsAppNumber(settings.whatsapp_number)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 hover:text-amber-200 transition-colors font-mono"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>واتساب المبيعات: {settings.whatsapp_number}</span>
            </a>
          )}
        </div>
      </div>

      {/* الشريط الرئيسي للتنقل والبحث والسلة */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* اسم المتجر والشعار */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 group-hover:text-emerald-700 transition-colors">
              {settings?.store_name || 'معرض المنتجات والعروض'}
            </h1>
            <p className="text-[11px] text-gray-500 font-tajawal hidden sm:block">
              أفضل المنتجات والعروض المجمعة بأسعار منافسة
            </p>
          </div>
        </Link>

        {/* مربع البحث التفاعلي الفوري */}
        <div className="flex-1 max-w-lg mx-2 hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث عن منتج، ماركة، أو قسم..."
              aria-label="البحث عن المنتجات"
              className="w-full bg-gray-50 border border-gray-200 rounded-full py-2.5 pr-11 pl-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-inner"
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {/* أزرار الإجراءات (لوحة الإدارة + السلة) */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-emerald-700 bg-gray-100 hover:bg-emerald-50 px-3 py-2 rounded-xl transition-all font-medium"
            title="لوحة تحكم الإدارة"
            aria-label="الانتقال إلى لوحة تحكم الإدارة"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">لوحة الإدارة</span>
          </Link>

          {/* زر السلة العائمة */}
          <button
            onClick={toggleCart}
            aria-label={`سلة المشتريات، ${itemsCount} عناصر`}
            className="relative flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="text-sm font-bold hidden sm:inline">السلة</span>
            {itemsCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-amber-400 text-gray-900 rounded-full shadow-sm animate-bounce">
                {itemsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* مربع البحث في الشاشات الصغيرة */}
      <div className="px-4 pb-3 md:hidden">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث عن منتج، ماركة، أو قسم..."
            aria-label="البحث عن المنتجات"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pr-10 pl-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </form>
      </div>
    </header>
  );
};
