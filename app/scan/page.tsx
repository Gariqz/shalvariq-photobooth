// app/scan/page.tsx
'use client';

import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { useRouter } from 'next/navigation';
import { QrCode, Loader2, ArrowRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Setup Supabase Client (Pakai Kunci Anonim karena RLS custom_orders udah kita matikan)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function KioskScanner() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(true);
  const [loadingDb, setLoadingDb] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Fungsi yang jalan otomatis saat QR berhasil terbaca oleh webcam
  const handleScan = async (text: string) => {
    if (!text || !isScanning) return;
    
    // Stop scanner biar nggak ngebaca berkali-kali
    setIsScanning(false);
    setLoadingDb(true);
    setErrorMsg('');

    try {
      // Cek ke Supabase, apakah Order ID (text dari QR) ini ada?
      const { data, error } = await supabase
        .from('custom_orders')
        .select('frame_url')
        .eq('id', text)
        .single();

      if (error || !data) {
        throw new Error('Tiket QR tidak ditemukan di sistem!');
      }

      // Kalo sukses, lempar ke halaman photobooth bawa URL frame-nya!
      alert(`Sukses! Frame ditemukan. Lanjut ke bilik foto.`);
      
      // NANTI KITA BUKA COMMENT INI PAS FILE MAIN PAGE LU UDAH SIAP
      router.push(`/select-to-print?customFrame=${encodeURIComponent(data.frame_url)}`);
      
    } catch (err: any) {
      setErrorMsg(err.message);
      // Nyalain scanner lagi kalo gagal
      setTimeout(() => setIsScanning(true), 2000); 
    } finally {
      setLoadingDb(false);
    }
  };

  return (
    <main className="flex h-[100dvh] w-full flex-col items-center justify-center bg-[#2c2c2c] text-[#f7f6f2] overflow-hidden p-6 select-none">
      
      <div className="text-center mb-8">
        <h1 className="font-serif text-4xl font-black italic text-[#c95d63] mb-2">Shalvariq Kiosk.</h1>
        <p className="text-xs uppercase tracking-widest text-gray-400 font-bold">
          Arahkan Tiket QR Code Anda ke Kamera
        </p>
      </div>

      <div className="relative w-full max-w-sm aspect-square bg-black border-4 border-[#c95d63] rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(201,93,99,0.3)]">
        
        {isScanning ? (
                <Scanner 
                    // Format terbaru: onScan menerima array of detected barcodes
                    onScan={(detectedCodes) => {
                    if (detectedCodes && detectedCodes.length > 0) {
                        // Ambil rawValue dari barcode pertama yang terdeteksi
                        handleScan(detectedCodes[0].rawValue);
                    }
                    }}
                    onError={(error) => console.log(error?.message)}
                    // Untuk library versi baru, kadang options delay ada di komponen (tergantung versi)
                    // Kalau properties options ini merah juga, hapus aja blok options-nya.
                />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#2c2c2c]">
            {loadingDb ? (
              <Loader2 size={48} className="animate-spin text-[#c95d63]" />
            ) : (
              <QrCode size={48} className="text-gray-500" />
            )}
          </div>
        )}

        {/* Overlay Garis Bidik ala Viewfinder */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-3/4 h-3/4 border-2 border-white/30 rounded-lg"></div>
        </div>
      </div>

      <div className="mt-8 h-12 flex items-center justify-center">
        {errorMsg ? (
          <span className="text-red-400 font-bold bg-red-950/50 px-4 py-2 rounded-full border border-red-800">
            {errorMsg}
          </span>
        ) : (
          loadingDb && (
            <span className="text-[#c95d63] font-bold uppercase tracking-widest flex items-center gap-2">
              Memproses Tiket <Loader2 size={16} className="animate-spin" />
            </span>
          )
        )}
      </div>

    </main>
  );
}