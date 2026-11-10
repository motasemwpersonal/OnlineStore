import React, { useState, useEffect } from 'react';
import { StoreSettings } from '@/types/database';
import { updateStoreSettings } from '@/lib/api';
import { Settings, Save, PhoneCall, DollarSign, Store } from 'lucide-react';
import { toast } from 'sonner';

interface StoreSettingsFormProps {
  settings?: StoreSettings;
  onRefresh: () => void;
}

export const StoreSettingsForm: React.FC<StoreSettingsFormProps> = ({
  settings,
  onRefresh,
}) => {
  const [storeName, setStoreName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [currency, setCurrency] = useState('ر.ي');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setStoreName(settings.store_name);
      setWhatsappNumber(settings.whatsapp_number);
      setCurrency(settings.currency);
      setDescription(settings.description || '');
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim() || !whatsappNumber.trim()) {
      toast.error('يرجى ملء اسم المتجر ورقم الواتساب');
      return;
    }

    setLoading(true);
    try {
      await updateStoreSettings({
        id: settings?.id,
        store_name: storeName.trim(),
        whatsapp_number: whatsappNumber.trim(),
        currency: currency.trim(),
        description: description.trim(),
      });
      toast.success('تم حفظ إعدادات المتجر بنجاح');
      onRefresh();
    } catch (err: any) {
      toast.error('فشل حفظ الإعدادات: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-black text-gray-900 text-lg">إعدادات المتجر والطلب</h3>
          <p className="text-xs text-gray-500 font-tajawal">
            تخصيص هوية المتجر ورقم الواتساب الذي يستقبل رسائل الطلبات المباشرة
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <Store className="w-4 h-4 text-emerald-600" />
            <span>اسم المتجر *</span>
          </label>
          <input
            type="text"
            required
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="معرض المنتجات والعروض الشامل"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4 text-emerald-600" />
            <span>رقم واتساب المبيعات لاستقبال الطلبات *</span>
          </label>
          <input
            type="text"
            required
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
            placeholder="967770000000 (بصيغة دولية بدون أصفار إضافية)"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono text-left"
            dir="ltr"
          />
          <span className="text-[11px] text-gray-400 mt-1 block">
            اكتب الرقم مع الرمز الدولي مباشرة (مثال: 967770000000 أو 966500000000)
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>رمز العملة الافتراضية *</span>
          </label>
          <input
            type="text"
            required
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="ر.ي أو ر.س أو $"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">
            الوصف التعريفي المختصر للمتجر
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="وجهتك الأولى للتسوق الشامل بأفضل العروض والخصومات الحصرية..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'جارٍ الحفظ...' : 'حفظ الإعدادات'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
