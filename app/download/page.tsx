// app/download/page.tsx
'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download , Heart } from 'lucide-react';
import { motion } from 'framer-motion';

function DownloadContent() {
  const searchParams = useSearchParams();
  const fileName = searchParams.get('file') || '';

  const supabaseStorageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/photobooth-prints/${fileName}`;

  const handleDownload = async () => {
    try {
      const response = await fetch(supabaseStorageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Shalvariq_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(supabaseStorageUrl, '_blank');
    }
  };

  return (
    <main className="min-h-screen w-full bg-[#f7f6f2] bg-grid-paper text-[#2c2c2c] flex flex-col items-center px-6 py-12 select-none">
      
      <div className="flex flex-col items-center text-center mb-8">
        <span className="font-serif text-3xl font-black italic text-[#c95d63] tracking-wider">
          Shalvariq.
        </span>
        <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-1">
          Analog Memory Captured
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-[3px] border-[#2c2c2c] p-4 pb-14 shadow-[10px_10px_0px_rgba(44,44,44,0.1)] w-full max-w-sm transform rotate-1 relative"
      >
        <div className="scrapbook-tape top-[-15px] left-1/2 transform -translate-x-1/2 w-28 h-8 rotate-[-2deg]" />
        
        <div className="w-full bg-gray-100 border border-gray-200 overflow-hidden">
          {fileName ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={supabaseStorageUrl} alt="Hasil Foto Shalvariq" className="w-full h-auto object-contain" />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 font-bold">File tidak ditemukan</div>
          )}
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 font-serif italic text-xs text-gray-400 flex items-center gap-1">
          Thank you for coming <Heart size={10} className="text-[#c95d63] fill-[#c95d63]" />
        </div>
      </motion.div>

      <div className="w-full max-w-sm mt-10 flex flex-col gap-4">
        <button 
          onClick={handleDownload}
          className="btn-retro bg-[#c95d63] text-white py-4 text-center font-bold uppercase tracking-widest text-base flex items-center justify-center gap-2 border-[3px] border-[#2c2c2c] shadow-[4px_4px_0px_#2c2c2c] w-full"
        >
          <Download size={20} strokeWidth={2.5} />
          Unduh Foto Digital
        </button>

        <div className="bg-white border-2 border-dashed border-gray-300 p-4 rounded-xl text-center my-2">
          <p className="text-xs font-medium text-gray-600 leading-relaxed">
            ✨ Seru-seruan bareng kami? Jangan lupa tag foto gokil kamu di Instagram Stories dan kasih tau temen-temen kamu ya!
          </p>
        </div>

<a 
          href="https://instagram.com/shalvariq.photobooth"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-retro bg-white text-[#2c2c2c] py-3.5 text-center font-bold uppercase tracking-wider text-sm flex items-center justify-center gap-2 border-[2px] border-[#2c2c2c] shadow-[3px_3px_0px_#2c2c2c] w-full"
        >
          {/* INI KODE PENGGANTI ICON INSTAGRAM */}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
          </svg>
          @shalvariq.photobooth
        </a>
      </div>

    </main>
  );
}

// BUNGKUS KOMPONEN UTAMA PAKE SUSPENSE BIAR VERCEL GAK NGAMUK
export default function MobileDownloadScreen() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-gray-500 uppercase tracking-widest">Memuat Halaman...</div>}>
      <DownloadContent />
    </Suspense>
  );
}