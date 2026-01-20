import { useState, useEffect } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { observable } from 'mobx';
import { useMachine } from '../hooks/use-machine';
import { IMachine } from '../engine/machine-interfaces';

// Import WidgetCompact with SSR disabled
const WidgetCompact = dynamic(
  () => import('../src/widget/WidgetCompact').then(mod => mod.WidgetCompact),
  { ssr: false }
);

export default function WidgetDemo() {
  // Load the real salsa machine with audio samples
  const salsaMachine = useMachine('/assets/machines/salsa.xml');

  // Create observable copies with filtered instruments and custom BPM
  const createFilteredMachine = (instruments: string[], bpm: number): IMachine | null => {
    if (!salsaMachine) return null;
    
    return observable({
      ...salsaMachine,
      bpm,
      instruments: salsaMachine.instruments.map(inst => 
        observable({
          ...inst,
          enabled: instruments.includes(inst.id)
        })
      )
    });
  };

  // Don't render until machine is loaded
  if (!salsaMachine) {
    return (
      <>
        <Head>
          <title>Beat Machine Widget Demo</title>
        </Head>
        <div style={containerStyle}>
          <div style={wrapperStyle}>
            <h1 style={titleStyle}>🎵 Loading Beat Machine...</h1>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Beat Machine Widget Demo</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div style={containerStyle}>
        <div style={wrapperStyle}>
          <h1 style={titleStyle}>🎵 Beat Machine Widget Demo</h1>

          {/* Example 1: Basic Clave */}
          <div style={sectionStyle}>
            <h2 style={subtitleStyle}>Example 1: Simple Clave Pattern</h2>
            <p style={textStyle}>The most basic usage - just a clave rhythm with default settings.</p>
            <pre style={preStyle}><code style={codeStyle}>&lt;div data-beat-widget data-instruments="clave"&gt;&lt;/div&gt;</code></pre>
            <div style={demoBoxStyle}>
              <WidgetCompact machine={createFilteredMachine(['clave'], 120)!} />
            </div>
          </div>

          {/* Example 2: Cowbell at 140 BPM */}
          <div style={sectionStyle}>
            <h2 style={subtitleStyle}>Example 2: Cowbell with Custom Tempo</h2>
            <p style={textStyle}>Cowbell rhythm at a faster tempo of 140 BPM.</p>
            <pre style={preStyle}><code style={codeStyle}>&lt;div data-beat-widget data-instruments="cowbell" data-bpm="140"&gt;&lt;/div&gt;</code></pre>
            <div style={demoBoxStyle}>
              <WidgetCompact machine={createFilteredMachine(['cowbell'], 140)!} />
            </div>
          </div>

          {/* Example 3: Multiple Instruments */}
          <div style={sectionStyle}>
            <h2 style={subtitleStyle}>Example 3: Salsa Rhythm Combination</h2>
            <p style={textStyle}>Multiple instruments playing together - clave, cowbell, and bongo.</p>
            <pre style={preStyle}><code style={codeStyle}>&lt;div data-beat-widget data-instruments="clave,cowbell,bongo" data-bpm="120"&gt;&lt;/div&gt;</code></pre>
            <div style={demoBoxStyle}>
              <WidgetCompact machine={createFilteredMachine(['clave', 'cowbell', 'bongo'], 120)!} />
            </div>
          </div>

          {/* Example 4: Slow Tempo */}
          <div style={sectionStyle}>
            <h2 style={subtitleStyle}>Example 4: Educational Slow Tempo</h2>
            <p style={textStyle}>Perfect for learning - clave at a slow 80 BPM.</p>
            <pre style={preStyle}><code style={codeStyle}>&lt;div data-beat-widget data-instruments="clave" data-bpm="80"&gt;&lt;/div&gt;</code></pre>
            <div style={demoBoxStyle}>
              <WidgetCompact machine={createFilteredMachine(['clave'], 80)!} />
            </div>
          </div>

          {/* Example 5: Inline */}
          <div style={sectionStyle}>
            <h2 style={subtitleStyle}>Example 5: Inline in Paragraph</h2>
            <p style={textStyle}>
              You can even embed the widget inline with text, like this:{' '}
              <span style={{ display: 'inline-flex' }}>
                <WidgetCompact machine={createFilteredMachine(['clave'], 100)!} />
              </span>
              {' '}See how it flows naturally with the content?
            </p>
          </div>

          {/* Usage Instructions */}
          <div style={sectionStyle}>
            <h2 style={subtitleStyle}>📦 How to Use</h2>
            <p style={textStyle}>Add this script tag to your page:</p>
            <pre style={preStyle}><code style={codeStyle}>&lt;script src="/widget.js"&gt;&lt;/script&gt;</code></pre>
            <p style={textStyle}>Then add the widget anywhere in your HTML:</p>
            <pre style={preStyle}><code style={codeStyle}>&lt;div data-beat-widget data-instruments="clave,cowbell" data-bpm="120"&gt;&lt;/div&gt;</code></pre>
          </div>
        </div>
      </div>
    </>
  );
}

// Inline styles
const containerStyle: React.CSSProperties = {
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
  color: 'rgba(255, 255, 255, 0.95)',
  padding: '2rem',
  minHeight: '100vh',
};

const wrapperStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
};

const titleStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '3rem',
  background: 'linear-gradient(135deg, #FFC947 0%, #FF9933 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const sectionStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '1rem',
  padding: '2rem',
  marginBottom: '2rem',
};

const subtitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: '1rem',
  color: '#FFC947',
};

const textStyle: React.CSSProperties = {
  marginBottom: '1rem',
  lineHeight: 1.6,
};

const preStyle: React.CSSProperties = {
  background: 'rgba(0, 0, 0, 0.3)',
  padding: '1rem',
  borderRadius: '0.5rem',
  overflow: 'auto',
  margin: '1rem 0',
};

const codeStyle: React.CSSProperties = {
  fontFamily: "'Fira Code', monospace",
  fontSize: '0.875rem',
  color: '#FFC947',
};

const demoBoxStyle: React.CSSProperties = {
  padding: '1rem',
  background: 'rgba(0, 0, 0, 0.2)',
  borderRadius: '0.5rem',
  margin: '1rem 0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};
