'use client';

import {
  checkAndSignAuthMessage,
  disconnectWeb3,
} from '@lit-protocol/auth-browser';
import { LOCAL_STORAGE_KEYS } from '@lit-protocol/constants';
import { useState } from 'react';

export default function Home() {
  const [authSig, setAuthSig] = useState(null);
  const [error, setError] = useState(null);

  async function generateAuthSig() {
    setAuthSig(null);
    setError(null);
    try {
      const newAuthSig = await checkAndSignAuthMessage({
        chain: 'mumbai',
        walletConnectProjectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID,
      });
      setAuthSig(newAuthSig);
    } catch (err) {
      console.error(err);
      setError(`Failed to sign auth message: ${err.message}`);
    }
  }

  async function disconnect() {
    setError(null);
    try {
      await disconnectWeb3();
      setAuthSig(null);
    } catch (err) {
      console.error(err);
      setError(`Failed to disconnect: ${err.message}`);
    }
  }

  return (
    <main className="main">
      {error && (
        <div className="alert alert--error">
          <p>❗️ {error}</p>
          <button className="alert__btn" onClick={generateAuthSig}>
            Try again
          </button>
        </div>
      )}
      {authSig ? (
        <>
          <p className="alert alert--success">
            🔐 Auth sig has been generated and stored in local storage under{' '}
            <code>{LOCAL_STORAGE_KEYS.AUTH_SIGNATURE}</code>!
          </p>
          <button className="btn btn--secondary" onClick={disconnect}>
            Disconnect
          </button>
        </>
      ) : (
        <button className="btn btn--primary" onClick={generateAuthSig}>
          Connect & sign
        </button>
      )}
    </main>
  );
}
