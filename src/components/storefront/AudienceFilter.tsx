import React from 'react';
import { TargetAudienceType } from '@/types/database';
import { Users, Heart, User, Baby, Home } from 'lucide-react';

interface AudienceFilterProps {
  selectedAudience: string;
  onSelectAudience: (audience: string) => void;
}

export const audienceOptions: { label: string; value: string; icon: React.ReactNode; color: string }[] = [
  { label: 'الكل', value: 'الكل', icon: <Users className="w-4 h-4" />, color: 'emerald' },
  { label: 'قسم النساء', value: 'نساء', icon: <Heart className="w-4 h-4 text-pink-500" />, color: 'pink' },
  { label: 'قسم الرجال', value: 'رجال', icon: <User className="w-4 h-4 text-blue-500" />, color: 'blue' },
  { label: 'مستلزمات الأطفال', value: 'أطفال', icon: <Baby className="w-4 h-4 text-amber-500" />, color: 'amber' },
  { label: 'عام ومنزلي', value: 'عام', icon: <Home className="w-4 h-4 text-teal-500" />, color: 'teal' },
];

export const AudienceFilter: React.FC<AudienceFilterProps> = ({
  selectedAudience,
  onSelectAudience,
}) => {
  return (
    <div className="bg-white rounded-2xl p-2 sm:p-3 shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <span className="text-xs font-bold text-gray-500 px-2 shrink-0 hidden sm:inline">
          الفئة المستهدفة:
        </span>
        {audienceOptions.map((opt) => {
          const isSelected = selectedAudience === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onSelectAudience(opt.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.02]'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
