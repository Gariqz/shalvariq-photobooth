// app/page.tsx
'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Camera, Sparkles } from 'lucide-react';

export default function AttractScreen() {
  const router = useRouter();

  const handleStart = () => {
    router.push('/packages');
  };

  return (
    // Seluruh layar adalah area tap untuk mulai (UX Kiosk Monitor Sentuh)
    <main 
      className="relative flex h-screen w-screen flex-col items-center justify-between py-12 px-6 cursor-pointer overflow-hidden select-none"
      onClick={handleStart}
    >
      
      {/* 1. BRANDING TOP BAR (Clean & Center) */}
      <div className="z-20 flex flex-col items-center text-center mt-4">
        <div className="font-serif text-4xl text-highlight font-black italic tracking-wider mb-1">
          Shalvariq Booth
        </div>
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-zinc-400">
          Where you want to capture your moments with
        </p>
      </div>

      {/* 2. CENTERPIECE: Tumpukan Polaroid & Coretan Tangan */}
      <div className="relative w-full max-w-2xl h-[380px] flex justify-center items-center z-10 pointer-events-none">
        
        {/* Foto Kiri */}
        <motion.div 
          className="absolute polaroid-card w-48 h-64 -translate-x-32"
          initial={{ rotate: -15, scale: 0.9, opacity: 0 }}
          animate={{ rotate: -8, scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop" alt="sample 1" className="w-full h-full object-cover grayscale-[20%] sepia-[10%]" />
        </motion.div>

        {/* Foto Kanan */}
        <motion.div 
          className="absolute polaroid-card w-48 h-64 translate-x-32"
          initial={{ rotate: 15, scale: 0.9, opacity: 0 }}
          animate={{ rotate: 12, scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=400&auto=format&fit=crop" alt="sample 2" className="w-full h-full object-cover grayscale-[20%] sepia-[10%]" />
        </motion.div>

        {/* Foto Tengah (Paling Depan) */}
        <motion.div 
          className="absolute polaroid-card w-56 h-72 z-20 shadow-xl border border-zinc-200"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          {/* Efek Selotip Kertas Khas Scrapbook */}
          <div className="scrapbook-tape top-[-18px] left-1/2 transform -translate-x-1/2 rotate-[-4deg]" />
          
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop" alt="sample main" className="w-full h-full object-cover sepia-[15%]" />
          
          <div className="absolute bottom-2.5 left-1/2 transform -translate-x-1/2 font-serif italic text-xs text-zinc-400 tracking-wide">
            captured moments
          </div>
        </motion.div>
      </div>

      {/* 3. INSTRUCTION & BIG CTA BUTTON */}
      <div className="z-20 flex flex-col items-center w-full max-w-md mb-4">
        <h1 className="text-4xl font-serif font-black text-[#2c2c2c] tracking-tight text-center leading-tight mb-6">
          Ready to make <span className="text-highlight italic">memories?</span>
        </h1>

        <motion.div
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-full"
        >
          <button className="btn-retro w-full py-5 text-xl tracking-widest font-bold uppercase flex items-center justify-center gap-3 bg-[#2c2c2c] text-[#f7f6f2]">
            <Camera size={24} />
            Tap Screen To Start
          </button>
        </motion.div>

        <p className="text-xs text-zinc-400 font-bold tracking-wider uppercase mt-4 flex items-center gap-1.5">
          {/* <Sparkles size={12} className="text-highlight" />  */}
          Press anywhere on the screen to begin
        </p>
      </div>

      {/* 4. HIDDEN ADMIN CORNER (Pojok Kanan Bawah) */}
      <button 
        className="absolute bottom-0 right-0 w-16 h-16 opacity-0 cursor-default z-50"
        onClick={(e) => {
          e.stopPropagation();
          console.log("Admin Panel Triggered");
        }}
        aria-label="Admin Access"
      />
    </main>
  );
}