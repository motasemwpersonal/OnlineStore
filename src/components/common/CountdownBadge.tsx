import React from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import { Clock, Flame } from 'lucide-react';

interface CountdownBadgeProps {
  endDate: string;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
}

export const CountdownBadge: React.FC<CountdownBadgeProps> = ({
  endDate,
  size = 'sm',
  compact = false,
}) => {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(endDate);

  if (isExpired) return null;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-300">
        <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
        <span dir="ltr">
          {days > 0 ? `${days}d ` : ''}
          {pad(hours)}:{pad(minutes)}:{pad(seconds)}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white rounded-xl p-2.5 shadow-md flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-1.5 font-bold">
        <Flame className="w-4 h-4 text-yellow-300 animate-bounce" />
        <span>ينتهي العرض خلال:</span>
      </div>
      <div className="flex items-center gap-1 font-mono font-bold" dir="ltr">
        {days > 0 && (
          <div className="bg-black/30 px-1.5 py-0.5 rounded text-center">
            <span>{days}</span>
            <span className="text-[9px] block text-gray-200">يوم</span>
          </div>
        )}
        <div className="bg-black/30 px-1.5 py-0.5 rounded text-center">
          <span>{pad(hours)}</span>
          <span className="text-[9px] block text-gray-200">ساعة</span>
        </div>
        <span>:</span>
        <div className="bg-black/30 px-1.5 py-0.5 rounded text-center">
          <span>{pad(minutes)}</span>
          <span className="text-[9px] block text-gray-200">دقيقة</span>
        </div>
        <span>:</span>
        <div className="bg-black/30 px-1.5 py-0.5 rounded text-center text-yellow-300">
          <span>{pad(seconds)}</span>
          <span className="text-[9px] block text-gray-200">ثانية</span>
        </div>
      </div>
    </div>
  );
};
