import { Component, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map, distinctUntilChanged } from 'rxjs/operators';

import { BeatEngineService } from './engine/beat-engine.service';
import { IMachine } from './engine/machine-interfaces';
import { XMLLoaderService } from './engine/xml-loader.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'bm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  lastBeatIndex: number;
  salsaMachine: IMachine;
  merengueMachine: IMachine;
  readonly electron = environment.electron;

  beat: Observable<number> = this.engine.beat.pipe(
    map((beatIndex) => {
      beatIndex = this.engine.playing ? Math.round((0.5 + beatIndex % 8)) : 0;
      if (this.machine.flavor === 'Merengue') {
        beatIndex = Math.round(beatIndex / 2);
      }
      return beatIndex;
    }),
    distinctUntilChanged(),
    tap(() => setTimeout(() => this.cd.detectChanges(), 0)),
  );

  constructor(http: HttpClient, loader: XMLLoaderService, private cd: ChangeDetectorRef,
    public engine: BeatEngineService) {
    http.get('assets/salsa.xml', { responseType: 'text' }).subscribe(value => {
      const xml = (new DOMParser()).parseFromString(value, 'text/xml');
      this.salsaMachine = loader.loadMachine(xml);
      engine.machine = this.salsaMachine;
    });
    http.get('assets/merengue.xml', { responseType: 'text' }).subscribe(value => {
      const xml = (new DOMParser()).parseFromString(value, 'text/xml');
      this.merengueMachine = loader.loadMachine(xml);
    });
  }

  get machine() {
    return this.engine.machine;
  }

  togglePlay() {
    if (this.engine.playing) {
      this.engine.stop();
    } else {
      this.engine.start();
    }
  }

  beatCount() {
    return this.machine.flavor === 'Merengue' ? 4 : 8;
  }

  get merengueEnabled() {
    return this.machine === this.merengueMachine;
  }

  set merengueEnabled(value: boolean) {
    this.engine.machine = value ? this.merengueMachine : this.salsaMachine;
  }

  onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case '+': case '=':
        this.machine.bpm = Math.min(250, this.machine.bpm + 5);
        break;

      case '-':
        this.machine.bpm = Math.max(80, this.machine.bpm - 5);
        break;

      case 'k':
        this.machine.keyNote = (this.machine.keyNote + 7) % 12;
        break;

      case 'K':
        this.machine.keyNote = (this.machine.keyNote + 5) % 12;
    }
    if (event.key >= '0' && event.key <= '9') {
      const index = (parseInt(event.key, 10) + 10 - 1) % 10;
      const instrument = this.machine.instruments[index];
      if (instrument) {
        if (event.altKey) {
          instrument.activeProgram = (instrument.activeProgram + 1) % instrument.programs.length;
        } else {
          instrument.enabled = !instrument.enabled;
        }
      }
    }
  }
}
