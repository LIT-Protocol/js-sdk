import Head from 'next/head';
import './styles.css';
function CustomApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>(Next.js) Lit Test</title>
      </Head>
      <main className="app">
        <Component {...pageProps} />
      </main>
    </>
  );
}
export default CustomApp;
