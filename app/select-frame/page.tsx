// app/select-frame/page.tsx
'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { availableFrames } from '@/lib/frameData';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function SelectFrame() {
  const router = useRouter();
  const { setFrame, setStep } = useStore();
  
  // State lokal buat nampung frame yang lagi ditunjuk sebelum di-confirm
  const [activeFrameId, setActiveFrameId] = useState<string>(availableFrames[0].id);

  const handleConfirm = () => {
    const selected = availableFrames.find(f => f.id === activeFrameId);
    if (selected) {
      setFrame(selected);
      setStep('capture');
      router.push('/capture');
    }
  };

  return (
    <main className="relative flex h-screen w-screen flex-col items-center justify-center bg-zinc-950 p-8 overflow-hidden">
      
      {/* Header & Back Button */}
      <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-20">
        <button 
          onClick={() => router.push('/')}
          className="flex items-center gap-2 rounded-full bg-zinc-800/80 backdrop-blur-md px-6 py-3 text-white transition-all hover:bg-zinc-700 active:scale-95"
        >
          <ArrowLeft size={24} />
          <span className="text-xl font-medium">Kembali</span>
        </button>

        {/* Dynamic Title */}
        <motion.h1 
          key={activeFrameId} // Trick biar animasinya jalan tiap ganti frame
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-white text-center"
        >
          Pilih Desain Frame
        </motion.h1>
        
        {/* Placeholder biar judul tetep di tengah */}
        <div className="w-32" /> 
      </div>

      {/* Frame Selection Container */}
      <div className="relative mt-12 w-full max-w-6xl flex items-center justify-center gap-8">
        
        {availableFrames.map((frame) => {
          const isActive = frame.id === activeFrameId;
          
          return (
            <motion.button
              key={frame.id}
              onClick={() => setActiveFrameId(frame.id)}
              animate={{ 
                scale: isActive ? 1.05 : 0.9,
                opacity: isActive ? 1 : 0.5,
                y: isActive ? -10 : 0
              }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`relative group flex flex-col items-center rounded-3xl p-4 transition-all duration-300 ${
                isActive ? 'bg-zinc-800 border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)]' : 'bg-transparent border-2 border-transparent'
              }`}
            >
              {/* Dummy Image Placeholder (Nanti ganti pakai tag <Image> dari Next.js) */}
              <div className="w-64 h-96 bg-zinc-700 rounded-2xl mb-6 relative overflow-hidden flex flex-col items-center justify-center gap-2">
                 {/* Visualisasi jumlah shot dari data frame */}
                 {Array.from({ length: frame.totalShots }).map((_, i) => (
                    <div key={i} className="w-48 h-20 bg-zinc-600 rounded" />
                 ))}
                 
                 {isActive && (
                    <div className="absolute top-4 right-4 bg-purple-500 rounded-full p-1 shadow-lg">
                      <CheckCircle2 size={24} className="text-white" />
                    </div>
                 )}
              </div>
              
              <h2 className={`text-2xl font-bold ${isActive ? 'text-white' : 'text-zinc-400'}`}>
                {frame.name}
              </h2>
              <p className="text-zinc-500 mt-2">{frame.totalShots} Pose Jepretan</p>
            </motion.button>
          );
        })}

      </div>

      {/* Big Confirm Button (Fitts's Law applied) */}
      <motion.button
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onClick={handleConfirm}
        className="absolute bottom-12 rounded-full bg-white text-black px-16 py-5 text-2xl font-bold shadow-[0_10px_40px_rgba(255,255,255,0.2)] active:scale-95"
      >
        Pilih Frame Ini
      </motion.button>

    </main>
  );
}