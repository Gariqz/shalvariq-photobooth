// app/select-to-print/page.tsx
'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, FrameLayout } from '@/store/useStore';
import { availableFrames } from '@/lib/frameData';
import { supabase } from '@/lib/supabase';
import { Printer, Trash2, ShoppingCart, Loader2, CheckCircle2, Focus } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

// ==========================================
// HELPER FUNCTIONS 
// ==========================================
const generateFinalImage = async (photos: string[], frame: FrameLayout): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = frame.width;
    canvas.height = frame.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error("Canvas tidak didukung"));

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const loadImage = (src: string, label: string): Promise<HTMLImageElement> => {
      return new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; 
        img.onload = () => res(img);
        img.onerror = () => rej(new Error(`Gagal memuat ${label}. Pastikan URL/file ini ada: ${src}`));
        img.src = src;
      });
    };

    const renderProcess = async () => {
      try {
        for (let i = 0; i < photos.length; i++) {
          if (!photos[i]) continue;
          const slot = frame.slots[i];
          const img = await loadImage(photos[i], `Foto User Slot-${i + 1}`);
          ctx.drawImage(img, slot.x, slot.y, slot.width, slot.height);
        }
        const overlay = await loadImage(frame.overlayImage, `Frame Overlay (${frame.name})`);
        ctx.drawImage(overlay, 0, 0, frame.width, frame.height);
        
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } catch (error) {
        reject(error);
      }
    };
    
    renderProcess();
  });
};

const base64ToBlob = (base64: string, mimeType: string) => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

