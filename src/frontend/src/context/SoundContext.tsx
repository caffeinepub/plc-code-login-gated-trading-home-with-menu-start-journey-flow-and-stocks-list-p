import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import {
  type SoundName,
  isSoundMuted,
  playSound as playSoundEngine,
  startSpin as startSpinEngine,
  stopSpin as stopSpinEngine,
  toggleSoundMute,
} from "../hooks/useSounds";

interface SoundContextValue {
  playSound: (name: SoundName) => void;
  startSpin: () => void;
  stopSpin: () => void;
  isMuted: boolean;
  toggleMute: () => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(() => isSoundMuted());

  const playSound = useCallback((name: SoundName) => {
    playSoundEngine(name);
  }, []);

  const startSpin = useCallback(() => {
    startSpinEngine();
  }, []);

  const stopSpin = useCallback(() => {
    stopSpinEngine();
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = toggleSoundMute();
    setIsMuted(newMuted);
  }, []);

  return (
    <SoundContext.Provider
      value={{ playSound, startSpin, stopSpin, isMuted, toggleMute }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSound(): SoundContextValue {
  const ctx = useContext(SoundContext);
  if (!ctx) {
    throw new Error("useSound must be used within a SoundProvider");
  }
  return ctx;
}

export { SoundContext };
