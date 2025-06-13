import { GetStaticProps } from 'next';
import Head from 'next/head';
import { BeatMachineUI, IDefaultMachines } from '../components/beat-machine-ui';
// import { MobileAppLinks } from '../components/mobile-app-links';
import { loadMachine } from '../services/load-machine';
import styles from './index.module.css';

interface IHomeProps {
  machines: IDefaultMachines;
}

export default function Home({ machines }: IHomeProps) {
  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <title>The SalsaNor SalsaBeat Machine 🎼🎹</title>

        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/x-icon" href="favicon.ico" />
        <link href="https://fonts.googleapis.com/css?family=Merriweather:300" rel="stylesheet" />
        <link rel="manifest" href="manifest.json" />
        <meta name="theme-color" content="#1976d2" />
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

      <div className={styles.homepage}>
        <h1>The SalsaNor SalsaBeat Machine</h1>

        <div className={styles.appContainer}>
          <BeatMachineUI machines={machines} />
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps<IHomeProps> = async () => {
  const salsa = await loadMachine('salsa.xml');
  const merengue = await loadMachine('merengue.xml');
  return {
    props: {
      machines: { salsa, merengue },
    },
  };
};
