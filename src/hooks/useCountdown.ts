import { useState, useEffect } from 'react';

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalSeconds: number;
  formatted: string;
}

export function useCountdown(targetDate: string | Date | undefined | null): CountdownResult {
  const calculateTimeRemaining = (): CountdownResult => {
    if (!targetDate) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        totalSeconds: 0,
        formatted: '00:00:00',
      };
    }

    const difference = new Date(targetDate).getTime() - new Date().getTime();

    if (difference <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true,
        totalSeconds: 0,
        formatted: 'منتهي',
      };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);
    const totalSeconds = Math.floor(difference / 1000);

    // تنسيق زمني أنيق
    const pad = (n: number) => n.toString().padStart(2, '0');
    let formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    if (days > 0) {
      formatted = `${days} يوم و ` + formatted;
    }

    return {
      days,
      hours,
      minutes,
      seconds,
      isExpired: false,
      totalSeconds,
      formatted,
    };
  };

  const [timeLeft, setTimeLeft] = useState<CountdownResult>(calculateTimeRemaining);

  useEffect(() => {
    // حساب فوري عند تغيير التاريخ
    setTimeLeft(calculateTimeRemaining());

    const timer = setInterval(() => {
      const updated = calculateTimeRemaining();
      setTimeLeft(updated);
      if (updated.isExpired) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}
