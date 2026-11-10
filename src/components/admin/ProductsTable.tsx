import React, { useState, useMemo } from 'react';
import { Product, Category, StoreSettings } from '@/types/database';
import { toggleProductVisibility, deleteProduct } from '@/lib/api';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Sparkles,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
  settings?: StoreSettings;
  onRefresh: () => void;
  onEditProduct: (product: Product) => void;
  onOpenAddModal: () => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  categories,
  settings,
  onRefresh,
  onEditProduct,
  onOpenAddModal,
}) => {
  const currency = settings?.currency || 'ر.ي';

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAudience, setSelectedAudience] = useState('all');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'all') {
        const subCatIds = categories
          .filter((c) => c.parent_id === selectedCategory)
          .map((c) => c.id);
        const allowedIds = [selectedCategory, ...subCatIds];
        if (!allowedIds.includes(p.category_id)) return false;
      }

      if (selectedAudience !== 'all') {
        if (!p.target_audience.includes(selectedAudience as any)) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q)) return false;
      }

      return true;
    });
  }, [products, selectedCategory, selectedAudience, search, categories]);

  const handleToggleVisibility = async (product: Product) => {
    const nextState = !product.is_visible;
    try {
      await toggleProductVisibility(product.id, nextState);
      toast.success(
        nextState
          ? `تم إظهار منتج "${product.name}" للزوار`
          : `تم إخفاء منتج "${product.name}" عن الزوار`
      );
      onRefresh();
    } catch (err: any) {
      toast.error('فشل تغيير حالة الظهور: ' + err.message);
    }
  };

  const handleDelete = async (product: Product) => {
    if (window.confirm(`هل أنت متأكد من حذف المنتج "${product.name}" نهائياً؟`)) {
      try {
        await deleteProduct(product.id);
        toast.success('تم حذف المنتج بنجاح');
        onRefresh();
      } catch (err: any) {
        toast.error('فشل حذف المنتج: ' + err.message);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* شريط الإجراءات والبحث والفلترة */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* مربع البحث */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="البحث باسم المنتج..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pr-9 pl-4 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* فلاتر القسم والفئة المستهدفة */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none bg-white font-medium"
          >
            <option value="all">كافة الأقسام</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parent_id ? `↳ ${c.name}` : c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedAudience}
            onChange={(e) => setSelectedAudience(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none bg-white font-medium"
          >
            <option value="all">كافة الفئات المستهدفة</option>
            <option value="نساء">نساء</option>
            <option value="رجال">رجال</option>
            <option value="أطفال">أطفال</option>
            <option value="عام">عام</option>
          </select>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>منتج جديد</span>
          </button>
        </div>
      </div>

      {/* جدول المنتجات */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold">
              <tr>
                <th className="py-3.5 px-4">المنتج</th>
                <th className="py-3.5 px-3">القسم</th>
                <th className="py-3.5 px-3">الفئات</th>
                <th className="py-3.5 px-3">السعر</th>
                <th className="py-3.5 px-3">المخزون</th>
                <th className="py-3.5 px-3">المشاهدات</th>
                <th className="py-3.5 px-3">الظهور</th>
                <th className="py-3.5 px-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const isLow = p.stock_quantity <= (p.low_stock_threshold || 5);
                  const isOut = p.stock_quantity === 0;
                  const cat = categories.find((c) => c.id === p.category_id);

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* اسم وصورة المنتج */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                            <img
                              src={p.images?.[0] || ''}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 max-w-[200px]">
                            <div className="font-bold text-gray-900 truncate">{p.name}</div>
                            {p.variants && p.variants.length > 0 && (
                              <span className="text-[10px] text-gray-400">
                                {p.variants.length} خيارات فرعية
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* القسم */}
                      <td className="py-3 px-3">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
                          {cat?.name || 'غير محدد'}
                        </span>
                      </td>

                      {/* الفئات المستهدفة */}
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1 max-w-[120px]">
                          {p.target_audience?.map((aud) => (
                            <span
                              key={aud}
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800"
                            >
                              {aud}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* السعر */}
                      <td className="py-3 px-3 font-mono">
                        <div className="font-bold text-gray-900">
                          {Number(p.base_price).toLocaleString('ar-EG')} {currency}
                        </div>
                        {p.active_offer && (
                          <div className="text-[10px] text-red-600 flex items-center gap-0.5">
                            <Flame className="w-3 h-3" />
                            <span>عرض: {Number(p.active_offer.discount_price).toLocaleString('ar-EG')}</span>
                          </div>
                        )}
                      </td>

                      {/* المخزون */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold font-mono text-[11px] ${
                            isOut
                              ? 'bg-red-100 text-red-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3" />}
                          <span>{p.stock_quantity}</span>
                        </span>
                      </td>

                      {/* المشاهدات */}
                      <td className="py-3 px-3 font-mono text-gray-500 font-bold">
                        {p.views_count}
                      </td>

                      {/* زر الإخفاء السريع المباشر */}
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleVisibility(p)}
                          className={`p-1.5 rounded-xl transition-all flex items-center gap-1 text-[11px] font-bold ${
                            p.is_visible
                              ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                              : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                          }`}
                          title={p.is_visible ? 'انقر لإخفاء المنتج' : 'انقر لإظهار المنتج'}
                        >
                          {p.is_visible ? (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>ظاهر</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>مخفي</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* الإجراءات */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onEditProduct(p)}
                            className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="تعديل المنتج"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="حذف المنتج"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400">
                    لا توجد منتجات مطابقة لخيارات التصفية.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
