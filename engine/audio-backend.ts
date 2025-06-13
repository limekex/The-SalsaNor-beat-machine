import { InstrumentPlayer } from './instrument-player';

interface BankDescriptor {
  [sampleName: string]: number[];
}

export class AudioBackend {
  public ready: boolean;
  private buffer?: AudioBuffer;
  private bankDescriptor?: BankDescriptor;
  private zeroTime: number | null = null;
  private _context?: AudioContext;

  constructor() {
    this.ready = false;
    const hasWebM = typeof MediaSource !== 'undefined' && MediaSource.isTypeSupported('audio/webm;codecs="vorbis"');
    this.loadBank(hasWebM ? 'assets/audio/main.webm' : 'assets/audio/main.mp3');
    this.loadBankDescriptor('assets/audio/main.json');
  }

  /**
   * Initialiserer AudioContext og setter zeroTime umiddelbart.
   */
  init(context = typeof AudioContext !== 'undefined' ? new AudioContext() : undefined) {
    this._context = context;
    if (this._context) {
      this.zeroTime = this._context.currentTime;
      console.log('🎵 AudioBackend initialized — zeroTime set to:', this.zeroTime);
    }
  }

  get context() {
    return this._context;
  }

  private async loadBank(url: string) {
    const req = await fetch(url);
    const response = await req.arrayBuffer();
    this.buffer = await new Promise((resolve, reject) => {
      this.context?.decodeAudioData(response, resolve, reject);
    });
    this.ready = true;
  }

  private async loadBankDescriptor(url: string) {
    const req = await fetch(url);
    this.bankDescriptor = await req.json();
  }

  play(sampleName: string, player: InstrumentPlayer, when: number, velocity?: number) {
    const bufferSource = this.context!.createBufferSource();
    bufferSource.connect(player.createNoteDestination(velocity));
    bufferSource.buffer = this.buffer!;
    const sampleInfo = this.bankDescriptor![sampleName];

    // Setter zeroTime hvis det fortsatt er null (som en fallback)
    if (this.zeroTime === null) {
      this.zeroTime = this.context!.currentTime;
      console.log('⚠️ Warning: zeroTime was null — setting it now to:', this.zeroTime);
    }

    const startTime = this.zeroTime + when;
    bufferSource.start(startTime, sampleInfo[1] / 44100.0, sampleInfo[2] / 44100.0);
    player.registerSample(bufferSource, startTime);
  }

  reset() {
    this.zeroTime = null;
  }

  getCurrentTime(): number {
    if (this.zeroTime == null) {
      console.warn('⏱️ Warning: zeroTime is null, returning 0 for current time.');
      return 0;
    }
    return this.context!.currentTime - this.zeroTime;
  }
}
