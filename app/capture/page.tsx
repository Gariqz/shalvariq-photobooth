// app/capture/page.tsx
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store/useStore';
import { Camera, RefreshCcw, Check, Film, Clock, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CaptureScreen() {
  const router = useRouter();
  const webcamRef = useRef<Webcam>(null);
  
  const { addCapturedPhoto, capturedPhotos, setStep } = useStore();
  
  // STATE MODE FREE FIRE
  const [sessionTime, setSessionTime] = useState(180); // 3 Menit = 180 Detik
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [currentReviewPhoto, setCurrentReviewPhoto] = useState<string | null>(null);

  // 1. TIMER UTAMA (3 Menit)
  useEffect(() => {
    if (sessionTime <= 0) {
      handleFinishSession();
      return;
    }
    
    // Timer jalan terus selama gak lagi ada pop-up review
    if (!currentReviewPhoto) {
      const timer = setInterval(() => setSessionTime((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [sessionTime, currentReviewPhoto]);

  // Format ke MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const takePhoto = useCallback(() => {
    const rawImage = webcamRef.current?.getScreenshot();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 400);

    if (rawImage) {
      setCurrentReviewPhoto(rawImage);
    }
  }, []);

  // Kita kurangi hitung mundur jepret jadi 3 detik aja biar mereka bisa jepret banyak!
  const triggerCapture = useCallback(() => {
    if (countdown !== null || currentReviewPhoto) return;
    setCountdown(3); 
  }, [countdown, currentReviewPhoto]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      takePhoto();
      setCountdown(null);
    }
  }, [countdown, takePhoto]);

  const handleRetake = () => {
    setCurrentReviewPhoto(null);
  };

  const handleKeep = () => {
    if (currentReviewPhoto) {
      addCapturedPhoto(currentReviewPhoto); // Ini otomatis nyimpen ke rawSoftFiles juga berkat useStore baru
      setCurrentReviewPhoto(null);
    }
  };

  const handleFinishSession = () => {
    setStep('selection_print');
    router.push('/select-to-print');
  };

  const isFocusMode = countdown !== null;

  return (
    <main className="relative flex h-screen w-screen flex-col bg-[#1a1a1a] overflow-hidden">
      
      {/* KAMERA FULLSCREEN */}
      <div className="absolute inset-2 border-8 border-[#2c2c2c] rounded-3xl overflow-hidden z-0 bg-black shadow-inner">
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored={true}
          screenshotFormat="image/jpeg"
          videoConstraints={{ width: 1920, height: 1080, facingMode: "user" }}
          className="absolute inset-0 w-full h-full object-cover grayscale-[15%] contrast-125"
        />
      </div>

      {/* FOCUS MODE: Hitung Mundur */}
      <AnimatePresence mode="popLayout">
        {countdown !== null && countdown > 0 && (
          <motion.div
            key={countdown}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none"
          >
            <h1 className="text-[300px] font-serif font-black italic text-highlight drop-shadow-[8px_8px_0px_#2c2c2c]">
              {countdown}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* UI ATAS: Indikator Waktu & Selesai */}
      <motion.div 
        animate={{ y: isFocusMode || currentReviewPhoto ? -150 : 0 }}
        className="absolute top-10 left-10 right-10 z-20 flex justify-between items-center"
      >
        {/* Indikator Waktu */}
        <div className={`bg-white border-[3px] border-[#2c2c2c] px-6 py-3 shadow-[6px_6px_0px_#2c2c2c] flex gap-3 items-center text-[#2c2c2c] text-xl font-black uppercase tracking-widest transform rotate-[2deg] transition-colors ${sessionTime <= 30 ? 'bg-red-100 text-red-600' : ''}`}>
          <div className="scrapbook-tape top-[-15px] left-1/2 transform -translate-x-1/2 rotate-[-5deg]" />
          <Clock size={24} className={sessionTime <= 30 ? 'animate-pulse' : ''} />
          {formatTime(sessionTime)}
        </div>

        {/* Tombol Selesai Lebih Awal */}
        <button 
          onClick={handleFinishSession}
          className="bg-[#c95d63] text-white border-[3px] border-[#2c2c2c] px-6 py-3 shadow-[6px_6px_0px_#2c2c2c] flex gap-3 items-center text-lg font-black uppercase tracking-widest hover:translate-y-1 hover:shadow-[2px_2px_0px_#2c2c2c] transition-all cursor-pointer"
        >
          Selesai & Pilih Foto <ArrowRight size={20} strokeWidth={3} />
        </button>
      </motion.div>

      {/* UI BAWAH: Gallery & Tombol Jepret */}
      <motion.div 
        animate={{ y: isFocusMode || currentReviewPhoto ? 300 : 0 }}
        className="absolute bottom-12 left-0 right-0 px-12 z-20 pointer-events-auto flex justify-between items-end"
      >
        {/* KOLOM KIRI: Gallery Horizontal Polaroid */}
        <div className="flex-1 flex gap-4 overflow-x-auto no-scrollbar max-w-xl pb-4">
          <AnimatePresence>
            {capturedPhotos.length === 0 ? (
              <div className="bg-white/90 border-2 border-dashed border-[#2c2c2c] px-6 py-4 flex items-center gap-3 transform rotate-[-2deg]">
                <Film size={24} className="text-gray-400" />
                <p className="text-[#2c2c2c] font-bold uppercase tracking-wider text-sm">Belum ada foto</p>
              </div>
            ) : (
              capturedPhotos.map((photo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="h-32 w-28 shrink-0 bg-white p-2 pb-8 border-2 border-[#2c2c2c] shadow-[4px_4px_0px_#2c2c2c] relative rotate-[2deg] even:rotate-[-2deg]"
                >
                  <img src={photo} alt={`Tersimpan ${index}`} className="w-full h-full object-cover grayscale-[20%]" />
                  <div className="absolute bottom-1 right-2 font-serif font-bold text-[#2c2c2c]">#{index + 1}</div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* KOLOM TENGAH: Tombol Jepret */}
        <div className="flex-1 flex justify-center pb-4">
          <button
            onClick={triggerCapture}
            className="group flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-[#c95d63] border-[6px] border-[#2c2c2c] shadow-[0px_10px_0px_#2c2c2c] hover:shadow-[0px_6px_0px_#2c2c2c] hover:translate-y-[4px] active:shadow-none active:translate-y-[10px] transition-all duration-150"
          >
            <div className="w-24 h-24 rounded-full border-4 border-[#2c2c2c] border-dashed flex items-center justify-center opacity-80 group-active:scale-90 transition-transform">
              <Camera size={48} className="text-[#2c2c2c]" />
            </div>
          </button>
        </div>

        {/* KOLOM KANAN: Counter Total */}
        <div className="flex-1 flex justify-end pb-4">
           <div className="bg-white border-[3px] border-[#2c2c2c] p-4 text-center transform rotate-[-3deg] shadow-[4px_4px_0px_#2c2c2c]">
              <div className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Total Jepretan</div>
              <div className="font-serif text-3xl font-black text-[#c95d63]">{capturedPhotos.length}</div>
           </div>
        </div>
      </motion.div>

      {/* MODAL REVIEW POP-UP */}
      <AnimatePresence>
        {currentReviewPhoto && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-[#1a1a1a]/80 backdrop-blur-sm flex flex-col items-center justify-center p-8"
          >
            <div className="bg-white p-6 pb-20 border-[4px] border-[#2c2c2c] shadow-[16px_16px_0px_#2c2c2c] relative max-w-3xl w-full transform rotate-1">
              <div className="scrapbook-tape top-[-20px] left-1/2 transform -translate-x-1/2 w-40 h-12 rotate-[-3deg]" />
              <h2 className="absolute bottom-5 left-1/2 transform -translate-x-1/2 text-3xl font-serif font-black text-[#2c2c2c] italic whitespace-nowrap">
                Simpan Foto?
              </h2>
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="w-full aspect-[4/3] bg-zinc-200 border-[3px] border-[#2c2c2c] overflow-hidden">
                <img src={currentReviewPhoto} alt="Review" className="w-full h-full object-cover" />
              </motion.div>
            </div>
            <div className="flex gap-6 mt-6">
              <button onClick={handleRetake} className="btn-retro bg-white text-[#2c2c2c] flex items-center gap-3 text-xl px-10 py-4 uppercase border-[3px] border-[#2c2c2c]">
                <RefreshCcw size={26} /> Ulangi
              </button>
              <button onClick={handleKeep} className="btn-retro bg-[#c95d63] text-white flex items-center gap-3 text-xl px-12 py-4 uppercase border-[3px] border-[#2c2c2c] shadow-[6px_6px_0px_#2c2c2c]">
                <Check size={26} /> Simpan
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* EFEK FLASH PUTIH */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            initial={{ opacity: 1 }} animate={{ opacity: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-[#fff5e6] z-50 pointer-events-none mix-blend-screen"
          />
        )}
      </AnimatePresence>

    </main>
  );
}