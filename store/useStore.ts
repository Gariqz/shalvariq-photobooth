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
  step: 'attract' | 'frame_selection' | 'package_selection' | 'payment' | 'capture_session' | 'selection_print' | 'merch_selection';
  selectedFrame: FrameLayout | null;
  
  capturedPhotos: string[];
  rawSoftFiles: string[]; 
  
  sessionId: string | null;
  sessionDuration: number;
  isPaid: boolean;
  timeLeft: number; 
  isTimerActive: boolean;

  // STATE BARU: Buat nampung hasil gambar jadi yang siap dicetak/dijadikan tekstur 3D
  finalCollageBase64: string | null;
  
  setStep: (step: BoothState['step']) => void;
  setFrame: (frame: FrameLayout) => void;
  addCapturedPhoto: (photo: string) => void;
  setPaymentStatus: (status: boolean) => void;
  startSession: (duration: number) => void;
  tickTimer: () => void;
  stopTimer: () => void;
  clearSession: () => void;

  // ACTION BARU
  setFinalCollageBase64: (base64: string | null) => void;
}

export const useStore = create<BoothState>((set) => ({
  step: 'attract',
  selectedFrame: null,
  capturedPhotos: [],
  rawSoftFiles: [], 
  sessionId: null,
  sessionDuration: 0,
  isPaid: false,
  timeLeft: 0,
  isTimerActive: false,
  
  finalCollageBase64: null,
  
  setStep: (step) => set({ step }),
  setFrame: (frame) => set({ selectedFrame: frame }),
  
  addCapturedPhoto: (photo) => set((state) => ({ 
    capturedPhotos: [...state.capturedPhotos, photo],
    rawSoftFiles: [...state.rawSoftFiles, photo]
  })),
  
  setPaymentStatus: (status) => set({ isPaid: status }),
  
  startSession: (duration) => set({ 
    sessionId: `SHALVARIQ-${Date.now()}`,
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

  setFinalCollageBase64: (base64) => set({ finalCollageBase64: base64 }),
  
  clearSession: () => set({ 
    step: 'attract', 
    selectedFrame: null, 
    capturedPhotos: [],
    rawSoftFiles: [],
    sessionId: null,
    sessionDuration: 0,
    isPaid: false,
    timeLeft: 0,
    isTimerActive: false,
    finalCollageBase64: null
  }),
}));