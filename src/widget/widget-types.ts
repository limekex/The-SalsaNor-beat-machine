export interface WidgetConfig {
  instruments: string[];
  programs?: Record<string, number>; // instrumentId -> programIndex
  bpm?: number;
  machine?: 'salsa' | 'merengue';
  autoplay?: boolean;
  instructorLanguage?: 'italian' | 'spanish' | 'french' | 'russian' | 'german';
}

export interface WidgetInstance {
  play: () => void;
  pause: () => void;
  stop: () => void;
  setBPM: (bpm: number) => void;
  destroy: () => void;
}
