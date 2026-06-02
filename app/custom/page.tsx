// app/custom/page.tsx
'use client';

import { useState, useRef } from 'react';
import Script from 'next/script';
import QRCode from 'react-qr-code';
import { Upload, FileImage, User, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, Ticket, LayoutTemplate, X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ==========================================
// DATA MOCKUP: VARIASI BASE TEMPLATE
// ==========================================
const BASE_TEMPLATES = [
  { id: '1-solo', name: '1 Foto (Solo Canvas)', category: '1 Slot', icon: '🔲', desc: '1 kotak besar di tengah. Cocok untuk poster.' },
  { id: '3-vertical', name: '3 Foto (Classic Vertikal)', category: '3 Slot', icon: '🪜', desc: '3 kotak susun vertikal standar.' },
  { id: '3-oval', name: '3 Foto (Vintage Oval)', category: '3 Slot', icon: '🪞', desc: '3 lubang berbentuk oval estetik.' },
  { id: '4-grid', name: '4 Foto (Grid 2x2)', category: '4 Slot', icon: '🪟', desc: '4 kotak simetris atas bawah.' },
  { id: '6-twin', name: '6 Foto (Twin Strip)', category: '6 Slot', icon: '🎞️', desc: '2 lajur memanjang, masing-masing 3 foto.' },
];

export default function CustomFramePreOrder() {
  const [step, setStep] = useState<1 | 2>(1);
  const [finalOrderInfo, setFinalOrderInfo] = useState<{ id: string, url: string } | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  // State Baru: Untuk Modal & Pilihan Template
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof BASE_TEMPLATES[0] | null>(null);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.type !== 'image/png') {
      setError('Wajib pakai format file .PNG transparan ya!');
      setFile(null);
      setPreviewUrl('');
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB.');
      setFile(null);
      setPreviewUrl('');
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTemplate) {
      setError('Tolong pilih Base Template-nya dulu ya lewat tombol di atas.');
      return;
    }
    if (!name || !email || !file) {
      setError('Isi nama, email, dan pastikan sudah mengunggah file frame-mu.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('file', file);
      formData.append('template_id', selectedTemplate.id); // Simpan pilihan template ke DB

      const response = await fetch('/api/custom', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Kendala memproses pesanan.');
      }

      console.log('Mode Testing: Langsung Bypass ke Tiket QR');
      setFinalOrderInfo({ id: data.orderId, url: data.publicUrl });
      setStep(2);
      
    } catch (err: any) {
      setError(err.message || 'Masalah koneksi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} strategy="lazyOnload" />

      <main className="relative flex h-[100dvh] w-full flex-col items-center py-12 px-6 bg-[#f7f6f2] bg-grid-paper text-[#2c2c2c] overflow-y-auto overflow-x-hidden select-none">
        
        <div className="flex flex-col items-center text-center mb-10 shrink-0">
          <span className="font-serif text-3xl font-black italic text-[#c95d63] tracking-wider">
            Shalvariq.
          </span>
          <div className="text-[9px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-1">
            Custom Frame Portal
          </div>
        </div>

        {step === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-4xl flex flex-col md:flex-row gap-8 items-start shrink-0 mb-20">
            
            {/* BOX KIRI: PANDUAN & PEMILIHAN TEMPLATE */}
            <div className="w-full md:w-5/12 bg-white border-[3px] border-[#2c2c2c] p-6 shadow-[6px_6px_0px_#2c2c2c] relative shrink-0">
              <div className="scrapbook-tape top-[-15px] left-6 w-24 h-6 rotate-[-1deg]" />
              
              <h2 className="font-serif text-2xl font-black italic mb-4">Langkah 1: Pilih Layout</h2>
              
              {!selectedTemplate ? (
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-4 border-2 border-dashed border-[#c95d63] text-[#c95d63] bg-[#fff1f2] hover:bg-[#ffe4e6] font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-colors mb-4"
                >
                  <LayoutTemplate size={18} /> Pilih Base Template
                </button>
              ) : (
                <div className="border-2 border-[#2c2c2c] p-4 bg-[#fbfbfa] mb-4 relative">
                  <button onClick={() => setIsModalOpen(true)} className="absolute top-2 right-2 text-xs font-bold text-gray-400 hover:text-[#c95d63] underline">Ganti</button>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Layout Terpilih:</div>
                  <div className="font-bold text-lg text-[#2c2c2c] flex items-center gap-2">
                    <span className="text-2xl">{selectedTemplate.icon}</span> {selectedTemplate.name}
                  </div>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">{selectedTemplate.desc}</p>
                  
                  {/* TOMBOL PINTASAN UNDUH MOCKUP (Tinggal ganti link href-nya ntar) */}
                  <div className="mt-4 flex gap-2">
                    <a href="#" className="flex-1 text-center py-2 bg-[#00C4CC] border-2 border-[#2c2c2c] text-white text-[10px] font-bold uppercase hover:bg-[#00a8af] flex flex-col items-center gap-1 shadow-[2px_2px_0px_#2c2c2c]">
                      <Download size={14} /> Template Canva
                    </a>
                    <a href="#" className="flex-1 text-center py-2 bg-gray-200 border-2 border-[#2c2c2c] text-[#2c2c2c] text-[10px] font-bold uppercase hover:bg-gray-300 flex flex-col items-center gap-1 shadow-[2px_2px_0px_#2c2c2c]">
                      <Download size={14} /> PNG Kosong
                    </a>
                  </div>
                </div>
              )}

              <ul className="space-y-3 text-xs font-medium text-gray-600 leading-relaxed list-disc list-inside mt-6 border-t-2 border-dashed pt-4">
                <li>Desainlah mengikuti area lubang dari template yang Anda unduh di atas.</li>
                <li>Wajib menggunakan format <span className="font-bold text-[#c95d63]">.PNG transparan</span>.</li>
                <li>Setelah berhasil, Anda akan mendapat tiket <span className="font-bold text-[#2c2c2c]">QR Code</span> untuk di-scan di booth fisik.</li>
              </ul>
            </div>

            {/* BOX KANAN: FORM UPLOAD (Tetap sama) */}
            <form onSubmit={handleSubmit} className="w-full md:w-7/12 flex flex-col gap-6 shrink-0">
              <div className="bg-white border-[3px] border-[#2c2c2c] p-6 shadow-[6px_6px_0px_#2c2c2c] space-y-4 relative">
                <div className="scrapbook-tape top-[-15px] right-6 w-24 h-6 rotate-[2deg]" />
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User size={14} /> Nama Lengkap
                  </label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border-2 border-[#2c2c2c] p-3 text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_#2c2c2c] transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Mail size={14} /> Alamat Email
                  </label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border-2 border-[#2c2c2c] p-3 text-sm font-medium focus:outline-none focus:shadow-[4px_4px_0px_#2c2c2c] transition-all" />
                </div>
              </div>

              <div className="bg-white border-[3px] border-[#2c2c2c] p-6 shadow-[6px_6px_0px_#2c2c2c] flex flex-col items-center">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png" className="hidden" />
                {!previewUrl ? (
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 hover:border-[#c95d63] p-10 flex flex-col items-center justify-center gap-3 transition-colors bg-[#fbfbfa]">
                    <Upload size={32} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide text-center">Pilih file hasil desainmu (.PNG)</span>
                  </button>
                ) : (
                  <div className="w-full flex flex-col items-center gap-4 bg-[#f7f6f2] p-4 border-2 border-gray-200">
                    <div className="relative w-44 h-64 bg-zinc-200 border-2 border-[#2c2c2c] shadow-md overflow-hidden flex flex-col justify-around items-center p-2">
                      <div className="absolute inset-0 bg-transparent opacity-30 bg-[radial-gradient(#8c8c8c_1px,transparent_1px)] [background-size:8px_8px] z-0" />
                      <img src={previewUrl} alt="Preview Frame" className="absolute inset-0 w-full h-full object-fill z-20 pointer-events-none" />
                    </div>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-black text-[#c95d63] uppercase tracking-widest flex items-center gap-1 hover:underline">
                      <FileImage size={14} /> Ganti File
                    </button>
                  </div>
                )}
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[#fff1f2] border-[2px] border-[#e11d48] text-[#be123c] p-4 font-bold text-xs flex items-start gap-3 shadow-[4px_4px_0px_#e11d48]">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button type="submit" disabled={isLoading} className="btn-retro w-full py-4 text-base font-black uppercase tracking-widest flex items-center justify-center gap-2 bg-[#c95d63] text-white border-[3px] border-[#2c2c2c] shadow-[4px_4px_0px_#2c2c2c] disabled:opacity-70">
                {isLoading ? <><Loader2 size={20} className="animate-spin" /> Memproses...</> : <><Ticket size={20} /> Checkout (Rp35.000)</>}
              </button>
            </form>
          </motion.div>
        )}

        {step === 2 && finalOrderInfo && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md flex flex-col items-center gap-6">
            <div className="bg-white border-[3px] border-[#2c2c2c] p-8 shadow-[8px_8px_0px_#2c2c2c] w-full flex flex-col items-center relative text-center">
              <div className="scrapbook-tape top-[-15px] w-32 h-6 rotate-[1deg]" />
              <div className="bg-green-100 text-green-700 p-2 rounded-full mb-4"><CheckCircle2 size={32} /></div>
              <h2 className="font-serif text-2xl font-black italic mb-2">Pre-Order Sukses!</h2>
              
              <div className="p-4 border-2 border-dashed border-[#c95d63] bg-[#fbfbfa] mb-4">
                <QRCode value={finalOrderInfo.id} size={180} fgColor="#2c2c2c" bgColor="transparent" />
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 py-1.5 px-4 rounded-full mb-4">
                ID: {finalOrderInfo.id}
              </div>

              <div className="bg-[#fff1f2] border-2 border-[#c95d63] p-3 text-xs text-[#2c2c2c] font-bold">
                ⚠️ PENTING: Harap Screenshot / Simpan halaman ini sekarang! Kami tidak mengirimkan QR Code ini ke email.
              </div>
            </div>
            <button onClick={() => window.location.reload()} className="text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-[#c95d63] underline underline-offset-4">Kembali ke Beranda</button>
          </motion.div>
        )}

      </main>

      {/* ========================================== */}
      {/* MODAL POP-UP PILIH TEMPLATE                */}
      {/* ========================================== */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-[#f7f6f2] border-[4px] border-[#2c2c2c] w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-[12px_12px_0px_#2c2c2c]"
            >
              <div className="flex items-center justify-between p-5 bg-white border-b-[3px] border-[#2c2c2c]">
                <h3 className="font-serif text-xl font-black italic text-[#2c2c2c]">Pilih Layout Frame</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                  <X size={24} strokeWidth={3} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto bg-grid-paper flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {BASE_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      onClick={() => {
                        setSelectedTemplate(tmpl);
                        setIsModalOpen(false);
                      }}
                      className="bg-white border-[3px] border-[#2c2c2c] p-4 text-left hover:-translate-y-1 hover:shadow-[6px_6px_0px_#2c2c2c] transition-all cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-4xl group-hover:scale-110 transition-transform">{tmpl.icon}</div>
                        <div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-[#c95d63] mb-1">{tmpl.category}</div>
                          <div className="font-bold text-[#2c2c2c] text-sm mb-1">{tmpl.name}</div>
                          <div className="text-xs text-gray-500 leading-snug">{tmpl.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}