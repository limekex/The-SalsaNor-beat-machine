import {
  Button,
  ButtonGroup,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Select,
  Slider,
  Stack,
  Typography,
} from '@mui/material';

import PauseIcon from '@mui/icons-material/Pause';
import PlayIcon from '@mui/icons-material/PlayArrow';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import classnames from 'classnames';
import { observable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useEffect, useState } from 'react';
import { IMachine } from '../engine/machine-interfaces';
import { useBeatEngine } from '../hooks/use-beat-engine';
import { useWindowListener } from '../hooks/use-window-listener';
import { BeatIndicator } from './beat-indicator';
import styles from './css/beat-machine-ui.module.css';
import { InstrumentTile } from './instrument-tile';

export interface IDefaultMachines {
  salsa: IMachine;
  merengue: IMachine;
}

export interface IBeatMachineUIProps {
  machines: IDefaultMachines;
}

export const BeatMachineUI = observer(({ machines }: IBeatMachineUIProps) => {
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

  const playClick = () => {
    if (engine?.playing) {
      engine?.stop();
    } else {
      engine?.play();
    }
  };

  return (
    <div>
      <div className={styles.card}>
        <Grid container spacing={2}>
          <Grid size={2}>
            <IconButton onClick={playClick} aria-label={engine?.playing ? 'Pause' : 'Play'} style={{ color: '#000' }}>
              {engine?.playing ? (
                <PauseCircleOutlineIcon fontSize="large" />
              ) : (
                <PlayCircleOutlineIcon fontSize="large" />
              )}
            </IconButton>
          </Grid>
          <Grid size={3}>
            < direction="row" spacing={1} alignItems="center">
            <Slider
              min={80}
              max={250}
              valueLabelDisplay="auto"
              value={machine.bpm}
              aria-labelledby="bpm-slider"
              onChange={(e, newValue) => (machine.bpm = newValue as number)}
            /><
          </Grid>
          <Grid size={2}>
            <Typography id="bpm-slider" gutterBottom>
              {machine.bpm} BPM
            </Typography>
          </Grid>

          <Grid size={4}>
            {engine && salsa && merengue && (
              <ButtonGroup variant="text" color="primary" aria-label="Music style">
                <Button
                  onClick={() => setMachine(observable(salsa))}
                  variant={machine.flavor === 'Salsa' ? 'contained' : undefined}
                >
                  Salsa
                </Button>
                <Button
                  onClick={() => setMachine(observable(merengue))}
                  variant={machine.flavor === 'Merengue' ? 'contained' : undefined}
                >
                  Merengue
                </Button>
              </ButtonGroup>
            )}
          </Grid>
          <Grid size={3} />
          <Grid size={10}>
            <FormControl>
              <InputLabel htmlFor="machine-key-note">Key</InputLabel>
              <Select
                native
                value={machine.keyNote}
                onChange={(e) => (machine.keyNote = parseInt(e.target.value as string, 10))}
                inputProps={{
                  id: 'machine-key-note',
                }}
              >
                <option value="0">C</option>
                <option value="1">C#</option>
                <option value="2">D</option>
                <option value="3">D#</option>
                <option value="4">E</option>
                <option value="5">F</option>
                <option value="6">F#</option>
                <option value="7">G</option>
                <option value="8">G#</option>
                <option value="9">A</option>
                <option value="10">A#</option>
                <option value="11">B</option>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <div className={styles.controlsIndicator}>
          <BeatIndicator currentBeat={beatIndex} max={beatCount} />
        </div>
      </div>

      <div className={classnames(styles.card, styles.instrumentList)}>
        {machine?.instruments.map((instrument) => (
          <div key={instrument.id} className={styles.instrumentTile}>
            <InstrumentTile instrument={instrument} />
          </div>
        ))}
      </div>
    </div>
  );
});
