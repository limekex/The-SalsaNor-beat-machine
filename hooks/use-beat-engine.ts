import { useEffect, useState } from 'react';
import { AudioBackend } from '../engine/audio-backend';
import { BeatEngine } from '../engine/beat-engine';

export function useBeatEngine() {
  const [engine, setEngine] = useState<BeatEngine | null>(null);

  useEffect(() => {
    const initEngine = async () => {
      const mixer = new AudioBackend();
      const newEngine = new BeatEngine(mixer);
      await newEngine.init();
      setEngine(newEngine);
    };

    initEngine();

    return () => {
      if (engine) {
        engine.stop();
      }
    };
  }, []);

  return engine;
}
