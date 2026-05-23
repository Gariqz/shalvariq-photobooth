// app/packages/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { ArrowLeft, Clock, CheckCircle, Ticket, Loader2 } from 'lucide-react';

export default function PackageSelection() {
  const router = useRouter();
  const { startSession, setPaymentStatus } = useStore();
  
  const [showQRIS, setShowQRIS] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  
  // State menampung data balikan Midtrans
  const [qrisUrl, setQrisUrl] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Fungsi menembak API backend untuk mendapatkan QRIS
  const handleSelectPackage = async (amount: number) => {
    setIsLoadingQR(true);
    setShowQRIS(true);
    
    try {
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      const data = await res.json();
      
      if (data.actions && data.actions[0].url) {
        setQrisUrl(data.actions[0].url); // URL image QRIS dari Midtrans
        setOrderId(data.order_id);       // Order ID untuk bahan pengecekan
      } else {
        throw new Error("Gagal generate QRIS");
      }
    } catch (error) {
      alert("Sistem pembayaran sedang sibuk, silakan coba beberapa saat lagi.");
      setShowQRIS(false);
    } finally {
      setIsLoadingQR(false);
    }
  };

  // Efek Polling: Cek status pembayaran ke API setiap 3 detik
  useEffect(() => {
    if (orderId && !paymentSuccess) {
      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/payment/status?order_id=${orderId}`);
          const data = await res.json();
          
          // 'settlement' atau 'capture' berarti pembayaran BERHASIL / LUNAS
          if (data.status === 'settlement' || data.status === 'capture') {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setPaymentSuccess(true);
            setPaymentStatus(true);
            
            // Jeda 2 detik biar user kesengsem liat status Lunas, baru masuk studio jepret
            setTimeout(() => {
              if (startSession) startSession(300); // Sesi jepret kamera dimulai
              router.push('/capture');
            }, 2000);
          }
        } catch (error) {
          console.error("Gagal cek status otomatis:", error);
        }
      }, 3000); // 3000ms = 3 detik
    }

    // Bersihkan interval kalau komponen dibongkar / user keluar halaman
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [orderId, paymentSuccess, router, setPaymentStatus, startSession]);

  return (
    <main className="relative flex h-screen w-screen flex-col items-center justify-center p-8 overflow-hidden text-[#2c2c2c] bg-grid-paper">
      
      {/* Tombol Kembali */}
      {!showQRIS && (
        <button 
          onClick={() => router.push('/')}
          className="absolute top-8 left-8 flex items-center gap-2 bg-white border-2 border-[#2c2c2c] px-5 py-3 transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_#2c2c2c] active:translate-y-1 active:shadow-none z-20 font-bold"
        >
          <ArrowLeft size={20} strokeWidth={3} />
          <span className="text-lg uppercase tracking-wider">Kembali</span>
        </button>
      )}

      <AnimatePresence mode="wait">
        {!showQRIS ? (
          // STEP 1: PILIH SESI
          <motion.div 
            key="packages"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center w-full max-w-xl z-20"
          >
            <div className="mb-2">
              <Ticket size={48} className="text-highlight" />
            </div>
            <h1 className="text-5xl font-serif font-black mb-4 tracking-tight text-center">
              Pilih <span className="text-highlight italic">Sesi.</span>
            </h1>
            <p className="text-lg font-medium text-gray-500 mb-10 text-center uppercase tracking-widest">
              Langkah 02 — Konfirmasi Studio
            </p>

            <div className="relative w-full bg-white border-[3px] border-[#2c2c2c] p-10 flex flex-col items-center text-center shadow-[8px_8px_0px_#2c2c2c]">
              <div className="scrapbook-tape top-[-15px] left-1/2 transform -translate-x-1/2 rotate-[2deg]" />
              <Clock size={48} className="mb-4 text-[#2c2c2c]" strokeWidth={1.5} />
              <h2 className="text-3xl font-black mb-2 uppercase tracking-wide">Sesi 5 Menit</h2>
              <p className="text-gray-600 mb-8 font-medium px-4">
                Bebas jepret tanpa batas waktu sesi jepret. <br/>
                <span className="font-bold text-[#c95d63]">Mendapatkan 2 Lembar Strip (Isi 6 Foto).</span>
              </p>
              
              <button 
                onClick={() => handleSelectPackage(35000)}
                className="w-full btn-retro text-xl py-4 uppercase tracking-widest flex items-center justify-center gap-3"
              >
                Bayar Rp 35.000
              </button>
            </div>
          </motion.div>

        ) : (
          // STEP 2: TAMPILAN QRIS SCANNER
          <motion.div
            key="qris"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative flex flex-col items-center bg-white border-[3px] border-[#2c2c2c] p-12 shadow-[8px_8px_0px_#2c2c2c] z-20 w-full max-w-md"
          >
            <div className="scrapbook-tape top-[-15px] right-[-20px] rotate-[45deg]" />

            {!paymentSuccess ? (
              <>
                <h2 className="text-3xl font-serif font-black mb-2 text-center italic">Scan QRIS</h2>
                <div className="border-b-2 border-dashed border-gray-300 w-full mb-6 pb-4 text-center">
                  <p className="text-gray-500 uppercase tracking-widest text-sm font-bold">Total Tagihan</p>
                  <p className="text-2xl font-black text-highlight">Rp 35.000</p>
                </div>
                
                {/* QR Code Canvas dari Midtrans */}
                <div className="bg-white border-2 border-gray-200 p-2 mb-8 min-h-[220px] min-w-[220px] flex items-center justify-center shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05)]">
                  {isLoadingQR ? (
                    <div className="flex flex-col items-center gap-3 text-gray-400">
                      <Loader2 size={32} className="animate-spin" />
                      <span className="text-xs font-bold uppercase tracking-wider">Memuat QRIS...</span>
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrisUrl} alt="QRIS Code dari Midtrans" className="w-[200px] h-[200px] object-contain" />
                  )}
                </div>
                
                <div className="flex items-center gap-3 font-bold text-gray-600 uppercase tracking-wider text-sm">
                  <div className="w-4 h-4 border-2 border-[#2c2c2c] border-t-transparent rounded-full animate-spin" />
                  Menunggu Pembayaran...
                </div>
              </>
            ) : (
              // STEP 3: STATUS LUNAS DETECTED
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center py-10"
              >
                <div className="bg-[#2c2c2c] rounded-full p-4 mb-6">
                  <CheckCircle size={64} className="text-white" />
                </div>
                <h2 className="text-4xl font-serif font-black mb-3 italic">Lunas!</h2>
                <p className="text-lg font-bold text-gray-500 uppercase tracking-widest text-center">
                  Siapkan gayamu...
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}