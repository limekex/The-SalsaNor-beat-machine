import type { AppProps } from 'next/app';
import Head from 'next/head';
import { GoogleAnalyticsScript } from '../components/google-analytics';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>The SalsaNor SalsaBeat Machine 🎼🎹</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Component {...pageProps} />
      <GoogleAnalyticsScript />
    </>
  );
}

export default MyApp;
