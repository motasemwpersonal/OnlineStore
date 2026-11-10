import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Sparkles,
  Settings,
  LogOut,
  ExternalLink,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: 'analytics' | 'products' | 'categories' | 'offers' | 'settings';
  setActiveTab: (tab: 'analytics' | 'products' | 'categories' | 'offers' | 'settings') => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const { user, isAdmin, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-gray-600">جارٍ التحقق من الصلاحيات...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const navItems = [
    { id: 'analytics', label: 'الرئيسية والإحصائيات', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'products', label: 'إدارة المنتجات', icon: <Package className="w-4 h-4" /> },
    { id: 'categories', label: 'الأقسام والفئات', icon: <Layers className="w-4 h-4" /> },
    { id: 'offers', label: 'العروض والباقات', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'settings', label: 'إعدادات المتجر', icon: <Settings className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* القائمة الجانبية للشاشات الكبيرة */}
      <aside className="w-full md:w-64 bg-gray-900 text-gray-300 flex flex-col justify-between shrink-0 shadow-xl">
        <div>
          {/* عنوان القائمة الجانبية */}
          <div className="p-5 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-sm font-black text-white">إدارة المتجر</h1>
                <span className="text-[11px] text-emerald-400 font-mono">لوحة التحكم الكاملة</span>
              </div>
            </div>
          </div>

          {/* روابط التبويبات */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-right ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black'
                      : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <span className={isActive ? 'text-white' : 'text-gray-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* الجزء السفلي من القائمة الجانبية */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-bold text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>معاينة واجهة المتجر</span>
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج</span>
          </button>

          <div className="px-3 pt-2 text-[10px] text-gray-500 truncate" dir="ltr">
            {user?.email || 'admin@store.com'}
          </div>
        </div>
      </aside>

      {/* المحتوى الرئيسي للوحة الإدارة */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-xs">
          <div>
            <h2 className="text-lg font-black text-gray-900">
              {navItems.find((n) => n.id === activeTab)?.label}
            </h2>
            <p className="text-xs text-gray-500 font-tajawal">
              لوحة التحكم والإدارة الشاملة لمتجر المعرض
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl transition-colors border border-emerald-200"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>فتح المتجر</span>
            </Link>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};
