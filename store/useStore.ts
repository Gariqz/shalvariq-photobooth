import { create } from 'zustand';

// Update Interface FrameLayout buat kebutuhan Canvas API
export interface FrameLayout {
  id: string;
  name: string;
  thumbnail: string;
  overlayImage: string;
  totalShots: number;
  type: 'strip' | 'grid' | 'polaroid';
  width: number;        // Resolusi akhir (Misal 1200 untuk kertas 4x6)
  height: number;       // Resolusi akhir (Misal 1800 untuk kertas 4x6)
  slots: {              // Koordinat buat nempelin foto
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}
interface BoothState {
  step: 'attract' | 'package_selection' | 'payment' | 'capture_session' | 'selection_print';
  selectedFrame: FrameLayout | null;
  capturedPhotos: string[];
  
  // State Pembayaran & Sesi
  sessionDuration: number;
  isPaid: boolean;
  
  // State Timer Global
  timeLeft: number; 
  isTimerActive: boolean;
  
  // Actions Utama
  setStep: (step: BoothState['step']) => void;
  setFrame: (frame: FrameLayout) => void;
  addCapturedPhoto: (photo: string) => void;
  setPaymentStatus: (status: boolean) => void;
  
  // Actions Sesi & Timer
  startSession: (duration: number) => void;
  tickTimer: () => void;
  stopTimer: () => void;
  clearSession: () => void;
}

export const useStore = create<BoothState>((set) => ({
  // Initial States
  step: 'attract',
  selectedFrame: null,
  capturedPhotos: [],
  sessionDuration: 0,
  isPaid: false,
  timeLeft: 0,
  isTimerActive: false,
  
  // Basic Actions
  setStep: (step) => set({ step }),
  setFrame: (frame) => set({ selectedFrame: frame }),
  addCapturedPhoto: (photo) => set((state) => ({ 
    capturedPhotos: [...state.capturedPhotos, photo] 
  })),
  setPaymentStatus: (status) => set({ isPaid: status }),
  
  // Mulai sesi sekaligus trigger timer
  startSession: (duration) => set({ 
    sessionDuration: duration,
    timeLeft: duration,
    isTimerActive: true,
    isPaid: true, 
    step: 'capture_session' 
  }),
  
  // Hitung mundur timer (Dipanggil oleh interval di komponen FloatingTimer)
  tickTimer: () => set((state) => {
    // Kalau waktu habis, matikan timer dan paksa pindah ke halaman pilih foto cetak
    if (state.timeLeft <= 1) {
      return { timeLeft: 0, isTimerActive: false, step: 'selection_print' };
    }
    return { timeLeft: state.timeLeft - 1 };
  }),
  
  // Jaga-jaga kalau butuh pause/stop manual
  stopTimer: () => set({ isTimerActive: false }),
  
  // Reset seluruh state ke awal (Misal saat sesi benar-benar selesai)
  clearSession: () => set({ 
    step: 'attract', 
    selectedFrame: null, 
    capturedPhotos: [],
    sessionDuration: 0,
    isPaid: false,
    timeLeft: 0,
    isTimerActive: false
  }),
}));