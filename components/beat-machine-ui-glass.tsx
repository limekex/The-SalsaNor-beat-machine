import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { observable } from 'mobx';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';

import { IMachine } from '../engine/machine-interfaces';
import { useBeatEngine } from '../hooks/use-beat-engine';
import { useWindowListener } from '../hooks/use-window-listener';
import { GlassContainer, GlassButton, GlassSlider } from './ui';
import { BeatIndicator } from './beat-indicator';
import { InstrumentTile } from './instrument-tile';
import styles from './beat-machine-ui-glass.module.scss';
import { IDefaultMachines } from './beat-machine-ui';

export interface IBeatMachineUIGlassProps {
  machines: IDefaultMachines;
}

export const BeatMachineUIGlass = observer(({ machines }: IBeatMachineUIGlassProps) => {
  const { salsa, merengue } = machines;
  const engine = useBeatEngine();
  const [machine, setMachine] = useState(observable(salsa));

  useEffect(() => {
    if (engine && machine) {
      engine.machine = machine;
    }
  }, [engine, machine]);

  const beatCount = machine.flavor === 'Merengue' ? 4 : 8;
  const beatDivider = machine.flavor === 'Merengue' ? 2 : 1;
  const beatIndex = engine?.playing ? Math.round(0.5 + ((engine.beat / beatDivider) % beatCount)) : 0;

  useWindowListener(
    'keydown',
    (event: KeyboardEvent) => {
      switch (event.key) {
        case '+':
        case '=':
          machine.bpm = Math.min(250, machine.bpm + 5);
          break;
        case '-':
          machine.bpm = Math.max(80, machine.bpm - 5);
          break;
        case 'k':
          machine.keyNote = (machine.keyNote + 7) % 12;
          break;
        case 'K':
          machine.keyNote = (machine.keyNote + 5) % 12;
          break;
      }
      if (event.key >= '0' && event.key <= '9') {
        const index = (parseInt(event.key, 10) + 10 - 1) % 10;
        const instrument = machine.instruments[index];
        if (instrument) {
          if (event.altKey) {
            instrument.activeProgram = (instrument.activeProgram + 1) % instrument.programs.length;
          } else {
            instrument.enabled = !instrument.enabled;
          }
        }
      }
    },
    [machine],
  );

  const handlePlayPause = () => {
    if (engine?.playing) {
      engine?.stop();
    } else {
      engine?.play();
    }
  };

  const handleStop = () => {
    engine?.stop();
  };

  return (
    <div className={styles.container}>
      {/* Control Bar */}
      <GlassContainer className={styles.controlBar}>
        <div className={styles.controls}>
          <GlassButton
            variant="primary"
            leftIcon={engine?.playing ? <PauseIcon /> : <PlayArrowIcon />}
            onClick={handlePlayPause}
          >
            {engine?.playing ? 'Pause' : 'Play'}
          </GlassButton>
          <GlassButton variant="ghost" leftIcon={<StopIcon />} onClick={handleStop}>
            Stop
          </GlassButton>
          
          <div className={styles.bpmControl}>
            <span className={styles.bpmLabel}>BPM:</span>
            <span className={styles.bpmValue}>{machine.bpm}</span>
            <GlassSlider
              value={machine.bpm}
              min={80}
              max={200}
              step={5}
              onChange={(value) => (machine.bpm = value)}
              className={styles.bpmSlider}
            />
          </div>

          <div className={styles.flavorSelect}>
            <GlassButton
              variant={machine.flavor === 'Salsa' ? 'primary' : 'ghost'}
              onClick={() => setMachine(observable(salsa))}
            >
              Salsa
            </GlassButton>
            <GlassButton
              variant={machine.flavor === 'Merengue' ? 'primary' : 'ghost'}
              onClick={() => setMachine(observable(merengue))}
            >
              Merengue
            </GlassButton>
          </div>
        </div>
      </GlassContainer>

      {/* Beat Indicator */}
      <GlassContainer className={styles.beatIndicator}>
        <BeatIndicator currentBeat={beatIndex} max={beatCount} />
      </GlassContainer>

      {/* Instrument Grid */}
      <div className={styles.instrumentGrid}>
        {machine.instruments.map((instrument) => (
          <GlassContainer key={instrument.id} className={styles.instrumentCard}>
            <InstrumentTile instrument={instrument} />
          </GlassContainer>
        ))}
      </div>
    </div>
  );
});
