// Polyfill for process global (needed for MobX in browser)
if (typeof process === 'undefined') {
  (window as any).process = { env: { NODE_ENV: 'production' } };
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import { observable } from 'mobx';
import { loadMachineClient, setWidgetBaseUrl, getWidgetBaseUrl } from '../services/load-machine-client';
import { WidgetCompact } from './WidgetCompact';
import { WidgetConfig, WidgetInstance } from './widget-types';

// Inject widget CSS into the page
function injectWidgetCSS() {
  if (document.getElementById('beat-machine-widget-styles')) {
    return; // Already injected
  }

  const style = document.createElement('style');
  style.id = 'beat-machine-widget-styles';
  style.textContent = `
    .beat-widget {
      display: inline-flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 0.75rem 1.25rem;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(0, 245, 255, 0.1));
      border: 1px solid rgba(0, 245, 255, 0.3);
      border-radius: 0.75rem;
      backdrop-filter: blur(10px);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
    }

    .beat-widget .playButton {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #FFC947 0%, #FF9933 100%);
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(255, 201, 71, 0.3);
    }

    .beat-widget .playButton:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(255, 201, 71, 0.5);
    }

    .beat-widget .playButton:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .beat-widget .playButton.playing {
      background: linear-gradient(135deg, #FF8C69 0%, #FF6B4A 100%);
    }

    .beat-widget .playButton svg {
      width: 1.25rem;
      height: 1.25rem;
      fill: currentColor;
    }

    .beat-widget .bpmControl {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 120px;
    }

    .beat-widget .bpmLabel {
      font-size: 0.875rem;
      font-weight: 600;
      color: #FF9933;
      text-align: center;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .beat-widget .slider {
      width: 100%;
      height: 6px;
      border-radius: 3px;
      background: rgba(255, 153, 51, 0.25);
      outline: none;
      cursor: pointer;
      -webkit-appearance: none;
      appearance: none;
    }

    .beat-widget .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #FF9933;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 8px rgba(255, 153, 51, 0.4);
    }

    .beat-widget .slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #FF9933;
      cursor: pointer;
      border: none;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 0 8px rgba(255, 153, 51, 0.4);
    }

    .beat-widget .widgetContent {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .beat-widget .footer {
      margin-top: 0.25rem;
      text-align: center;
      font-size: 0.65rem;
      opacity: 0.6;
      line-height: 1;
    }

    .beat-widget .footer a {
      color: inherit;
      text-decoration: none;
      transition: opacity 0.2s ease;
    }

    .beat-widget .footer a:hover {
      opacity: 1;
      text-decoration: underline;
    }
  `;
  document.head.appendChild(style);
}

class BeatMachineWidget {
  private instances: Map<HTMLElement, { root: ReactDOM.Root; instance: WidgetInstance }> = new Map();

  async init(selector: string = '[data-beat-widget]') {
    // Inject CSS first
    injectWidgetCSS();
    
    const elements = document.querySelectorAll(selector);
    
    // Convert NodeList to Array to avoid iteration issues
    const elementsArray = Array.from(elements);
    
    for (const element of elementsArray) {
      if (!(element instanceof HTMLElement)) continue;
      
      const config = this.parseConfig(element);
      await this.create(element, config);
    }
  }

  private parseConfig(element: HTMLElement): WidgetConfig {
    const instruments = element.dataset.instruments?.split(',').map(s => s.trim()) || [];
    const bpm = element.dataset.bpm ? parseInt(element.dataset.bpm, 10) : 120;
    const machine = (element.dataset.machine || 'salsa') as 'salsa' | 'merengue';
    const autoplay = element.dataset.autoplay === 'true';
    
    // Parse programs: data-programs="clave:1,cowbell:2"
    const programs: Record<string, number> = {};
    if (element.dataset.programs) {
      const programPairs = element.dataset.programs.split(',');
      programPairs.forEach(pair => {
        const [instrumentId, programIndex] = pair.split(':').map(s => s.trim());
        if (instrumentId && programIndex) {
          programs[instrumentId] = parseInt(programIndex, 10);
        }
      });
    }

    return { instruments, programs, bpm, machine, autoplay };
  }

  async create(element: HTMLElement, config: WidgetConfig): Promise<WidgetInstance> {
    // Load machine
    const machineName = config.machine || 'salsa';
    const machineData = await loadMachineClient(machineName);
    const machine = observable(machineData);

    // Set initial BPM from config if provided
    if (config.bpm) {
      machine.bpm = config.bpm;
    }

    // Set instrument programs if specified
    if (config.programs) {
      machine.instruments.forEach(instrument => {
        if (config.programs![instrument.id] !== undefined) {
          instrument.activeProgram = config.programs![instrument.id];
        }
      });
    }

    // Create React root
    const root = ReactDOM.createRoot(element);
    
    // Create instance API
    const instance: WidgetInstance = {
      play: () => {
        // Will be controlled by component
      },
      pause: () => {
        // Will be controlled by component
      },
      stop: () => {
        // Will be controlled by component
      },
      setBPM: (bpm: number) => {
        machine.bpm = bpm;
      },
      destroy: () => {
        root.unmount();
        this.instances.delete(element);
      }
    };

    // Render widget
    root.render(
      <React.StrictMode>
        <WidgetCompact 
          machine={machine}
          instruments={config.instruments}
          initialBpm={config.bpm}
          autoplay={config.autoplay}
        />
      </React.StrictMode>
    );

    this.instances.set(element, { root, instance });
    return instance;
  }

  destroy(element: HTMLElement) {
    const widget = this.instances.get(element);
    if (widget) {
      widget.instance.destroy();
    }
  }
}

// Create global instance
const widgetManager = new BeatMachineWidget();

// Expose to window
declare global {
  interface Window {
    BeatMachineWidget: {
      init: (selector?: string) => Promise<void>;
      create: (element: HTMLElement, config: WidgetConfig) => Promise<WidgetInstance>;
      destroy: (element: HTMLElement) => void;
      setBaseUrl: (url: string) => void;
    };
  }
}

window.BeatMachineWidget = {
  init: (selector?: string) => widgetManager.init(selector),
  create: (element: HTMLElement, config: WidgetConfig) => widgetManager.create(element, config),
  destroy: (element: HTMLElement) => widgetManager.destroy(element),
  setBaseUrl: (url: string) => {
    setWidgetBaseUrl(url);
    console.log('✅ Beat Machine Widget base URL set to:', url);
  }
};

// Check for global base URL configuration
if ((window as any).BEAT_MACHINE_BASE_URL) {
  setWidgetBaseUrl((window as any).BEAT_MACHINE_BASE_URL);
  console.log('✅ Beat Machine Widget loaded with base URL:', (window as any).BEAT_MACHINE_BASE_URL);
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    widgetManager.init();
  });
} else {
  widgetManager.init();
}

export { WidgetCompact };
