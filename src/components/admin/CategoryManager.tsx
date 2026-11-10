import React, { useState } from 'react';
import { Category } from '@/types/database';
import { createCategory, updateCategory, deleteCategory } from '@/lib/api';
import { Plus, Edit2, Trash2, FolderPlus, Layers, Check, X, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface CategoryManagerProps {
  categories: Category[];
  onRefresh: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // حقول النموذج
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [parentId, setParentId] = useState<string>('');
  const [iconOrImage, setIconOrImage] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const mainCategories = categories.filter((c) => !c.parent_id);

  const handleOpenAddModal = (parentCatId?: string) => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setParentId(parentCatId || '');
    setIconOrImage('');
    setDisplayOrder(categories.length + 1);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setParentId(cat.parent_id || '');
    setIconOrImage(cat.icon_or_image || '');
    setDisplayOrder(cat.display_order);
    setIsActive(cat.is_active);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('يرجى كتابة اسم القسم');
      return;
    }

    const generatedSlug = slug.trim()
      ? slug.trim().toLowerCase().replace(/\s+/g, '-')
      : `cat-${Date.now()}`;

    setLoading(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, {
          name,
          slug: generatedSlug,
          parent_id: parentId || null,
          icon_or_image: iconOrImage || null,
          display_order: displayOrder,
          is_active: isActive,
        });
        toast.success('تم تحديث القسم بنجاح');
      } else {
        await createCategory({
          name,
          slug: generatedSlug,
          parent_id: parentId || null,
          icon_or_image: iconOrImage || null,
          display_order: displayOrder,
          is_active: isActive,
        });
        toast.success('تمت إضافة القسم بنجاح');
      }
      setIsModalOpen(false);
      onRefresh();
    } catch (err: any) {
      toast.error(err.message || 'فشلت العملية');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`هل أنت متأكد من رغبتك في حذف قسم "${name}"؟ قد يؤثر ذلك على الأقسام الفرعية التابعة.`)) {
      try {
        await deleteCategory(id);
        toast.success('تم حذف القسم بنجاح');
        onRefresh();
      } catch (err: any) {
        toast.error(err.message || 'فشل حذف القسم');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* رأس صفحة الأقسام */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <h3 className="text-base sm:text-lg font-black text-gray-900">
            شجرة الأقسام والفئات
          </h3>
          <p className="text-xs text-gray-500 font-tajawal">
            إدارة الأقسام الرئيسية وتفريعاتها لتسهيل تصفح الزوار وفلترة المنتجات
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal()}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة قسم رئيسي جديد</span>
        </button>
      </div>

      {/* قائمة الأقسام الهرمية */}
      <div className="space-y-4">
        {mainCategories.map((mainCat) => {
          const subCats = categories.filter((c) => c.parent_id === mainCat.id);
          return (
            <div
              key={mainCat.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden"
            >
              {/* شريط القسم الرئيسي */}
              <div className="p-4 sm:p-5 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    {mainCat.icon_or_image ? (
                      <span className="truncate px-1">{mainCat.icon_or_image}</span>
                    ) : (
                      <Layers className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-gray-900">
                        {mainCat.name}
                      </h4>
                      <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-mono">
                        ترتيب: {mainCat.display_order}
                      </span>
                      {!mainCat.is_active && (
                        <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">
                          معطل
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 font-mono" dir="ltr">
                      /{mainCat.slug}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAddModal(mainCat.id)}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition-colors"
                    title="إضافة قسم فرعي"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">قسم فرعي</span>
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(mainCat)}
                    className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(mainCat.id, mainCat.name)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* الأقسام الفرعية */}
              <div className="p-4 sm:p-5">
                {subCats.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {subCats.map((sub) => (
                      <div
                        key={sub.id}
                        className="bg-gray-50/70 border border-gray-100 p-3 rounded-2xl flex items-center justify-between"
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-gray-800">{sub.name}</span>
                            {!sub.is_active && (
                              <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.2 rounded">
                                معطل
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono" dir="ltr">
                            /{sub.slug}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(sub)}
                            className="p-1 text-gray-400 hover:text-emerald-700"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sub.id, sub.name)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-gray-400">
                    لا توجد أقسام فرعية مضافة تحت هذا القسم بعد.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* نافذة المودال لإضافة أو تعديل قسم */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h4 className="font-black text-gray-900 text-base">
                {editingCategory ? 'تعديل القسم' : 'إضافة قسم جديد'}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">اسم القسم *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: عناية بالبشرة"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">المعرف الرابط (Slug)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="skin-care (يترك فارغاً للتوليد التلقائي)"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  القسم الأب (الرئيسي)
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white"
                >
                  <option value="">بدون قسم أب (قسم رئيسي)</option>
                  {mainCategories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  رمز الأيقونة أو رابط الصورة
                </label>
                <input
                  type="text"
                  value={iconOrImage}
                  onChange={(e) => setIconOrImage(e.target.value)}
                  placeholder="Sparkles, Zap, Baby, UserCheck أو رابط صورة"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ترتيب الظهور</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-700">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span>القسم نشط ومعروض</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors disabled:opacity-50"
                >
                  {loading ? 'جارٍ الحفظ...' : 'حفظ البيانات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
