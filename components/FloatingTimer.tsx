// components/FloatingTimer.tsx
'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Hourglass } from 'lucide-react';

export default function FloatingTimer() {
  const { timeLeft, isTimerActive, tickTimer, stopTimer } = useStore();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        tickTimer();
      }, 1000);
    } else if (timeLeft === 0) {
      stopTimer();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, tickTimer, stopTimer]);

  if (!isTimerActive) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed top-8 right-8 z-50 pointer-events-none">
      {/* Ornamen Selotip */}
      <div className="scrapbook-tape top-[-10px] left-1/2 transform -translate-x-1/2 rotate-[5deg] w-16 h-8" />
      
      <div className="bg-white border-4 border-[#2c2c2c] px-6 py-3 shadow-[6px_6px_0px_#2c2c2c] flex items-center gap-3 transform rotate-[-2deg]">
        <Hourglass size={24} className="text-highlight animate-pulse" strokeWidth={2.5} />
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 leading-none mb-1">
            Sisa Waktu
          </span>
          <span className="font-serif font-black text-2xl text-[#2c2c2c] leading-none tracking-wider">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>
    </div>
  );
}