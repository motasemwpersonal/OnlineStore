import React from 'react';
import { Bundle, StoreSettings } from '@/types/database';
import { BundleCard } from './BundleCard';
import { Sparkles, Gift } from 'lucide-react';

interface BundlesSectionProps {
  bundles: Bundle[];
  settings?: StoreSettings;
}

export const BundlesSection: React.FC<BundlesSectionProps> = ({ bundles, settings }) => {
  if (bundles.length === 0) return null;

  return (
    <section className="mb-14 bg-gradient-to-br from-amber-500/10 via-emerald-500/5 to-teal-500/10 border border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
            <Gift className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900">
                باقات التوفير الشاملة
              </h2>
              <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                خصومات مضاعفة
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 font-tajawal mt-0.5">
              اشترِ مجموعات متكاملة من المنتجات بسعر مخفض استثنائي ووفّر أكثر
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundles.map((bundle) => (
          <BundleCard key={bundle.id} bundle={bundle} settings={settings} />
        ))}
      </div>
    </section>
  );
};
