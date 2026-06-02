// store/useStore.ts
import { create } from 'zustand';

export interface FrameLayout {
  id: string;
  name: string;
  thumbnail: string;
  overlayImage: string;
  totalShots: number;
  type: 'strip' | 'grid' | 'polaroid';
  width: number;
  height: number;
  slots: { x: number; y: number; width: number; height: number; }[];
}

interface BoothState {
  step: 'attract' | 'frame_selection' | 'package_selection' | 'payment' | 'capture_session' | 'selection_print';
  selectedFrame: FrameLayout | null;
  
  // Nampung foto yang masuk ke layout & semua foto mentah
  capturedPhotos: string[];
  rawSoftFiles: string[]; 
  
  // State Sesi
  sessionId: string | null;
  sessionDuration: number;
  isPaid: boolean;
  timeLeft: number; 
  isTimerActive: boolean;
  
  // Actions
  setStep: (step: BoothState['step']) => void;
  setFrame: (frame: FrameLayout) => void;
  addCapturedPhoto: (photo: string) => void;
  setPaymentStatus: (status: boolean) => void;
  startSession: (duration: number) => void;
  tickTimer: () => void;
  stopTimer: () => void;
  clearSession: () => void;
}

export const useStore = create<BoothState>((set) => ({
  step: 'attract',
  selectedFrame: null,
  capturedPhotos: [],
  rawSoftFiles: [], // Nampung jepretan mentah tanpa henti
  sessionId: null,
  sessionDuration: 0,
  isPaid: false,
  timeLeft: 0,
  isTimerActive: false,
  
  setStep: (step) => set({ step }),
  setFrame: (frame) => set({ selectedFrame: frame }),
  
  // addCapturedPhoto sekarang nyimpen ke dua tempat
  addCapturedPhoto: (photo) => set((state) => ({ 
    capturedPhotos: [...state.capturedPhotos, photo],
    rawSoftFiles: [...state.rawSoftFiles, photo]
  })),
  
  setPaymentStatus: (status) => set({ isPaid: status }),
  
  startSession: (duration) => set({ 
    sessionId: `SHALVARIQ-${Date.now()}`, // Generate ID unik pas sesi mulai
    sessionDuration: duration,
    timeLeft: duration,
    isTimerActive: true,
    isPaid: true, 
    step: 'capture_session' 
  }),
  
  tickTimer: () => set((state) => {
    if (state.timeLeft <= 1) {
      return { timeLeft: 0, isTimerActive: false, step: 'selection_print' };
    }
    return { timeLeft: state.timeLeft - 1 };
  }),
  
  stopTimer: () => set({ isTimerActive: false }),
  
  clearSession: () => set({ 
    step: 'attract', 
    selectedFrame: null, 
    capturedPhotos: [],
    rawSoftFiles: [],
    sessionId: null,
    sessionDuration: 0,
    isPaid: false,
    timeLeft: 0,
    isTimerActive: false
  }),
}));