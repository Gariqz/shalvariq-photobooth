// app/select-frame/page.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { availableFrames } from '@/lib/frameData';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export default function SelectFrameScreen() {
  const router = useRouter();
  const { setFrame, startSession } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentFrame = availableFrames[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % availableFrames.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + availableFrames.length) % availableFrames.length);
  };

  const handleSelect = () => {
    // 1. Simpan frame yang dipilih ke Global State
    setFrame(currentFrame);
    // 2. Mulai sesi (nyalain timer) dan lempar ke Kamera!
    startSession(180); // 180 detik = 3 menit
    router.push('/capture');
  };

  return (
    <main className="relative flex h-screen w-screen flex-col items-center justify-between py-10 px-6 bg-[#f7f6f2] bg-grid-paper text-[#2c2c2c] overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="z-20 flex flex-col items-center text-center mt-4 shrink-0">
        <h1 className="font-serif text-4xl font-black italic text-[#2c2c2c] tracking-tight mb-2">
          Pilih <span className="text-[#c95d63]">Layout Frame.</span>
        </h1>
        <p className="text-xs uppercase tracking-[0.2em] font-bold text-gray-500">
          Geser untuk melihat koleksi frame kami
        </p>
      </div>

      {/* CAROUSEL DISPLAY */}
      <div className="flex-1 flex items-center justify-center w-full max-w-5xl relative">
        
        {/* Tombol Kiri */}
        <button 
          onClick={handlePrev}
          className="absolute left-0 z-30 bg-white border-[4px] border-[#2c2c2c] p-4 rounded-full shadow-[6px_6px_0px_#2c2c2c] hover:translate-y-1 hover:shadow-[2px_2px_0px_#2c2c2c] active:shadow-none transition-all"
        >
          <ChevronLeft size={32} strokeWidth={3} className="text-[#c95d63]" />
        </button>

        {/* Display Frame di Tengah */}
        <div className="relative w-full max-w-[320px] aspect-[2/3] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 50, rotate: 5 }}
              animate={{ opacity: 1, x: 0, rotate: -2 }}
              exit={{ opacity: 0, x: -50, rotate: -5 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 bg-white border-[4px] border-[#2c2c2c] shadow-[16px_16px_0px_rgba(44,44,44,0.15)] flex flex-col p-4"
            >
              <div className="scrapbook-tape top-[-20px] left-1/2 transform -translate-x-1/2 rotate-[-3deg] z-20" />
              
              {/* Gambar Overlay Frame */}
              <div className="flex-1 relative bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
                {/* Kita tampilkan gambar overlay-nya langsung sebagai preview */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentFrame.overlayImage} alt={currentFrame.name} className="w-full h-full object-contain drop-shadow-md z-10" />
                <div className="absolute inset-0 flex items-center justify-center z-0 opacity-20">
                  <span className="font-black text-4xl uppercase tracking-widest text-gray-400 rotate-[-45deg]">Preview</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tombol Kanan */}
        <button 
          onClick={handleNext}
          className="absolute right-0 z-30 bg-white border-[4px] border-[#2c2c2c] p-4 rounded-full shadow-[6px_6px_0px_#2c2c2c] hover:translate-y-1 hover:shadow-[2px_2px_0px_#2c2c2c] active:shadow-none transition-all"
        >
          <ChevronRight size={32} strokeWidth={3} className="text-[#c95d63]" />
        </button>

      </div>

      {/* INFO FRAME & CTA */}
      <div className="z-20 w-full max-w-2xl bg-white border-[4px] border-[#2c2c2c] p-6 shadow-[8px_8px_0px_#2c2c2c] flex flex-col items-center gap-4 relative">
        <div className="text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
            Slot Foto: {currentFrame.totalShots} | Tipe: {currentFrame.type}
          </div>
          <h2 className="text-2xl font-black text-[#2c2c2c] uppercase tracking-wider">
            {currentFrame.name}
          </h2>
        </div>

        <button 
          onClick={handleSelect}
          className="btn-retro w-full py-4 text-xl tracking-widest font-bold uppercase flex items-center justify-center gap-3 bg-[#c95d63] text-white border-[4px] border-[#2c2c2c] shadow-[6px_6px_0px_#2c2c2c] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-none transition-all"
        >
          <Check size={24} strokeWidth={3} /> Pilih Frame Ini
        </button>
      </div>

    </main>
  );
}