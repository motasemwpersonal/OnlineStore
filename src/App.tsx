import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { StorePage } from '@/pages/StorePage';
import { Toaster } from 'sonner';

// التحميل الكسول لمسارات الإدارة وصفحة الخطأ لتقليل حجم الحزمة الأولى للزوار
const AdminLoginPage = lazy(() =>
  import('@/pages/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);
const AdminDashboardPage = lazy(() =>
  import('@/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage }))
);
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center space-y-3">
      <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-xs font-bold text-gray-500">جارٍ التحميل...</p>
    </div>
  </div>
);

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        {/* إشعارات النظام المنسقة باللغة العربية */}
        <Toaster
          position="bottom-left"
          dir="rtl"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: 'Cairo, sans-serif',
              borderRadius: '1rem',
            },
          }}
        />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* واجهة المتجر الرئيسية للعملاء */}
            <Route path="/" element={<StorePage />} />

            {/* لوحة تحكم الإدارة */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/*" element={<AdminDashboardPage />} />

            {/* صفحة 404 المخصصة لأي رابط غير معروف */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
