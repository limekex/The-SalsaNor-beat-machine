import {
  Button,
  ButtonGroup,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  Select,
  Slider,
  Typography,
} from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayIcon from '@mui/icons-material/PlayArrow';
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
        <Grid container spacing={2} alignItems="center">
          <Grid>
            <IconButton onClick={playClick} aria-label={engine?.playing ? 'Pause' : 'Play'} color="primary">
              {engine?.playing ? <PauseIcon /> : <PlayIcon />}
            </IconButton>
          </Grid>
          <Grid item xs={3}>
            <Slider
              min={80}
              max={250}
              valueLabelDisplay="auto"
              value={machine.bpm}
              aria-labelledby="bpm-slider"
              onChange={(e, newValue) => (machine.bpm = newValue as number)}
            />
          </Grid>
          <Grid>
            <Typography id="bpm-slider" gutterBottom>
              {machine.bpm} BPM
            </Typography>
          </Grid>
          <Grid>
            <ButtonGroup variant="contained" color="primary">
              <Button
                onClick={() => setMachine(observable(salsa))}
                variant={machine.flavor === 'Salsa' ? 'contained' : 'outlined'}
              >
                Salsa
              </Button>
              <Button
                onClick={() => setMachine(observable(merengue))}
                variant={machine.flavor === 'Merengue' ? 'contained' : 'outlined'}
              >
                Merengue
              </Button>
            </ButtonGroup>
          </Grid>
          <Grid>
            <FormControl>
              <InputLabel htmlFor="machine-key-note">Key</InputLabel>
              <Select
                native
                value={machine.keyNote}
                onChange={(e) => (machine.keyNote = parseInt(e.target.value as string, 10))}
              >
                {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map((key, index) => (
                  <option key={key} value={index}>
                    {key}
                  </option>
                ))}
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
('');
