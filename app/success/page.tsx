// app/success/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { CheckCircle, Smile, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

// 1. PISAHIN LOGIC UTAMA JADI KOMPONEN ANAK
function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearSession } = useStore();
  
  const imageUrl = searchParams.get('url') || '';
  const [countdown, setCountdown] = useState(120); // 2 Menit auto-reset

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown <= 0) {
      handleFinish();
    }

    return () => clearInterval(timer);
  }, [countdown]);

  const handleFinish = () => {
    clearSession(); 
    router.push('/'); 
  };

  const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(imageUrl)}`;

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center p-6 text-[#2c2c2c] overflow-hidden select-none bg-grid-paper">
      
      {/* KERTAS RESI PENGILESAN HASIL */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, rotate: -1 }}
        animate={{ opacity: 1, scale: 1, rotate: 1 }}
        className="bg-white border-[4px] border-[#2c2c2c] p-8 max-w-lg w-full shadow-[16px_16px_0px_#2c2c2c] text-center relative z-20 flex flex-col items-center"
      >
        <div className="scrapbook-tape top-[-20px] left-1/2 transform -translate-x-1/2 w-40 h-10 rotate-[2deg]" />

        <div className="flex justify-center mb-4 text-[#c95d63]">
          <CheckCircle size={64} strokeWidth={2.5} />
        </div>
        
        <h1 className="font-serif text-4xl font-black italic mb-2 tracking-tight">Terima Kasih!</h1>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest border-b-2 border-dashed border-gray-300 w-full pb-4 mb-6">
          Silakan ambil hasil cetak Anda di bawah.
        </p>

        {/* BOX GENERATOR QR CODE */}
        {imageUrl ? (
          <div className="flex flex-col items-center bg-[#f7f6f2] p-6 border-[3px] border-[#2c2c2c] mb-6 w-full shadow-[inset_4px_4px_0px_rgba(0,0,0,0.05)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={qrCodeApiUrl} 
              alt="QR Code Download" 
              className="w-64 h-64 border-[3px] border-[#2c2c2c] shadow-[6px_6px_0px_#2c2c2c] bg-white transition-transform hover:scale-105" 
            />
            <p className="text-xs font-bold text-[#2c2c2c] uppercase tracking-wider max-w-[280px] leading-relaxed mt-6">
              Silakan scan QR Code di atas menggunakan smartphone Anda untuk menyimpan versi digital.
            </p>
          </div>
        ) : (
          <p className="text-xs text-red-500 font-bold mb-6">Link QR Code gagal dimuat.</p>
        )}

        {/* TOMBOL SELESAI */}
        <button 
          onClick={handleFinish}
          className="btn-retro w-full py-4 text-lg font-black uppercase tracking-widest flex items-center justify-center gap-3 bg-[#c95d63] text-white border-[3px] border-[#2c2c2c] shadow-[6px_6px_0px_#2c2c2c] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-none transition-all"
        >
          <Smile size={24} strokeWidth={2.5} /> Selesai
        </button>
      </motion.div>

      {/* FOOTER TIMER */}
      <div className="absolute bottom-6 z-50 bg-white border-[3px] border-[#2c2c2c] px-6 py-3 shadow-[4px_4px_0px_#2c2c2c] transform rotate-[-1deg]">
        <div className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-3">
          <RefreshCw size={16} className="animate-spin text-[#c95d63]" strokeWidth={3} />
          Mesin kembali ke layar awal dalam {countdown} detik
        </div>
      </div>

    </div>
  );
}

// 2. BUNGKUS KOMPONEN UTAMA PAKE SUSPENSE
export default function SuccessScreen() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-[#f7f6f2] font-bold text-gray-500 uppercase tracking-widest">
        Menyiapkan Layar Selesai...
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}