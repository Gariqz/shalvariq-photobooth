// app/select-to-print/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, FrameLayout } from '@/store/useStore';
import { availableFrames } from '@/lib/frameData';
import { supabase } from '@/lib/supabase';
import { Printer, Trash2, ShoppingCart, Loader2, CheckCircle2, Focus } from 'lucide-react';
import { useRouter } from 'next/navigation';

const generateFinalImage = async (photos: string[], frame: FrameLayout): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = frame.width;
    canvas.height = frame.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject("Canvas tidak didukung");

    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((res, rej) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; 
        img.onload = () => res(img);
        img.onerror = rej;
        img.src = src;
      });
    };

    const renderProcess = async () => {
      try {
        for (let i = 0; i < photos.length; i++) {
          if (!photos[i]) continue; // Lewati kalau slot kosong
          const slot = frame.slots[i];
          const img = await loadImage(photos[i]);
          ctx.drawImage(img, slot.x, slot.y, slot.width, slot.height);
        }
        const overlay = await loadImage(frame.overlayImage);
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

export default function SelectToPrint() {
  const router = useRouter();
  const { capturedPhotos, stopTimer } = useStore(); // Ambil fungsi stopTimer
  
  const [activeFrame, setActiveFrame] = useState(availableFrames[0]);
  
  // State selectedShots sekarang berupa array dengan panjang statis sesuai total slot frame
  const [selectedShots, setSelectedShots] = useState<string[]>(() => 
    Array(availableFrames[0].totalShots).fill('')
  );
  // State untuk melacak slot mana yang lagi dipilih/aktif buat diisi
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);
  const [isRendering, setIsRendering] = useState(false);

  // UX REVISI: Matikan countdown 5 menit kiosk begitu masuk halaman ini biar user gak panik
  useEffect(() => {
    if (stopTimer) stopTimer();
  }, [stopTimer]);

  // Mengisi slot yang sedang aktif dengan foto yang di-tap dari gallery
  const handleSelectPhoto = (photoSrc: string) => {
    const updatedShots = [...selectedShots];
    updatedShots[activeSlotIndex] = photoSrc;
    setSelectedShots(updatedShots);
    
    // Auto pindah fokus ke slot kosong berikutnya (kalau ada)
    const nextEmptySlot = updatedShots.findIndex(shot => shot === '');
    if (nextEmptySlot !== -1) {
      setActiveSlotIndex(nextEmptySlot);
    }
  };

  const handleRemoveShot = (indexToRemove: number) => {
    const updatedShots = [...selectedShots];
    updatedShots[indexToRemove] = '';
    setSelectedShots(updatedShots);
    setActiveSlotIndex(indexToRemove); // Langsung fokuskan kembali ke slot yang baru dikosongkan
  };

  const handleChangeFrame = (frameId: string) => {
    const frame = availableFrames.find(f => f.id === frameId);
    if (frame) {
      setActiveFrame(frame);
      setSelectedShots(Array(frame.totalShots).fill('')); // Reset isi slot
      setActiveSlotIndex(0); // Balik ke slot pertama
    }
  };

  const handlePrint = async () => {
    setIsRendering(true);
    try {
      const finalImageBase64 = await generateFinalImage(selectedShots, activeFrame);
      const imageBlob = base64ToBlob(finalImageBase64, 'image/jpeg');
      const uniqueFileName = `shalvariq_${Date.now()}.jpg`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('photobooth-prints')
        .upload(uniqueFileName, imageBlob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      // DOMAIN REVISI: Ganti link ini pake domain website Shalvariq lu yang udah live di Vercel nanti!
      const productionDomain = "https://shalvariq-photobooth.vercel.app"; 
      const brandedDownloadUrl = `${productionDomain}/download?file=${encodeURIComponent(uniqueFileName)}`;

      // ALAM FISIK (Dikomak sementara buat testing digital flow)
      /*
      try {
        await fetch('http://localhost:4000/api/print', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: finalImageBase64 })
        });
      } catch (hardwareError) {
        console.warn("Printer offline mode:", hardwareError);
      }
      */

      // Lempar ke halaman sukses membawa URL Landing Page Handphone
      router.push(`/success?url=${encodeURIComponent(brandedDownloadUrl)}`);

    } catch (error) {
      console.error(error);
      alert("Gagal mengunggah gambar ke cloud.");
    } finally {
      setIsRendering(false);
    }
  };

  // Cek apakah semua slot sudah terisi penuh tanpa ada string kosong
  const isPrintReady = selectedShots.every(shot => shot !== '');

  return (
    <main className="relative flex h-screen w-screen flex-col items-center justify-between py-6 px-6 text-[#2c2c2c] overflow-hidden select-none">
      
      {/* HEADER */}
      <div className="z-20 flex flex-col items-center w-full mt-1">
        <h1 className="font-serif text-3xl font-black italic mb-4 text-center">
          Susun <span className="text-highlight">Foto Anda.</span>
        </h1>
        
        <div className="flex gap-4 p-2 bg-white border-[3px] border-[#2c2c2c] shadow-[4px_4px_0px_#2c2c2c]">
          {availableFrames.map(frame => (
            <button
              key={frame.id}
              onClick={() => handleChangeFrame(frame.id)}
              className={`px-6 py-2 text-sm font-bold uppercase tracking-wider transition-all border-2 border-transparent ${
                activeFrame.id === frame.id 
                  ? 'bg-[#c95d63] text-white border-[#2c2c2c]' 
                  : 'bg-transparent text-[#2c2c2c] hover:bg-gray-100'
              }`}
            >
              {frame.name}
            </button>
          ))}
        </div>
      </div>

      {/* CENTER WORKSPACE: Frame Canvas */}
      <div className="z-10 flex flex-col items-center justify-center flex-1 w-full my-2">
        <div 
          className="relative bg-white border-[4px] border-[#2c2c2c] shadow-[12px_12px_0px_rgba(44,44,44,0.15)] transition-all duration-500 transform rotate-1"
          style={{
            aspectRatio: `${activeFrame.width} / ${activeFrame.height}`,
            height: '48vh',
          }}
        >
          <div className="scrapbook-tape top-[-20px] right-[-30px] rotate-[35deg]" />

          {/* GENERATE KOTAK SLOT BERDASARKAN KOORDINAT */}
          {activeFrame.slots.map((slot, index) => {
            const shot = selectedShots[index];
            const isCurrentActive = activeSlotIndex === index;

            return (
              <div 
                key={index} 
                onClick={() => setActiveSlotIndex(index)} // Klik untuk mengaktifkan target slot
                className={`absolute flex items-center justify-center overflow-hidden cursor-pointer group transition-all ${
                  isCurrentActive 
                    ? 'border-4 border-[#c95d63] bg-[#fdf2f2] z-20 scale-[1.02] shadow-lg' 
                    : 'bg-[#f4f4f4] border-2 border-dashed border-[#ccc]'
                }`}
                style={{
                  left: `${(slot.x / activeFrame.width) * 100}%`,
                  top: `${(slot.y / activeFrame.height) * 100}%`,
                  width: `${(slot.width / activeFrame.width) * 100}%`,
                  height: `${(slot.height / activeFrame.height) * 100}%`,
                }}
              >
                {shot ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={shot} alt={`Slot ${index + 1}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleRemoveShot(index); }}
                      className="absolute inset-0 z-30 bg-[#c95d63]/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <div className="bg-white text-[#c95d63] p-2 rounded-full border-2 border-[#c95d63]">
                        <Trash2 size={24} />
                      </div>
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

      {/* BOTTOM DOCK */}
      <div className="w-full max-w-6xl bg-white border-[4px] border-[#2c2c2c] p-5 z-20 shadow-[8px_8px_0px_#2c2c2c] flex gap-6 items-center relative">
        <div className="absolute top-[-15px] left-6 bg-highlight px-4 py-1 border-2 border-[#2c2c2c] font-bold text-xs uppercase tracking-widest transform rotate-[-2deg]">
          Tap foto untuk isi kotak aktif
        </div>

        {/* Gallery Horizontal */}
        <div className="flex-1 overflow-x-auto no-scrollbar flex gap-4 items-center pt-2 pb-2 px-2">
          {capturedPhotos.map((photo, index) => {
            // Cek apakah foto ini sudah ada di dalam array selectedShots
            const isSelected = selectedShots.includes(photo);
            
            return (
              <motion.button
                key={index}
                whileTap={isSelected ? {} : { scale: 0.95 }}
                onClick={() => !isSelected && handleSelectPhoto(photo)}
                disabled={isSelected} // MATIIN TOMBOL KALAU UDAH DIPILIH
                className={`relative shrink-0 h-28 w-24 bg-white p-1.5 pb-6 border-[2px] border-[#2c2c2c] transition-all transform ${
                  isSelected 
                    ? 'opacity-40 scale-95 shadow-none rotate-0 cursor-not-allowed' // Tampilan kalau udah kepake
                    : 'shadow-[3px_3px_0px_#2c2c2c] hover:-translate-y-1 even:rotate-[2deg] odd:rotate-[-2deg] cursor-pointer'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo} alt={`Hasil ${index}`} className="w-full h-full object-cover grayscale-[10%]" />
                <div className="absolute bottom-0.5 right-1.5 font-serif font-bold text-[#2c2c2c] text-xs">
                  #{index + 1}
                </div>
                
                {/* Indikator Checklist Bintang */}
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-[1px]">
                    <div className="bg-[#c95d63] rounded-full p-2 border-2 border-[#2c2c2c] shadow-md transform rotate-12">
                      <CheckCircle2 size={24} className="text-white" strokeWidth={3} />
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        <div className="h-28 w-0.5 bg-gray-300 border-l-2 border-dashed border-[#ccc] shrink-0" />

        {/* Tombol Cetak */}
        <div className="flex flex-col gap-3 min-w-[260px] shrink-0">
          <button 
            onClick={handlePrint}
            disabled={!isPrintReady || isRendering}
            className={`flex items-center justify-center gap-3 w-full py-4 border-[4px] border-[#2c2c2c] text-lg font-black uppercase tracking-widest transition-all ${
              isPrintReady && !isRendering
                ? 'bg-[#c95d63] text-white shadow-[6px_6px_0px_#2c2c2c] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-none cursor-pointer' 
                : 'bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed shadow-none'
            }`}
          >
            {isRendering ? (
              <><Loader2 size={24} className="animate-spin text-[#2c2c2c]" /> Menyimpan...</>
            ) : (
              <><Printer size={24} /> {isPrintReady ? 'Cetak Sekarang' : 'Isi Semua Slot'}</>
            )}
          </button>
          
          <button className="flex items-center justify-center gap-2 w-full py-2 bg-white border-2 border-[#2c2c2c] text-xs font-bold text-[#2c2c2c] uppercase tracking-wider shadow-[2px_2px_0px_#2c2c2c]">
            <ShoppingCart size={14} /> Cetak 1 Lembar Lagi (+15k)
          </button>
        </div>
      </div>
    </main>
  );
}