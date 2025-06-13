import { makeAutoObservable, observe } from 'mobx';
import { AudioBackend } from './audio-backend';
import { InstrumentPlayer } from './instrument-player';
import { createMachine } from './machine';
import { IInstrument, IMachine } from './machine-interfaces';

export interface IInstrumentSample {
  sampleName: string;
  velocity?: number;
}

export class BeatEngine {
  private nextSampleIndex = 0;
  private animationFrameRequest: number | null = null;
  private audioTimeDelta = 0;
  private machineDisposers: (() => void)[] = [];
  private readonly instrumentPlayers = new Map<IInstrument, InstrumentPlayer>();

  interval: number | null = null;
  _machine: IMachine = createMachine();
  beat = 0;

  constructor(private mixer: AudioBackend) {
    makeAutoObservable(this);
    this.mixer.init();
    console.log('Initial AudioBackend state:', {
      ready: this.mixer.ready,
      buffer: this.mixer.buffer,
      bankDescriptor: this.mixer.bankDescriptor,
      zeroTime: this.mixer.zeroTime,
      context: this.mixer._context,
    });

    // Prøv å kalle init på nytt:
    this.mixer.init();

    // Logg status igjen
    setTimeout(() => {
      console.log('Post-init AudioBackend state:', {
        ready: this.mixer.ready,
        buffer: this.mixer.buffer,
        bankDescriptor: this.mixer.bankDescriptor,
        zeroTime: this.mixer.zeroTime,
        context: this.mixer._context,
      });
    }, 2000);
  }

  get machine() {
    return this._machine;
  }

  set machine(value: IMachine) {
    if (value !== this._machine) {
      this._machine = value;
      this.machineDisposers.forEach((disposer) => disposer());
      this.machineDisposers = [];
      this.instrumentPlayers.forEach((player) => player.dispose());
      this.instrumentPlayers.clear();

      if (!this.machine) return;
      if (this.playing) {
        this.stop();
        this.play();
      }

      this.machineDisposers.push(
        observe(this.machine, 'bpm', ({ oldValue, newValue }) => {
          if (this.playing) {
            if (this.interval) clearTimeout(this.interval);

            const currentAudioTime = this.mixer.getCurrentTime();

            // 🚨 Sjekk for ugyldige verdier:
            if (oldValue == null || newValue == null || oldValue === 0 || newValue === 0) {
              console.warn('⚠️ Ugyldige verdier for BPM endring: oldValue =', oldValue, ', newValue =', newValue);
              return;
            }

            // 🚀 Ny kalkulering med sikker fallback:
            this.audioTimeDelta =
              (currentAudioTime + (this.audioTimeDelta || 0)) * (oldValue / newValue) - currentAudioTime;

            // Hvis audioTimeDelta fortsatt er NaN, setter vi den til 0
            if (isNaN(this.audioTimeDelta)) {
              console.warn('⚠️ audioTimeDelta ble NaN — setter den til 0.');
              this.audioTimeDelta = 0;
            }

            this.nextSampleIndex = Math.ceil(this.getBeatIndex() * 2);
            this.stopAllInstruments();
            this.scheduleBuffers();
          }
        }),
      );
    }
  }

  play() {
    this.mixer.context?.resume();
    this.scheduleBuffers();
    this.beatTick();
  }

  stopAllInstruments = (hard = false) => {
    for (const instrument of Array.from(this.instrumentPlayers.values())) {
      instrument.reset(hard);
    }
  };

  stop() {
    if (this.interval) {
      clearTimeout(this.interval);
      this.interval = null;
    }
    if (this.animationFrameRequest) {
      cancelAnimationFrame(this.animationFrameRequest);
      this.animationFrameRequest = null;
    }
    this.stopAllInstruments(true);
    this.mixer.reset();
    this.audioTimeDelta = 0;
    this.nextSampleIndex = 0;
  }

  get playing() {
    return this.interval != null;
  }

  get beatTime() {
    const result = 60 / this.machine.bpm;
    return this.machine.flavor === 'Merengue' ? result / 2 : result;
  }

  getBeatIndex() {
    return (this.mixer.getCurrentTime() + this.audioTimeDelta) / this.beatTime;
  }

  scheduleBuffers = () => {
    console.log('scheduleBuffers called');
    this.interval = window.setTimeout(() => this.scheduleBuffers(), 1000);
  };

  beatTick() {
    this.beat = this.getBeatIndex();
    this.animationFrameRequest = requestAnimationFrame(() => this.beatTick());
  }
}
