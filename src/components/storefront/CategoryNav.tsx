import React from 'react';
import { Category } from '@/types/database';
import { Sparkles, UserCheck, Baby, Zap, Watch, LayoutGrid, Check } from 'lucide-react';

interface CategoryNavProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  selectedSubcategoryId: string;
  onSelectSubcategory: (subcategoryId: string) => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  selectedSubcategoryId,
  onSelectSubcategory,
}) => {
  // فصل الأقسام الرئيسية والفرعية
  const mainCategories = categories.filter((c) => !c.parent_id && c.is_active);
  const activeMainCat = categories.find((c) => c.id === selectedCategoryId);
  const subcategories = categories.filter(
    (c) => c.parent_id === selectedCategoryId && c.is_active
  );

  // خريطة أيقونات الأقسام
  const getCategoryIcon = (iconName?: string | null) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-5 h-5" />;
      case 'UserCheck':
        return <UserCheck className="w-5 h-5" />;
      case 'Baby':
        return <Baby className="w-5 h-5" />;
      case 'Zap':
        return <Zap className="w-5 h-5" />;
      case 'Watch':
        return <Watch className="w-5 h-5" />;
      default:
        return <LayoutGrid className="w-5 h-5" />;
    }
  };

  return (
    <div className="mb-8 space-y-4">
      {/* الأقسام الرئيسية بأيقوناتها الدائرية العصرية */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none px-1">
        {/* زر عرض الكل */}
        <button
          onClick={() => {
            onSelectCategory('all');
            onSelectSubcategory('all');
          }}
          className={`flex flex-col items-center gap-2 p-2.5 rounded-2xl min-w-[85px] transition-all duration-200 group shrink-0 ${
            selectedCategoryId === 'all'
              ? 'text-emerald-700 font-extrabold'
              : 'text-gray-600 hover:text-emerald-600 font-medium'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm ${
              selectedCategoryId === 'all'
                ? 'bg-emerald-600 text-white shadow-emerald-500/30 scale-105'
                : 'bg-white border border-gray-200 group-hover:border-emerald-300 group-hover:bg-emerald-50 text-gray-700'
            }`}
          >
            <LayoutGrid className="w-6 h-6" />
          </div>
          <span className="text-xs text-center leading-tight">جميع الأقسام</span>
        </button>

        {mainCategories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.id);
                onSelectSubcategory('all');
              }}
              className={`flex flex-col items-center gap-2 p-2.5 rounded-2xl min-w-[85px] transition-all duration-200 group shrink-0 ${
                isSelected
                  ? 'text-emerald-700 font-extrabold'
                  : 'text-gray-600 hover:text-emerald-600 font-medium'
              }`}
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm overflow-hidden ${
                  isSelected
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/30 scale-105'
                    : 'bg-white border border-gray-200 group-hover:border-emerald-300 group-hover:bg-emerald-50 text-gray-700'
                }`}
              >
                {cat.icon_or_image?.startsWith('http') ? (
                  <img
                    src={cat.icon_or_image}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  getCategoryIcon(cat.icon_or_image)
                )}
              </div>
              <span className="text-xs text-center leading-tight line-clamp-1">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* شريط الأقسام الفرعية التابعة للقسم الرئيسي المختار */}
      {selectedCategoryId !== 'all' && subcategories.length > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 flex items-center gap-2 overflow-x-auto animate-fade-in scrollbar-none">
          <span className="text-xs font-bold text-emerald-900 shrink-0 px-2">
            تصفح فرعي:
          </span>
          <button
            onClick={() => onSelectSubcategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedSubcategoryId === 'all'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            الكل في {activeMainCat?.name}
          </button>
          {subcategories.map((sub) => {
            const isSubSelected = selectedSubcategoryId === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => onSelectSubcategory(sub.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  isSubSelected
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-emerald-100 hover:text-emerald-900 border border-gray-200'
                }`}
              >
                {isSubSelected && <Check className="w-3 h-3" />}
                <span>{sub.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
