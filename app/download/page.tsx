// app/download/page.tsx
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, Heart, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

function DownloadContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  const [collageUrl, setCollageUrl] = useState<string | null>(null);
  const [rawUrls, setRawUrls] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSessionFiles() {
      if (!sessionId) {
        setError('ID Sesi tidak ditemukan di URL. Coba scan QR ulang dari mesin ya.');
        setLoading(false);
        return;
      }

      try {
        const { data, error: listError } = await supabase.storage
          .from('photobooth-prints')
          .list(sessionId);

        if (listError) throw listError;
        if (!data || data.length === 0) {
          setError('Waduh, foto kamu belum masuk ke server atau sudah expired (lewat 7 hari).');
          setLoading(false);
          return;
        }

        let collage: string | null = null;
        const rawFiles: string[] = [];

        data.forEach((file) => {
          const { data: { publicUrl } } = supabase.storage
            .from('photobooth-prints')
            .getPublicUrl(`${sessionId}/${file.name}`);

          if (file.name === 'hasil_kolase.jpg') {
            collage = publicUrl;
          } else if (file.name.startsWith('mentahan')) {
            rawFiles.push(publicUrl);
          }
        });

        setCollageUrl(collage);
        setRawUrls(rawFiles);
      } catch (err: any) {
        console.error("Supabase Storage Error:", err);
        setError('Gagal memuat data dari server. Koneksi tidak stabil.');
      } finally {
        setLoading(false);
      }
    }

    fetchSessionFiles();
  }, [sessionId]);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      window.open(url, '_blank');
    }
  };

  return (
    // FIX SCROLL: Pakai fixed inset-0 dan buang select-none & touch-pan-y
    <main className="fixed inset-0 z-50 flex flex-col items-center py-12 px-6 bg-[#f7f6f2] bg-grid-paper text-[#2c2c2c] overflow-y-auto overflow-x-hidden w-full h-full">
      
      <div className="flex flex-col items-center text-center mb-8 shrink-0">
        <span className="font-serif text-3xl font-black italic text-[#c95d63] tracking-wider">
          Shalvariq.
        </span>
        <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-1">
          Analog Memory Captured
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center my-20">
          <Loader2 size={48} className="animate-spin text-[#c95d63] mb-4" />
          <p className="font-bold text-gray-500 uppercase tracking-widest text-xs">Menarik Fotomu dari Cloud...</p>
        </div>
      ) : error ? (
        <div className="bg-[#fff1f2] border-[3px] border-[#e11d48] p-6 max-w-sm w-full flex flex-col items-center text-center shadow-[6px_6px_0px_#e11d48]">
          <AlertCircle size={40} className="text-[#e11d48] mb-3" />
          <p className="font-bold text-sm text-[#be123c]">{error}</p>
        </div>
      ) : (
        <>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm flex flex-col gap-4 mb-10 shrink-0"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 w-4 bg-[#c95d63] rounded-full border-2 border-[#2c2c2c]"></div>
              <h2 className="font-black uppercase tracking-widest text-sm">Foto Strip Utama</h2>
            </div>
            
            <div className="bg-white border-[3px] border-[#2c2c2c] p-4 pb-14 shadow-[10px_10px_0px_rgba(44,44,44,0.1)] w-full transform rotate-1 relative">
              <div className="scrapbook-tape top-[-15px] left-1/2 transform -translate-x-1/2 w-28 h-8 rotate-[-2deg]" />
              <div className="w-full bg-gray-100 border border-gray-200 overflow-hidden min-h-[300px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {collageUrl && <img src={collageUrl} alt="Hasil Foto Shalvariq" className="w-full h-auto object-contain" />}
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 font-serif italic text-xs text-gray-400 flex items-center gap-1">
                Thank you for coming <Heart size={10} className="text-[#c95d63] fill-[#c95d63]" />
              </div>
            </div>

            <button 
              onClick={() => collageUrl && handleDownload(collageUrl, `Shalvariq_Collage_${Date.now()}.jpg`)}
              className="btn-retro mt-2 bg-[#c95d63] text-white py-4 text-center font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 border-[3px] border-[#2c2c2c] shadow-[4px_4px_0px_#2c2c2c] w-full hover:-translate-y-1 transition-transform"
            >
              <Download size={20} strokeWidth={2.5} /> Unduh Strip Utama
            </button>
          </motion.div>

          {rawUrls.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="w-full max-w-sm flex flex-col gap-4 mb-10 shrink-0"
            >
              <div className="flex items-center gap-2 mb-2 border-t-2 border-dashed border-gray-300 pt-8">
                <div className="h-4 w-4 bg-[#00C4CC] rounded-full border-2 border-[#2c2c2c]"></div>
                <h2 className="font-black uppercase tracking-widest text-sm">Soft File Mentahan</h2>
              </div>
              <p className="text-xs text-gray-500 font-medium leading-relaxed mb-2">
                ⏱️ Unduh sekarang! Seluruh berkas foto (kolase & mentahan) di halaman ini akan dihapus permanen dari server dalam 7 hari demi menjaga privasi Anda.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {rawUrls.map((url, index) => (
                  <div key={index} className="bg-white border-[3px] border-[#2c2c2c] p-2 shadow-[4px_4px_0px_#2c2c2c] relative group">
                    <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative mb-2 border-2 border-[#2c2c2c]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Mentahan ${index + 1}`} className="w-full h-full object-cover grayscale-[15%]" />
                    </div>
                    <button 
                      onClick={() => handleDownload(url, `Shalvariq_Raw_${index + 1}.jpg`)}
                      className="w-full bg-[#f7f6f2] border-2 border-[#2c2c2c] py-2 text-[10px] font-black uppercase tracking-widest hover:bg-[#2c2c2c] hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Download size={12} /> Mentahan {index + 1}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="w-full max-w-sm mt-4 flex flex-col gap-4 shrink-0 mb-8 border-t-2 border-solid border-[#2c2c2c] pt-8">
            <div className="bg-white border-[3px] border-[#2c2c2c] p-4 text-center my-2 shadow-[6px_6px_0px_#2c2c2c] transform rotate-[-1deg]">
              <p className="text-xs font-bold text-gray-600 leading-relaxed uppercase tracking-wider">
                ✨ Jangan lupa tag foto gokil kamu di Instagram Stories ya!
              </p>
            </div>
            <a 
              href="https://instagram.com/shalvariq.photobooth"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-retro bg-white text-[#2c2c2c] py-3.5 text-center font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 border-[3px] border-[#2c2c2c] shadow-[4px_4px_0px_#2c2c2c] w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
              </svg>
              @shalvariq.photobooth
            </a>
          </div>
        </>
      )}
    </main>
  );
}

export default function MobileDownloadScreen() {
  return (
    <Suspense fallback={<div className="h-[100dvh] w-full bg-[#f7f6f2] flex items-center justify-center font-bold text-gray-500 uppercase tracking-widest"><Loader2 size={32} className="animate-spin text-[#c95d63]" /></div>}>
      <DownloadContent />
    </Suspense>
  );
}