// ==========================================
// KOMPONEN INTI
// ==========================================
function SelectToPrintContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customFrameUrl = searchParams.get('customFrame'); 

  const { capturedPhotos, stopTimer, selectedFrame, rawSoftFiles, sessionId, setFinalCollageBase64 } = useStore(); 
  
  const [activeFrame, setActiveFrame] = useState<FrameLayout>(selectedFrame || availableFrames[0]);
  const [selectedShots, setSelectedShots] = useState<string[]>(() => 
    Array((selectedFrame || availableFrames[0]).totalShots).fill('')
  );
  
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [isRendering, setIsRendering] = useState(false);
  const [showUpsell, setShowUpsell] = useState(false);

  useEffect(() => {
    if (customFrameUrl) {
      const baseTemplate = availableFrames.find(f => f.name.includes("3-SLOT")) || availableFrames[1]; 
      const customFrameObj: FrameLayout = {
        ...baseTemplate,
        id: 'custom-qr-frame',
        name: '✨ Custom Desainmu',
        overlayImage: customFrameUrl, 
      };
      setActiveFrame(customFrameObj);
      setSelectedShots(Array(customFrameObj.totalShots).fill(''));
      setActiveSlotIndex(0);
    }
  }, [customFrameUrl]);

  useEffect(() => {
    if (stopTimer) stopTimer();
  }, [stopTimer]);

  const handleSelectPhoto = (photoSrc: string) => {
    const updatedShots = [...selectedShots];
    updatedShots[activeSlotIndex] = photoSrc;
    setSelectedShots(updatedShots);
    
    const nextEmptySlot = updatedShots.findIndex(shot => shot === '');
    if (nextEmptySlot !== -1) {
      setActiveSlotIndex(nextEmptySlot);
    }
  };

  const handleRemoveShot = (indexToRemove: number) => {
    const updatedShots = [...selectedShots];
    updatedShots[indexToRemove] = '';
    setSelectedShots(updatedShots);
    setActiveSlotIndex(indexToRemove);
  };

  const handlePrint = async () => {
    setIsRendering(true);
    try {
      const finalImageBase64 = await generateFinalImage(selectedShots, activeFrame);
      setFinalCollageBase64(finalImageBase64); 
      setShowUpsell(true); 
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Gagal memproses gambar.");
    } finally {
      setIsRendering(false);
    }
  };

  const executeNormalPrint = async () => {
    setIsRendering(true);
    setShowUpsell(false);
    try {
      const finalImageBase64 = useStore.getState().finalCollageBase64;
      if (!finalImageBase64) throw new Error("Data gambar hilang, silakan ulangi.");
      
      // ==========================================
      // TEMBAK KE LOCAL PRINTER SERVER (MAC)
      // ==========================================
      try {
        console.log("Mengirim perintah cetak kertas biasa ke local server...");
        const printRes = await fetch('http://localhost:3001/print', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: finalImageBase64 })
        });
        if (!printRes.ok) console.warn("Local printer server nolak.");
      } catch (localErr) {
        console.error("Local Print Server mati atau belum di-start:", localErr);
      }
      // ==========================================

      const imageBlob = base64ToBlob(finalImageBase64, 'image/jpeg');
      const currentSession = sessionId || `SHALVARIQ-${Date.now()}`;
      
      const { error: uploadError } = await supabase.storage
        .from('photobooth-prints')
        .upload(`${currentSession}/hasil_kolase.jpg`, imageBlob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      const rawUploadPromises = rawSoftFiles.map(async (rawBase64, index) => {
        const rawBlob = base64ToBlob(rawBase64, 'image/jpeg');
        return supabase.storage
          .from('photobooth-prints')
          .upload(`${currentSession}/mentahan_${index + 1}.jpg`, rawBlob, { contentType: 'image/jpeg' });
      });

      await Promise.all(rawUploadPromises);

      const productionDomain = "https://shalvariq-photobooth.vercel.app"; 
      router.push(`/success?url=${encodeURIComponent(`${productionDomain}/download?session=${encodeURIComponent(currentSession)}`)}`);
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Gagal mengunggah gambar ke cloud.");
    } finally {
      setIsRendering(false);
    }
  };

  const isPrintReady = selectedShots.every(shot => shot !== '');

  return (
    <main className="relative flex h-screen w-screen flex-col items-center justify-between py-6 px-6 text-[#2c2c2c] overflow-hidden select-none bg-[#f7f6f2] bg-grid-paper">
      <div className="z-20 flex flex-col items-center w-full mt-1">
        <h1 className="font-serif text-3xl font-black italic mb-2 text-center">
          Susun <span className="text-[#c95d63]">Foto Anda.</span>
        </h1>
        <div className="text-xs uppercase tracking-widest font-bold text-gray-500 bg-white px-4 py-1 border-2 border-[#2c2c2c] shadow-[2px_2px_0px_#2c2c2c]">
          Layout Terpilih: {activeFrame.name}
        </div>
      </div>

      <div className="z-10 flex flex-col items-center justify-center flex-1 w-full my-2">
        <div 
          className="relative bg-white border-[4px] border-[#2c2c2c] shadow-[12px_12px_0px_rgba(44,44,44,0.15)] transition-all duration-500 transform rotate-1"
          style={{ aspectRatio: `${activeFrame.width} / ${activeFrame.height}`, height: '48vh' }}
        >
          <div className="scrapbook-tape top-[-20px] right-[-30px] rotate-[35deg]" />
          {activeFrame.slots.map((slot, index) => {
            const shot = selectedShots[index];
            const isCurrentActive = activeSlotIndex === index;
            return (
              <div 
                key={index} 
                onClick={() => setActiveSlotIndex(index)}
                className={`absolute flex items-center justify-center overflow-hidden cursor-pointer group transition-all ${
                  isCurrentActive ? 'border-4 border-[#c95d63] bg-[#fdf2f2] z-20 scale-[1.02] shadow-lg' : 'bg-[#f4f4f4] border-2 border-dashed border-[#ccc]'
                }`}
                style={{ left: `${(slot.x / activeFrame.width) * 100}%`, top: `${(slot.y / activeFrame.height) * 100}%`, width: `${(slot.width / activeFrame.width) * 100}%`, height: `${(slot.height / activeFrame.height) * 100}%` }}
              >
                {shot ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={shot} alt={`Slot ${index + 1}`} className="w-full h-full object-cover" />
                    <button onClick={(e) => { e.stopPropagation(); handleRemoveShot(index); }} className="absolute inset-0 z-30 bg-[#c95d63]/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="bg-white text-[#c95d63] p-2 rounded-full border-2 border-[#c95d63]"><Trash2 size={24} /></div>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1 text-center p-2">
                    {isCurrentActive && <Focus size={16} className="text-[#c95d63] animate-spin" />}
                    <span className={`font-black text-[10px] tracking-widest uppercase ${isCurrentActive ? 'text-[#c95d63]' : 'text-gray-400'}`}>
                      {isCurrentActive ? 'Target Isi' : `Slot ${index + 1}`}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activeFrame.overlayImage} alt={activeFrame.name} className="absolute inset-0 z-10 w-full h-full object-cover pointer-events-none" />
        </div>
      </div>

      <div className="w-full max-w-6xl bg-white border-[4px] border-[#2c2c2c] p-5 z-20 shadow-[8px_8px_0px_#2c2c2c] flex gap-6 items-center relative">
        <div className="absolute top-[-15px] left-6 bg-[#f5e6e8] px-4 py-1 border-2 border-[#2c2c2c] font-bold text-xs uppercase tracking-widest transform rotate-[-2deg]">
          Tap foto untuk isi kotak aktif
        </div>
        <div className="flex-1 overflow-x-auto no-scrollbar flex gap-4 items-center pt-2 pb-2 px-2">
          {capturedPhotos.map((photo, index) => {
            const isSelected = selectedShots.includes(photo);
            return (
              <motion.button
                key={index}
                whileTap={isSelected ? {} : { scale: 0.95 }}
                onClick={() => !isSelected && handleSelectPhoto(photo)}
                disabled={isSelected}
                className={`relative shrink-0 h-28 w-24 bg-white p-1.5 pb-6 border-[2px] border-[#2c2c2c] transition-all transform ${
                  isSelected ? 'opacity-40 scale-95 shadow-none rotate-0 cursor-not-allowed' : 'shadow-[3px_3px_0px_#2c2c2c] hover:-translate-y-1 even:rotate-[2deg] odd:rotate-[-2deg] cursor-pointer'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt={`Hasil ${index}`} className="w-full h-full object-cover grayscale-[10%]" />
                <div className="absolute bottom-0.5 right-1.5 font-serif font-bold text-[#2c2c2c] text-xs">#{index + 1}</div>
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[1px]">
                    <div className="bg-[#c95d63] rounded-full p-2 border-2 border-[#2c2c2c] shadow-md transform rotate-12"><CheckCircle2 size={24} className="text-white" strokeWidth={3} /></div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
        <div className="h-28 w-0.5 bg-gray-300 border-l-2 border-dashed border-[#ccc] shrink-0" />
        <div className="flex flex-col gap-3 min-w-[260px] shrink-0">
          <button 
            onClick={handlePrint}
            disabled={!isPrintReady || isRendering}
            className={`flex items-center justify-center gap-3 w-full py-4 border-[4px] border-[#2c2c2c] text-lg font-black uppercase tracking-widest transition-all ${
              isPrintReady && !isRendering ? 'bg-[#c95d63] text-white shadow-[6px_6px_0px_#2c2c2c] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-none cursor-pointer' : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed shadow-none'
            }`}
          >
            {isRendering ? <><Loader2 size={24} className="animate-spin text-[#2c2c2c]" /> Memproses...</> : <><Printer size={24} /> {isPrintReady ? 'Lanjut' : 'Isi Semua Slot'}</>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showUpsell && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white border-[4px] border-[#2c2c2c] max-w-xl w-full p-8 text-center shadow-[16px_16px_0px_#c95d63] transform rotate-1">
              <h2 className="font-serif text-3xl font-black italic mb-4">Tunggu Dulu! ✨</h2>
              <p className="font-bold text-gray-600 mb-8 leading-relaxed">
                Mau abadikan fotomu jadi <span className="text-[#c95d63] font-black">Keychain Akrilik</span> eksklusif yang bisa dikustomisasi? Cuma nambah <span className="text-[#2c2c2c] font-black text-xl">Rp15.000</span>!
              </p>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => router.push('/keychain-3d')} 
                  className="btn-retro w-full py-4 bg-[#c95d63] text-white font-black uppercase tracking-widest text-lg border-[3px] border-[#2c2c2c] shadow-[6px_6px_0px_#2c2c2c] hover:-translate-y-1 transition-transform"
                >
                  Mau Banget! (Kustom 3D)
                </button>
                <button 
                  onClick={executeNormalPrint} 
                  disabled={isRendering}
                  className="w-full py-4 bg-gray-100 text-gray-500 font-bold uppercase tracking-wider border-2 border-dashed border-gray-300 hover:bg-gray-200 hover:text-[#2c2c2c] transition-colors"
                >
                  {isRendering ? 'Sedang Menyimpan...' : 'Tidak, Lanjut Cetak Biasa'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function SelectToPrint() {
  return (
    <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center bg-[#f7f6f2]"><Loader2 size={48} className="animate-spin text-[#c95d63]" /></div>}>
      <SelectToPrintContent />
    </Suspense>
  );
}