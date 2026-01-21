import { useState, useMemo } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { GetStaticProps } from 'next';
import { useMachine } from '../hooks/use-machine';
import { observable } from 'mobx';
import { IMachine } from '../engine/machine-interfaces';
import { loadMachine } from '../services/load-machine';
import styles from './widget-generator.module.css';

const WidgetCompact = dynamic(
  () => import('../src/widget/WidgetCompact').then(mod => mod.WidgetCompact),
  { ssr: false }
);

interface IWidgetGeneratorProps {
  salsaInstruments: string[];
  merengueInstruments: string[];
}

export default function WidgetGenerator({ salsaInstruments, merengueInstruments }: IWidgetGeneratorProps) {
  const [machineType, setMachineType] = useState<'salsa' | 'merengue'>('salsa');
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>(['clave']);
  const [instrumentPrograms, setInstrumentPrograms] = useState<Record<string, number>>({});
  const [bpm, setBpm] = useState(120);
  const [autoplay, setAutoplay] = useState(false);
  const [instructorLanguage, setInstructorLanguage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const salsaMachine = useMachine('/assets/machines/salsa.xml');
  const merengueMachine = useMachine('/assets/machines/merengue.xml');

  const availableInstruments = machineType === 'salsa' ? salsaInstruments : merengueInstruments;
  const currentMachine = machineType === 'salsa' ? salsaMachine : merengueMachine;

  const previewMachine = useMemo(() => {
    if (!currentMachine) return null;
    return observable({
      ...currentMachine,
      bpm,
      instruments: currentMachine.instruments.map(inst => {
        const programIndex = instrumentPrograms[inst.id] ?? inst.activeProgram;
        return observable({
          ...inst,
          enabled: selectedInstruments.includes(inst.id),
          activeProgram: programIndex,
          language: inst.id === 'instructor' && instructorLanguage ? instructorLanguage : undefined
        });
      })
    });
  }, [currentMachine, selectedInstruments, bpm, instrumentPrograms, instructorLanguage]);

  const toggleInstrument = (instrumentId: string) => {
    setSelectedInstruments(prev =>
      prev.includes(instrumentId)
        ? prev.filter(id => id !== instrumentId)
        : [...prev, instrumentId]
    );
  };

  const setInstrumentProgram = (instrumentId: string, programIndex: number) => {
    setInstrumentPrograms(prev => ({
      ...prev,
      [instrumentId]: programIndex
    }));
  };

  const getInstrumentFromMachine = (instrumentId: string) => {
    return currentMachine?.instruments.find(i => i.id === instrumentId);
  };

  const selectAllInstruments = () => {
    setSelectedInstruments(availableInstruments);
  };

  const clearAllInstruments = () => {
    setSelectedInstruments([]);
  };

  const generateCode = () => {
    const instruments = selectedInstruments.join(',');

    // Generate programs string: "clave:1,cowbell:2"
    const programsArray = Object.entries(instrumentPrograms)
      .filter(([instrumentId, _]) => selectedInstruments.includes(instrumentId))
      .map(([instrumentId, programIndex]) => `${instrumentId}:${programIndex}`);
    const programsString = programsArray.length > 0 ? programsArray.join(',') : '';

    const attrs = [
      'data-beat-widget',
      selectedInstruments.length > 0 ? `data-instruments="${instruments}"` : '',
      programsString ? `data-programs="${programsString}"` : '',
      bpm !== 120 ? `data-bpm="${bpm}"` : '',
      machineType !== 'salsa' ? `data-machine="${machineType}"` : '',
      autoplay ? `data-autoplay="true"` : '',
      instructorLanguage && selectedInstruments.includes('instructor') ? `data-instructor-language="${instructorLanguage}"` : '',
    ].filter(Boolean).join(' ');

    return `<div ${attrs}></div>`;
  };

  const generateFullHTML = () => {
    const widgetCode = generateCode();

    // Generate installation instructions with proper structure
    return `<!-- Add this code just below <body> tag (only once per page) -->
<script src="https://beat.salsanor.no/widget.js"></script>

<!-- Add widget(s) anywhere in your content -->
${widgetCode}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!salsaMachine || !merengueMachine) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>🎵 Loading SalsaNor Beat...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Widget Generator - SalsaNor Beat</title>
        <meta name="description" content="Generate code for SalsaNor Beat Widget" />
      </Head>

      <div className={styles.container}>
        <nav className={styles.nav}>
          <a href="/" className={styles.navLink}>🏠 Main App</a>
          <a href="/docs" className={styles.navLink}>📚 Documentation</a>
          <a href="/widget-demo" className={styles.navLink}>🎬 Widget Demo</a>
        </nav>

        <header className={styles.header}>
          <h1>🎵 SalsaNor Beat Widget Generator</h1>
          <p>Select instruments and settings, see live preview, and copy ready-to-use code.</p>
        </header>

        <div className={styles.grid}>
          {/* Left Panel - Configuration */}
          <div className={styles.panel}>
            <section className={styles.section}>
              <h2>Machine Type</h2>
              <div className={styles.radioGroup}>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    value="salsa"
                    checked={machineType === 'salsa'}
                    onChange={(e) => {
                      setMachineType(e.target.value as 'salsa');
                      setSelectedInstruments(['clave']);
                    }}
                  />
                  <span>Salsa (8 beats)</span>
                </label>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    value="merengue"
                    checked={machineType === 'merengue'}
                    onChange={(e) => {
                      setMachineType(e.target.value as 'merengue');
                      setSelectedInstruments(['tambora']);
                    }}
                  />
                  <span>Merengue (4 beats)</span>
                </label>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Instruments</h2>
                <div className={styles.buttonGroup}>
                  <button onClick={selectAllInstruments} className={styles.smallButton}>
                    Select All
                  </button>
                  <button onClick={clearAllInstruments} className={styles.smallButton}>
                    Clear All
                  </button>
                </div>
              </div>
              <div className={styles.checkboxGroup}>
                {availableInstruments.map(instrumentId => {
                  const instrument = getInstrumentFromMachine(instrumentId);
                  const hasMultiplePrograms = instrument && instrument.programs.length > 1;
                  const selectedProgram = instrumentPrograms[instrumentId] ?? instrument?.activeProgram ?? 0;

                  return (
                    <div key={instrumentId} className={styles.instrumentItem}>
                      <label className={styles.checkbox}>
                        <input
                          type="checkbox"
                          checked={selectedInstruments.includes(instrumentId)}
                          onChange={() => toggleInstrument(instrumentId)}
                        />
                        <span className={styles.instrumentName}>{instrument?.title || instrumentId}</span>
                      </label>

                      {hasMultiplePrograms && selectedInstruments.includes(instrumentId) && (
                        <select
                          value={selectedProgram}
                          onChange={(e) => setInstrumentProgram(instrumentId, parseInt(e.target.value))}
                          className={styles.programSelect}
                        >
                          {instrument.programs.map((program: any, idx: number) => (
                            <option key={idx} value={idx}>
                              {program.title || `Pattern ${idx + 1}`}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className={styles.section}>
              <h2>Tempo (BPM)</h2>
              <div className={styles.bpmControl}>
                <input
                  type="range"
                  min="60"
                  max="200"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value))}
                  className={styles.slider}
                />
                <span className={styles.bpmValue}>{bpm} BPM</span>
              </div>
            </section>

            <section className={styles.section}>
              <h2>Settings</h2>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={autoplay}
                  onChange={(e) => setAutoplay(e.target.checked)}
                />
                <span>Autoplay (starts automatically)</span>
              </label>
            </section>

            {selectedInstruments.includes('instructor') && (
              <section className={styles.section}>
                <h2>Instructor Language</h2>
                <select
                  value={instructorLanguage}
                  onChange={(e) => setInstructorLanguage(e.target.value)}
                  className={styles.programSelect}
                >
                  <option value="">English (default)</option>
                  <option value="italian">🇮🇹 Italian</option>
                  <option value="spanish">🇪🇸 Spanish</option>
                  <option value="french">🇫🇷 French</option>
                  <option value="russian">🇷🇺 Russian</option>
                  <option value="german">🇩🇪 German</option>
                </select>
                <p className={styles.help}>
                  Language for counting beats (1, 2, 3, etc.)
                </p>
              </section>
            )}
          </div>

          {/* Right Panel - Preview & Code */}
          <div className={styles.panel}>
            <section className={styles.section}>
              <h2>Live Preview</h2>
              <div className={styles.preview}>
                {previewMachine && (
                  <WidgetCompact machine={previewMachine} />
                )}
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.codeHeader}>
                <h2>Step 1: Add this code just below &lt;body&gt; tag (once per page)</h2>
                <button
                  onClick={() => copyToClipboard(generateFullHTML())}
                  className={styles.copyButton}
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <pre className={styles.code}><code>{generateFullHTML()}</code></pre>
              <p className={styles.help}>
                This loads the Beat Machine widget library and sets the base URL for audio files.
                Add this only once, even if you have multiple widgets on the same page.
              </p>
            </section>

            <section className={styles.section}>
              <div className={styles.codeHeader}>
                <h2>Step 2: Add widget(s) anywhere in your content</h2>
                <button
                  onClick={() => copyToClipboard(generateCode())}
                  className={styles.copyButton}
                >
                  {copied ? '✓ Copied!' : '📋 Copy'}
                </button>
              </div>
              <pre className={styles.code}><code>{generateCode()}</code></pre>
              <p className={styles.help}>
                Place this code wherever you want the instrument player to appear.
                You can add multiple widgets with different instruments on the same page.
              </p>
            </section>
          </div>
        </div>

        <footer className={styles.footer}>
          <p>
            🎵 <a href="/widget-demo" target="_blank">See more examples</a>
            {' • '}
            🏠 <a href="/">Back to home</a>
          </p>
        </footer>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<IWidgetGeneratorProps> = async () => {
  try {
    const salsa = await loadMachine('salsa.xml');
    const merengue = await loadMachine('merengue.xml');

    return {
      props: {
        salsaInstruments: salsa.instruments.map((i: any) => i.id),
        merengueInstruments: merengue.instruments.map((i: any) => i.id),
      },
    };
  } catch (error) {
    console.error('Failed to load machines:', error);
    return {
      notFound: true,
    };
  }
};
