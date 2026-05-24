// app/custom/page.tsx
'use client';

import { useState, useRef } from 'react';
import { Upload, FileImage, User, Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomFramePreOrder() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== 'image/png') {
      setError('Format file kurang pas nih. Yuk pastikan pakai file .PNG yang transparan ya!');
      setFile(null);
      setPreviewUrl('');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Waduh, ukuran filenya kegedean! Maksimal 5MB aja ya biar cepat diproses.');
      setFile(null);
      setPreviewUrl('');
      return;
    }

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !file) {
      setError('Ups! Jangan lupa isi nama, email, dan masukin file desain frame kamu ya.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('file', file);

      // Pastikan nembaknya ke rute yang benar
      const response = await fetch('/api/custom', {
        method: 'POST',
        body: formData,
      });

      // PENCEGAHAN ERROR MENTAH
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Terjadi kendala saat memproses pesananmu.');
        }

        console.log('Sukses Supabase:', data);
        alert(`Yeay Berhasil! File kamu aman dengan ID: ${data.orderId}. Lanjut ke pembayaran yuk!`);
        
      } else {
        throw new Error('Sistem sedang padat atau rute API belum ditemukan. Coba lagi ya!');
      }
      
    } catch (err: any) {
      console.error('System error:', err);
      setError(err.message || 'Maaf, sepertinya ada masalah koneksi. Pastikan internetmu stabil! 🛠️');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // RAMUAN SCROLL MOBILE: h-[100dvh], overflow-y-auto, touch-pan-y
    <main className="relative flex h-[100dvh] w-full flex-col items-center py-12 px-6 bg-[#f7f6f2] bg-grid-paper text-[#2c2c2c] overflow-y-auto overflow-x-hidden select-none touch-pan-y">
      
      <div className="flex flex-col items-center text-center mb-10 shrink-0">
        <span className="font-serif text-3xl font-black italic text-[#c95d63] tracking-wider">
          Shalvariq.
        </span>
        <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-1">
          Custom Frame Portal (Pre-Order)
        </div>
      </div>

      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-8 items-start shrink-0 mb-20">
        
        <div className="w-full md:w-5/12 bg-white border-[3px] border-[#2c2c2c] p-6 shadow-[6px_6px_0px_#2c2c2c] relative shrink-0">
          <div className="scrapbook-tape top-[-15px] left-6 w-24 h-6 rotate-[-1deg]" />
          <h2 className="font-serif text-2xl font-black italic mb-4">Panduan Desain 🎨</h2>
          <ul className="space-y-3 text-xs font-medium text-gray-600 leading-relaxed list-disc list-inside">
            <li>Wajib menggunakan format <span className="font-bold text-[#c95d63]">.PNG transparan</span> (bagian tengah frame harus bolong).</li>
            <li>Rekomendasi resolusi: <span className="font-bold text-[#2c2c2c]">1200 x 1800 px</span> (Rasio 4:6 vertikal).</li>
            <li>Pastikan desain Anda tidak menutupi area lensa utama.</li>
            <li>Setelah melakukan pembayaran, Anda akan mendapatkan tiket <span className="font-bold text-[#2c2c2c]">QR Code</span>.</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="w-full md:w-7/12 flex flex-col gap-6 shrink-0">
          
          <div className="bg-white border-[3px] border-[#2c2c2c] p-6 shadow-[6px_6px_0px_#2c2c2c] space-y-4 relative">
            <div className="scrapbook-tape top-[-15px] right-6 w-24 h-6 rotate-[2deg]" />
            
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <User size={14} /> Nama Lengkap
              </label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama kamu..."
                className="w-full border-2 border-[#2c2c2c] p-3 text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_#2c2c2c] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Mail size={14} /> Alamat Email
              </label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="emailkamu@gmail.com"
                className="w-full border-2 border-[#2c2c2c] p-3 text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_#2c2c2c] transition-all"
              />
            </div>
          </div>

          <div className="bg-white border-[3px] border-[#2c2c2c] p-6 shadow-[6px_6px_0px_#2c2c2c] flex flex-col items-center">
            <label className="w-full text-xs font-black uppercase tracking-wider mb-3 block text-left">
              Upload Berkas Frame (.PNG)
            </label>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png"
              className="hidden"
            />

            {!previewUrl ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 hover:border-[#c95d63] p-10 flex flex-col items-center justify-center gap-3 transition-colors bg-[#fbfbfa]"
              >
                <Upload size={32} className="text-gray-400" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wide text-center">
                  Klik untuk pilih berkas frame PNG transparan
                </span>
              </button>
            ) : (
              <div className="w-full flex flex-col items-center gap-4 bg-[#f7f6f2] p-4 border-2 border-gray-200">
                <div className="relative w-44 h-64 bg-zinc-200 border-2 border-[#2c2c2c] shadow-md overflow-hidden flex flex-col justify-around items-center p-2">
                  <div className="absolute inset-0 bg-transparent opacity-30 bg-[radial-gradient(#8c8c8c_1px,transparent_1px)] [background-size:8px_8px] z-0" />
                  <div className="w-36 h-12 bg-zinc-400/50 rounded z-10 flex items-center justify-center text-[8px] font-bold text-zinc-500 uppercase">Foto 1</div>
                  <div className="w-36 h-12 bg-zinc-400/50 rounded z-10 flex items-center justify-center text-[8px] font-bold text-zinc-500 uppercase">Foto 2</div>
                  <div className="w-36 h-12 bg-zinc-400/50 rounded z-10 flex items-center justify-center text-[8px] font-bold text-zinc-500 uppercase">Foto 3</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Preview Frame" className="absolute inset-0 w-full h-full object-fill z-20 pointer-events-none" />
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-black text-[#c95d63] uppercase tracking-widest flex items-center gap-1 hover:underline"
                >
                  <FileImage size={14} /> Ganti File Frame
                </button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#fff1f2] border-[2px] border-[#e11d48] text-[#be123c] p-4 font-bold text-xs flex items-start gap-3 shadow-[4px_4px_0px_#e11d48]"
              >
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-retro w-full py-4 text-base font-black uppercase tracking-widest flex items-center justify-center gap-2 bg-[#c95d63] text-white border-[3px] border-[#2c2c2c] shadow-[4px_4px_0px_#2c2c2c] disabled:opacity-70"
          >
            {isLoading ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Sedang Mengunggah...
              </>
            ) : (
              <>
                Lanjut ke Pembayaran <ArrowRight size={20} strokeWidth={2.5} />
              </>
            )}
          </button>

        </form>

      </div>

    </main>
  );
}