// app/keychain-3d/page.tsx
'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Palette, Check, Clock, Loader2, Link as LinkIcon, Square, Circle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// ==========================================
// KOMPONEN MODEL 3D UPGRADE (MULTIPLE SHAPES)
// ==========================================
function KeychainModel({ 
  imageBase64, 
  strapColor, 
  shape, 
  attachment 
}: { 
  imageBase64: string, 
  strapColor: string, 
  shape: 'rectangle' | 'circle',
  attachment: 'strap' | 'chain'
}) {
  const texture = useLoader(THREE.TextureLoader, imageBase64);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <group position={[0, -0.5, 0]}>
      
      {/* LAYER AKRILIK & FOTO */}
      {shape === 'rectangle' ? (
        <group>
          <RoundedBox args={[2.2, 3.2, 0.25]} radius={0.1} smoothness={4} position={[0, 0, 0]}>
            <meshPhysicalMaterial transmission={1} opacity={1} metalness={0.1} roughness={0.05} ior={1.5} thickness={0.5} color="#ffffff" />
          </RoundedBox>
          <mesh position={[0, 0, 0.126]}>
            <planeGeometry args={[2, 3]} />
            <meshBasicMaterial map={texture} />
          </mesh>
          <mesh position={[0, 0, -0.126]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[2, 3]} />
            <meshBasicMaterial map={texture} />
          </mesh>
        </group>
      ) : (
        <group>
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.5, 1.5, 0.25, 64]} />
            <meshPhysicalMaterial transmission={1} opacity={1} metalness={0.1} roughness={0.05} ior={1.5} thickness={0.5} color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0.126]}>
            <circleGeometry args={[1.4, 64]} />
            <meshBasicMaterial map={texture} />
          </mesh>
          <mesh position={[0, 0, -0.126]} rotation={[0, Math.PI, 0]}>
            <circleGeometry args={[1.4, 64]} />
            <meshBasicMaterial map={texture} />
          </mesh>
        </group>
      )}

      {/* BASE HARDWARE */}
      <group position={[0, shape === 'rectangle' ? 1.65 : 1.55, 0]}>
        <mesh>
          <boxGeometry args={[0.6, 0.2, 0.3]} />
          <meshStandardMaterial color="#e5e7eb" metalness={1} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.4, 32]} />
          <meshStandardMaterial color="#e5e7eb" metalness={1} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.3, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.15, 0.03, 16, 32]} />
          <meshStandardMaterial color="#d1d5db" metalness={1} roughness={0.1} />
        </mesh>
      </group>

      {/* ATTACHMENT */}
      {attachment === 'strap' ? (
        <group position={[0, shape === 'rectangle' ? 2.3 : 2.2, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
             <torusGeometry args={[0.08, 0.02, 16, 32]} />
             <meshStandardMaterial color={strapColor} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.08, 0.08, 1, 32]} />
            <meshStandardMaterial color={strapColor} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <sphereGeometry args={[0.08, 32, 16]} />
            <meshStandardMaterial color={strapColor} roughness={0.7} />
          </mesh>
        </group>
      ) : (
        <group position={[0, shape === 'rectangle' ? 2.1 : 2.0, 0]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i} position={[0, i * 0.25, 0]} rotation={[0, i % 2 === 0 ? 0 : Math.PI / 2, 0]}>
              <torusGeometry args={[0.12, 0.03, 16, 32]} />
              <meshStandardMaterial color="#e5e7eb" metalness={1} roughness={0.1} />
            </mesh>
          ))}
          <mesh position={[0, 1.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
             <torusGeometry args={[0.4, 0.04, 32, 64]} />
             <meshStandardMaterial color="#e5e7eb" metalness={1} roughness={0.1} />
          </mesh>
        </group>
      )}
    </group>
  );
}

// ==========================================
// FUNGSI HELPER
// ==========================================
const base64ToBlob = (base64: string, mimeType: string) => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  return new Blob([new Uint8Array(byteNumbers)], { type: mimeType });
};

