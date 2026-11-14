import React, { useState, useEffect } from 'react';
import { Product, Category, TargetAudienceType, ProductVariant } from '@/types/database';
import { createProduct, updateProduct, uploadProductImage } from '@/lib/api';
import {
  X,
  Upload,
  Plus,
  Trash2,
  Image as ImageIcon,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

interface ProductFormModalProps {
  product: Product | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AUDIENCE_OPTIONS: TargetAudienceType[] = ['نساء', 'رجال', 'أطفال', 'عام'];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  categories,
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [targetAudience, setTargetAudience] = useState<TargetAudienceType[]>(['عام']);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // حالات خاصة برفع الصور والخيارات
  const [isUploading, setIsUploading] = useState(false);
  const [newVariantName, setNewVariantName] = useState('');
  const [currentOptionInputs, setCurrentOptionInputs] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setCategoryId(product.category_id);
      setTargetAudience(product.target_audience || ['عام']);
      setBasePrice(Number(product.base_price));
      setStockQuantity(product.stock_quantity);
      setLowStockThreshold(product.low_stock_threshold || 5);
      setImages(product.images || []);
      setVariants(product.variants || []);
      setIsVisible(product.is_visible);
    } else {
      setName('');
      setDescription('');
      setCategoryId(categories[0]?.id || '');
      setTargetAudience(['عام']);
      setBasePrice(1000);
      setStockQuantity(10);
      setLowStockThreshold(5);
      setImages([]);
      setVariants([]);
      setIsVisible(true);
    }
  }, [product, categories]);

  // إدارة الجمهور المستهدف
  const toggleAudience = (aud: TargetAudienceType) => {
    if (targetAudience.includes(aud)) {
      if (targetAudience.length === 1) {
        toast.warning('يجب اختيار فئة مستهدفة واحدة على الأقل');
        return;
      }
      setTargetAudience(targetAudience.filter((a) => a !== aud));
    } else {
      setTargetAudience([...targetAudience, aud]);
    }
  };

  // رفع وضغط الصور
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    toast.info('جارٍ ضغط الصور وتحويلها لصيغة WebP ورفعها...');

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const url = await uploadProductImage(files[i]);
        uploadedUrls.push(url);
      }
      setImages((prev) => [...prev, ...uploadedUrls]);
      toast.success(`تم ضغط ورفع ${uploadedUrls.length} صورة بنجاح`);
    } catch (err: any) {
      toast.error('حدث خطأ أثناء رفع الصورة: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  // إدارة الخيارات الفرعية (Variants)
  const addVariantType = () => {
    if (!newVariantName.trim()) {
      toast.error('اكتب اسم الخاصية أولاً (مثل: المقاس أو اللون)');
      return;
    }
    setVariants([...variants, { name: newVariantName.trim(), options: [] }]);
    setNewVariantName('');
  };

  const removeVariantType = (variantIdx: number) => {
    setVariants(variants.filter((_, idx) => idx !== variantIdx));
  };

  const addOptionToVariant = (variantIdx: number) => {
    const val = currentOptionInputs[variantIdx]?.trim();
    if (!val) return;

    const updated = [...variants];
    if (!updated[variantIdx].options.includes(val)) {
      updated[variantIdx].options.push(val);
      setVariants(updated);
    }
    setCurrentOptionInputs({ ...currentOptionInputs, [variantIdx]: '' });
  };

  const removeOptionFromVariant = (variantIdx: number, optIdx: number) => {
    const updated = [...variants];
    updated[variantIdx].options.splice(optIdx, 1);
    setVariants(updated);
  };

  // الإرسال النهائي للنموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('يرجى إدخال اسم المنتج');
      return;
    }
    if (!categoryId) {
      toast.error('يرجى اختيار القسم التابع له المنتج');
      return;
    }
    if (images.length === 0) {
      toast.warning('يُفضل إضافة صورة واحدة على الأقل للمنتج');
    }

    setIsSubmitting(true);
    try {
      const productPayload = {
        name,
        description,
        category_id: categoryId,
        target_audience: targetAudience,
        base_price: basePrice,
        stock_quantity: stockQuantity,
        low_stock_threshold: lowStockThreshold,
        images,
        variants,
        is_visible: isVisible,
      };

      if (product) {
        await updateProduct(product.id, productPayload);
        toast.success('تم تحديث بيانات المنتج بنجاح');
      } else {
        await createProduct(productPayload);
        toast.success('تمت إضافة المنتج الجديد بنجاح');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'فشلت عملية حفظ المنتج');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[92vh] overflow-y-auto relative animate-slide-up">
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          aria-label="إغلاق النافذة"
          className="absolute top-5 left-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
        >
          <X className="w-4 h-4" />
        </button>

        <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-6">
          {product ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* الاسم والوصف */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                اسم المنتج *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: سيروم العناية بالبشرة بفيتامين سي"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                الوصف التفصيلي للمنتج
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="اكتب مواصفات ومزايا المنتج وطريقة الاستخدام..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* القسم والفئة المستهدفة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                القسم التابع له *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="">اختر القسم...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.parent_id ? `↳ ${c.name}` : c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                الفئات المستهدفة (تحديد متعدد)
              </label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {AUDIENCE_OPTIONS.map((aud) => {
                  const isChecked = targetAudience.includes(aud);
                  return (
                    <button
                      key={aud}
                      type="button"
                      onClick={() => toggleAudience(aud)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        isChecked
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                      <span>{aud}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* الأسعار والمخزون */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                السعر الأساسي *
              </label>
              <input
                type="number"
                required
                min={0}
                value={basePrice}
                onChange={(e) => setBasePrice(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                الكمية في المخزون *
              </label>
              <input
                type="number"
                required
                min={0}
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                حد تنبيه نقص المخزون
              </label>
              <input
                type="number"
                min={0}
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* رفع الصور وضغطها تلقائياً بالمتصفح */}
          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-gray-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>صور المنتج (ضغط تلقائي بصيغة WebP)</span>
                </h4>
                <p className="text-[11px] text-gray-500 font-tajawal">
                  يتم ضغط كل صورة في المتصفح تلقائياً قبل الرفع لتسريع تصفح المتجر
                </p>
              </div>

              <label className="cursor-pointer bg-white border border-gray-200 hover:border-emerald-500 text-gray-700 hover:text-emerald-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5">
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                <span>{isUploading ? 'جارٍ الضغط والرفع...' : 'رفع صور جديدة'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  disabled={isUploading}
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* معاينة الصور المرفوعة */}
            {images.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group bg-white shadow-2xs"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 left-1 bg-red-600 text-white rounded-lg p-1 opacity-80 hover:opacity-100 shadow transition-opacity"
                      title="حذف الصورة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                        الرئيسية
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl bg-white">
                لا توجد صور مضافة للمنتج حتى الآن.
              </div>
            )}
          </div>

          {/* الخيارات الفرعية الديناميكية (Variants) */}
          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50">
            <h4 className="font-bold text-xs sm:text-sm text-gray-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>الخيارات الفرعية (Variants)</span>
            </h4>
            <p className="text-[11px] text-gray-500 font-tajawal mb-4">
              مثل الألوان، المقاسات، الأحجام، السعات، أو القدرة الكهربائية
            </p>

            {/* إضافة نوع خاصية جديد */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="اسم الخاصية الجديدة (مثال: اللون، المقاس، السعة)..."
                value={newVariantName}
                onChange={(e) => setNewVariantName(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none bg-white"
              />
              <button
                type="button"
                onClick={addVariantType}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة خاصية</span>
              </button>
            </div>

            {/* قائمة الخصائص وخياراتها */}
            <div className="space-y-3">
              {variants.map((v, vIdx) => (
                <div
                  key={vIdx}
                  className="bg-white border border-gray-200 rounded-xl p-3 space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-gray-800">
                      خاصية: <span className="text-emerald-700">{v.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeVariantType(vIdx)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="حذف الخاصية بالكامل"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* رقائق الخيارات */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {v.options.map((opt, optIdx) => (
                      <span
                        key={optIdx}
                        className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 text-gray-800 px-2.5 py-1 rounded-lg text-xs font-bold"
                      >
                        <span>{opt}</span>
                        <button
                          type="button"
                          onClick={() => removeOptionFromVariant(vIdx, optIdx)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* إدخال خيار جديد داخل الخاصية */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder={`أضف خيار لـ ${v.name} (واضغط إضافة)...`}
                      value={currentOptionInputs[vIdx] || ''}
                      onChange={(e) =>
                        setCurrentOptionInputs({
                          ...currentOptionInputs,
                          [vIdx]: e.target.value,
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addOptionToVariant(vIdx);
                        }
                      }}
                      className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => addOptionToVariant(vIdx)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-bold"
                    >
                      إضافة خيار
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* مفتاح الظهور في المتجر */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div>
              <span className="font-bold text-xs sm:text-sm text-gray-900 block">
                ظهور المنتج في المتجر
              </span>
              <span className="text-[11px] text-gray-500 font-tajawal">
                عند الإيقاف، سيتم إخفاء المنتج فوراً عن الزوار دون حذفه
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* أزرار الحفظ والإلغاء */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl text-xs sm:text-sm transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/30 disabled:opacity-50"
            >
              {isSubmitting ? 'جارٍ الحفظ...' : 'حفظ ونشر المنتج'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
