import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { StorePage } from '@/pages/StorePage';
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/AdminDashboardPage';
import { Toaster } from 'sonner';

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

        <Routes>
          {/* واجهة المتجر الرئيسية للعملاء */}
          <Route path="/" element={<StorePage />} />

          {/* لوحة تحكم الإدارة */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/*" element={<AdminDashboardPage />} />

          {/* إعادة التوجيه الافتراضية */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
