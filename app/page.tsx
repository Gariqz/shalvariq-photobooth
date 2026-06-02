// app/page.tsx
'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Camera, QrCode } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { useEffect } from 'react';

export default function AttractScreen() {
  const router = useRouter();
  const { clearSession } = useStore();

  // Reset sesi Kiosk tiap kali balik ke halaman utama
  useEffect(() => {
    clearSession();
  }, [clearSession]);

  return (
    <main className="relative flex h-screen w-screen flex-col items-center justify-between py-12 px-6 overflow-hidden select-none bg-[#f7f6f2] bg-grid-paper">
      
      <div className="z-20 flex flex-col items-center text-center mt-4">
        <div className="font-serif text-4xl text-[#c95d63] font-black italic tracking-wider mb-1">
          Shalvariq Booth
        </div>
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">
          Capture Your Memories Now
        </p>
      </div>

      <div className="relative w-full max-w-2xl h-[380px] flex justify-center items-center z-10 pointer-events-none">
        <motion.div className="absolute polaroid-card w-48 h-64 -translate-x-32" initial={{ rotate: -15, scale: 0.9, opacity: 0 }} animate={{ rotate: -8, scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}>
          <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop" alt="sample 1" className="w-full h-full object-cover grayscale-[20%] sepia-[10%]" />
        </motion.div>
        <motion.div className="absolute polaroid-card w-48 h-64 translate-x-32" initial={{ rotate: 15, scale: 0.9, opacity: 0 }} animate={{ rotate: 12, scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }}>
          <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop" alt="sample 2" className="w-full h-full object-cover grayscale-[20%] sepia-[10%]" />
        </motion.div>
        <motion.div className="absolute polaroid-card w-56 h-72 z-20 shadow-xl border border-zinc-200" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, type: "spring", stiffness: 100 }}>
          <div className="scrapbook-tape top-[-18px] left-1/2 transform -translate-x-1/2 rotate-[-4deg]" />
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop" alt="sample main" className="w-full h-full object-cover sepia-[15%]" />
          <div className="absolute bottom-2.5 left-1/2 transform -translate-x-1/2 font-serif italic text-xs text-zinc-400 tracking-wide">captured moments</div>
        </motion.div>
      </div>

      {/* DUA TOMBOL PILIHAN */}
      <div className="z-20 flex flex-col w-full max-w-md gap-4 mb-4">
        <h1 className="text-4xl font-serif font-black text-[#2c2c2c] tracking-tight text-center leading-tight mb-4">
          Ready to make <span className="text-[#c95d63] italic">memories?</span>
        </h1>

        {/* Karena milih frame di awal, Kiosk lempar ke select-to-print dulu! */}
        <button 
          onClick={() => router.push('/select-frame')} 
          className="btn-retro w-full py-5 text-lg tracking-widest font-bold uppercase flex items-center justify-center gap-3 bg-[#2c2c2c] text-[#f7f6f2] shadow-[6px_6px_0px_#c95d63] hover:-translate-y-1 transition-transform"
        >
          <Camera size={24} /> Mulai Sesi Standard
        </button>

        <button 
          onClick={() => router.push('/scan')} 
          className="btn-retro w-full py-4 text-base tracking-widest font-bold uppercase flex items-center justify-center gap-3 bg-[#f7f6f2] text-[#2c2c2c] border-[3px] border-[#2c2c2c] shadow-[4px_4px_0px_#2c2c2c] hover:bg-[#fff1f2] transition-colors"
        >
          <QrCode size={20} /> Punya Tiket Custom? Scan Sini
        </button>
      </div>

    </main>
  );
}