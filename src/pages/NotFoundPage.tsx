import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Home, ArrowRight, HelpCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col justify-between" dir="rtl">
      {/* رأس مصغر */}
      <header className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-gray-900 text-base">معرض المنتجات والعروض</span>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-emerald-700 font-bold bg-white px-3.5 py-2 rounded-xl shadow-xs border border-gray-200 transition-all"
        >
          <Home className="w-4 h-4 text-emerald-600" />
          <span>الصفحة الرئيسية</span>
        </Link>
      </header>

      {/* محتوى 404 */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-xl border border-gray-100 space-y-6">
          <div className="relative mx-auto w-24 h-24">
            <div className="w-24 h-24 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <HelpCircle className="w-12 h-12" />
            </div>
            <span className="absolute -bottom-2 -right-2 bg-amber-400 text-gray-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow">
              404
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              الصفحة غير موجودة
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 font-tajawal leading-relaxed">
              يبدو أن الرابط الذي طلبته غير صحيح، أو تم نقل الصفحة أو انتهاء صلاحية العرض المطلوب.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>تصفح جميع المنتجات</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/admin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 py-3 px-4 font-bold transition-colors"
            >
              لوحة الإدارة
            </Link>
          </div>
        </div>
      </main>

      {/* تذييل مصغر */}
      <footer className="p-4 text-center text-xs text-gray-400">
        معرض المنتجات والعروض الشامل &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default NotFoundPage;

