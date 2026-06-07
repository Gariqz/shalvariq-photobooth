// lib/frameData.ts
import { FrameLayout } from '@/store/useStore';

export const availableFrames: FrameLayout[] = [
  {
    id: 'classic_strip_dark',
    name: 'Twin Strip (6 Foto)',
    thumbnail: '/frames/thumb-classic-dark.png',
    overlayImage: '/frames/overlay-classic-dark.png', // Pastiin gambar PNG ini ada 2 strip berdampingan
    totalShots: 6, // UBAH JADI 6 FOTO
    type: 'strip',
    width: 1200,
    height: 1800,
    slots: [
      // STRIP KIRI (Batas X: 0 sampai 600)
      { x: 50, y: 150, width: 500, height: 400 },   // Kiri - Atas
      { x: 50, y: 650, width: 500, height: 400 },   // Kiri - Tengah
      { x: 50, y: 1150, width: 500, height: 400 },  // Kiri - Bawah
      
      // STRIP KANAN (Batas X: 600 sampai 1200)
      { x: 650, y: 150, width: 500, height: 400 },  // Kanan - Atas
      { x: 650, y: 650, width: 500, height: 400 },  // Kanan - Tengah
      { x: 650, y: 1150, width: 500, height: 400 }, // Kanan - Bawah
    ]
  },
  {
    id: 'sweet_couple_grid',
    name: 'Sweet Pink 3-Slot',
    thumbnail: '/frames/overlay-sweet.png', // Pake gambar yang sama buat thumbnail
    overlayImage: '/frames/overlay-sweet.png',
    totalShots: 3, // UBAH JADI 3, karena bolongannya cuma 3
    type: 'strip',
    width: 1200,
    height: 1800,
    slots: [
      // Ini estimasi koordinat buat 3 kotak di gambar lu
      // Nanti lu bisa ganti angkanya dikit-dikit (x, y, width, height) biar pas banget sama bolongannya
      { x: 250, y: 216, width: 700, height: 350 },  // Kotak Atas
      { x: 250, y: 725, width: 700, height: 350 },  // Kotak Tengah
      { x: 250, y: 1234, width: 700, height: 350 }, // Kotak Bawah
    ]
  },
  {
    id: 'keychain_mini_4',
    name: 'Mini Grid (Bisa Potong)',
    thumbnail: '/frames/thumb-mini.png',
    overlayImage: '/frames/overlay-mini.png',
    totalShots: 4,
    type: 'grid',
    width: 1200,
    height: 1800,
    slots: [
      // Format mirip grid, tapi padding (jarak antar foto) dibikin lebih renggang
      // Biar pas dipotong fisik manual nanti nggak gampang meleset
      { x: 150, y: 200, width: 400, height: 500 }, 
      { x: 650, y: 200, width: 400, height: 500 }, 
      { x: 150, y: 900, width: 400, height: 500 }, 
      { x: 650, y: 900, width: 400, height: 500 }, 
    ]
  },
    {
    id: 'memory_lane',
    name: 'Memory Lane (3 Slot)',
    thumbnail: '/frames/memory-lane1.png',
    overlayImage: '/frames/memory-lane1.png',
    totalShots: 6,
    type: 'grid',
    width: 1200,
    height: 1800,
    slots: [
      // Format mirip grid, tapi padding (jarak antar foto) dibikin lebih renggang
      // Biar pas dipotong fisik manual nanti nggak gampang meleset
      { x: 25, y: 265, width: 550, height: 385 }, 
      { x: 25, y: 710, width: 550, height: 385 }, 
      { x: 25, y: 1150, width: 550, height: 385 },
      { x: 625, y: 265, width: 550, height: 385 },
      { x: 625, y: 710, width: 550, height: 385 },
      { x: 625, y: 1150, width: 550, height: 385 }
    ]
  }
];