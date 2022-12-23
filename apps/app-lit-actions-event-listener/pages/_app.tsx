import { AppProps } from 'next/app';
import Head from 'next/head';
import '../../../packages/ui/src/lib/style.css';
import './style.css';

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Lit Actions Event Listener</title>
      </Head>
      <main className="app">
        <Component {...pageProps} />
      </main>
    </>
  );
}

export default CustomApp;
