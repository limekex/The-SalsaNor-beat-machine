import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { BeatMachineUI, IDefaultMachines } from '../components/beat-machine-ui';
import { BeatMachineUIGlass } from '../components/beat-machine-ui-glass';
import { loadMachine } from '../services/load-machine';
import styles from './index.module.scss';

interface IHomeProps {
  machines: IDefaultMachines;
}

export default function Home({ machines }: IHomeProps) {
  const [useGlassUI, setUseGlassUI] = useState(true);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>The SalsaNor SalsaBeat Machine 🎼🎹</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#667eea" />
        <meta
          name="description"
          content="Explore Salsa music with an interactive rhythm machine. Practice Salsa timing and train your ears. Combine and arrange instruments to create different salsa tunes."
        />
        <meta property="og:title" content="The SalsaNor SalsaBeat Machine" />
        <meta
          property="og:description"
          content="Explore Salsa music with an interactive rhythm machine. Practice Salsa timing and train your ears. Combine and arrange instruments to create different salsa tunes."
        />
        <meta property="og:url" content="https://salsanor.no" />
        <meta property="og:image" content="https://salsabeatmachine.org/assets/images/salsabeatmachine-cover.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
      </Head>

      <main className={styles.homepage}>
        <h1 className={styles.title}>🎵 The SalsaNor Beat Machine</h1>

        <div className={styles.appContainer}>
          {useGlassUI ? (
            <BeatMachineUIGlass machines={machines} />
          ) : (
            <BeatMachineUI machines={machines} />
          )}
        </div>
        
        <button 
          onClick={() => setUseGlassUI(!useGlassUI)}
          className={styles.uiToggle}
          title={`Switch to ${useGlassUI ? 'Classic' : 'Glass'} UI`}
        >
          {useGlassUI ? '🎨 Classic UI' : '✨ Glass UI'}
        </button>
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<IHomeProps> = async () => {
  try {
    const salsa = await loadMachine('salsa.xml');
    const merengue = await loadMachine('merengue.xml');
    return {
      props: {
        machines: { salsa, merengue },
      },
    };
  } catch (error) {
    console.error('Failed to load machines:', error);
    return {
      notFound: true,
    };
  }
};