export default function KeychainConfigurator() {
  const router = useRouter();
  const { finalCollageBase64, rawSoftFiles, sessionId } = useStore();
  
  const [shape, setShape] = useState<'rectangle' | 'circle'>('rectangle');
  const [attachment, setAttachment] = useState<'strap' | 'chain'>('chain');
  const [strapColor, setStrapColor] = useState('#c95d63'); 
  
  const [timeLeft, setTimeLeft] = useState(180);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!finalCollageBase64) router.push('/select-to-print');
  }, [finalCollageBase64, router]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinalize();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleFinalize = async () => {
    setIsProcessing(true);
    try {
      const currentSession = sessionId || `SHALVARIQ-${Date.now()}`;
      
      // ==========================================
      // TEMBAK UTK PRINT FISIK KE LOCAL SERVER MAC
      // ==========================================
      try {
        console.log("Mengirim perintah cetak dari Keychain ke local server...");
        const printRes = await fetch('http://localhost:3001/print', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: finalCollageBase64 }) 
        });
        if (!printRes.ok) {
          console.warn("Local printer server nolak.");
        }
      } catch (localErr) {
        console.error("Gagal konek ke Local Print Server.", localErr);
      }
      // ==========================================

      const imageBlob = base64ToBlob(finalCollageBase64!, 'image/jpeg');
      await supabase.storage.from('photobooth-prints').upload(`${currentSession}/hasil_kolase.jpg`, imageBlob, { contentType: 'image/jpeg', upsert: true });

      const rawUploadPromises = rawSoftFiles.map(async (rawBase64, index) => {
        const rawBlob = base64ToBlob(rawBase64, 'image/jpeg');
        return supabase.storage.from('photobooth-prints').upload(`${currentSession}/mentahan_${index + 1}.jpg`, rawBlob, { contentType: 'image/jpeg', upsert: true });
      });
      await Promise.all(rawUploadPromises);

      const prodDomain = "https://shalvariq-photobooth.vercel.app"; 
      router.push(`/success?url=${encodeURIComponent(`${prodDomain}/download?session=${currentSession}`)}`);
    } catch (error) {
      alert("Gagal memproses pesanan.");
      setIsProcessing(false);
    }
  };

  const colors = [
    { name: 'Rose', hex: '#c95d63' },
    { name: 'Charcoal', hex: '#2c2c2c' },
    { name: 'Mint', hex: '#00C4CC' },
    { name: 'Mustard', hex: '#eab308' },
  ];

  if (!finalCollageBase64) return null;

  return (
    <main className="relative flex h-screen w-screen flex-row bg-[#f7f6f2] bg-grid-paper overflow-hidden select-none">
      
      {/* KIRI: AREA KANVAS 3D */}
      <div className="flex-1 relative cursor-move">
        <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
          <ambientLight intensity={1} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <Environment preset="city" />
          
          <Suspense fallback={null}>
            <KeychainModel imageBase64={finalCollageBase64} strapColor={strapColor} shape={shape} attachment={attachment} />
            <ContactShadows position={[0, -2, 0]} opacity={0.4} scale={10} blur={2} far={4} />
          </Suspense>
          
          <OrbitControls autoRotate autoRotateSpeed={1.5} enableZoom={true} minDistance={3} maxDistance={10} />
        </Canvas>

        <div className="absolute top-8 left-8 bg-white border-2 border-[#2c2c2c] px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-500 shadow-[4px_4px_0px_#2c2c2c]">
          Geser untuk memutar 3D
        </div>
      </div>

      {/* KANAN: PANEL KONTROL UI */}
      <div className="w-[450px] bg-white border-l-[4px] border-[#2c2c2c] p-8 flex flex-col justify-between shadow-[-10px_0px_20px_rgba(0,0,0,0.05)] z-10 overflow-y-auto">
        <div>
          <div className="flex justify-between items-start mb-8">
            <h1 className="font-serif text-3xl font-black italic text-[#2c2c2c] leading-tight">
              Kustom <br/><span className="text-[#c95d63]">Keychain.</span>
            </h1>
            <div className={`flex items-center gap-2 border-2 px-3 py-1 font-bold text-sm uppercase tracking-wider ${timeLeft <= 30 ? 'bg-red-100 text-red-600 border-red-600 animate-pulse' : 'bg-[#f7f6f2] border-[#2c2c2c] text-[#2c2c2c]'}`}>
              <Clock size={16} /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-3 text-gray-400">
                <Square size={16} /> Bentuk Akrilik
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShape('rectangle')}
                  className={`py-3 border-[3px] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${shape === 'rectangle' ? 'border-[#2c2c2c] bg-gray-50 shadow-[4px_4px_0px_#2c2c2c]' : 'border-gray-200 text-gray-400'}`}
                >
                  <Square size={16} /> Persegi
                </button>
                <button
                  onClick={() => setShape('circle')}
                  className={`py-3 border-[3px] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${shape === 'circle' ? 'border-[#2c2c2c] bg-gray-50 shadow-[4px_4px_0px_#2c2c2c]' : 'border-gray-200 text-gray-400'}`}
                >
                  <Circle size={16} /> Lingkaran
                </button>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-3 text-gray-400">
                <LinkIcon size={16} /> Tipe Gantungan
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAttachment('chain')}
                  className={`py-3 border-[3px] font-bold text-xs uppercase tracking-wider transition-all ${attachment === 'chain' ? 'border-[#2c2c2c] bg-gray-50 shadow-[4px_4px_0px_#2c2c2c]' : 'border-gray-200 text-gray-400'}`}
                >
                  Rantai Besi
                </button>
                <button
                  onClick={() => setAttachment('strap')}
                  className={`py-3 border-[3px] font-bold text-xs uppercase tracking-wider transition-all ${attachment === 'strap' ? 'border-[#2c2c2c] bg-gray-50 shadow-[4px_4px_0px_#2c2c2c]' : 'border-gray-200 text-gray-400'}`}
                >
                  Tali Karet
                </button>
              </div>
            </div>

            {attachment === 'strap' && (
              <div>
                <label className="flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-3 text-gray-400">
                  <Palette size={16} /> Pilih Warna Tali
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => setStrapColor(color.hex)}
                      className={`h-10 border-[3px] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${strapColor === color.hex ? 'border-[#2c2c2c] shadow-[4px_4px_0px_#2c2c2c] scale-105' : 'border-transparent bg-gray-100 text-gray-400'}`}
                    >
                      <div className="w-4 h-4 rounded-full border-2 border-[#2c2c2c]" style={{ backgroundColor: color.hex }} />
                      {color.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-8">
          <div className="bg-[#fff1f2] border-2 border-dashed border-[#c95d63] p-4 text-center">
            <p className="text-xs font-bold text-[#c95d63] uppercase tracking-wider">Total Penambahan</p>
            <p className="text-2xl font-black text-[#2c2c2c]">+ Rp15.000</p>
          </div>
          
          <button 
            onClick={handleFinalize}
            disabled={isProcessing}
            className="btn-retro py-4 w-full bg-[#2c2c2c] text-[#f7f6f2] font-black uppercase tracking-widest text-lg border-[3px] border-[#2c2c2c] flex items-center justify-center gap-2 hover:-translate-y-1 shadow-[6px_6px_0px_#c95d63]"
          >
            {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <><Check size={24} /> Selesai & Bayar</>}
          </button>
        </div>
      </div>
    </main>
  );
}