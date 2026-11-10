import React, { useState, useEffect } from 'react';
import {
  Product,
  Category,
  Offer,
  Bundle,
  StoreSettings,
} from '@/types/database';
import {
  getStoreSettings,
  getCategories,
  getProducts,
  getOffers,
  getBundles,
} from '@/lib/api';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatCards } from '@/components/admin/StatCards';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { CategoryManager } from '@/components/admin/CategoryManager';
import { OffersBundlesManager } from '@/components/admin/OffersBundlesManager';
import { StoreSettingsForm } from '@/components/admin/StoreSettingsForm';
import { ProductFormModal } from '@/components/admin/ProductFormModal';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'products' | 'categories' | 'offers' | 'settings'
  >('analytics');

  const [settings, setSettings] = useState<StoreSettings | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // إدارة نافذة إضافة/تعديل المنتج
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [settingsData, catsData, prodsData, offersData, bundlesData] =
        await Promise.all([
          getStoreSettings(),
          getCategories(),
          getProducts({ includeHidden: true }),
          getOffers(),
          getBundles(false),
        ]);

      setSettings(settingsData);
      setCategories(catsData);
      setProducts(prodsData);
      setOffers(offersData);
      setBundles(bundlesData);
    } catch (err) {
      console.error('فشل تحميل بيانات لوحة الإدارة:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-gray-500">جارٍ مزامنة وتحديث البيانات...</p>
        </div>
      ) : (
        <>
          {activeTab === 'analytics' && (
            <StatCards
              products={products}
              offers={offers}
              bundles={bundles}
              settings={settings}
              onEditProduct={handleEditProduct}
            />
          )}

          {activeTab === 'products' && (
            <ProductsTable
              products={products}
              categories={categories}
              settings={settings}
              onRefresh={loadAllData}
              onEditProduct={handleEditProduct}
              onOpenAddModal={handleOpenAddProduct}
            />
          )}

          {activeTab === 'categories' && (
            <CategoryManager categories={categories} onRefresh={loadAllData} />
          )}

          {activeTab === 'offers' && (
            <OffersBundlesManager
              offers={offers}
              bundles={bundles}
              products={products}
              settings={settings}
              onRefresh={loadAllData}
            />
          )}

          {activeTab === 'settings' && (
            <StoreSettingsForm settings={settings} onRefresh={loadAllData} />
          )}
        </>
      )}

      {/* نافذة مودال المنتج */}
      <ProductFormModal
        product={editingProduct}
        categories={categories}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={loadAllData}
      />
    </AdminLayout>
  );
};
