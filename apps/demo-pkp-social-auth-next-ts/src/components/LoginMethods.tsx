import { useState } from 'react';

import AuthMethods from './AuthMethods';
import EmailSMSAuth from './EmailSMSAuth';
import WalletMethods from './WalletMethods';
import WebAuthn from './WebAuthn';
import StytchOTP from './StytchOTP';

interface LoginProps {
  handleGoogleLogin: () => Promise<void>;
  handleDiscordLogin: () => Promise<void>;
  authWithEthWallet: any;
  authWithOTP: any;
  authWithWebAuthn: any;
  authWithStytch: any;
  signUp: any;
  error?: Error;
}

type AuthView = 'default' | 'email' | 'phone' | 'wallet' | 'webauthn';

export default function LoginMethods({
  handleGoogleLogin,
  handleDiscordLogin,
  authWithEthWallet,
  authWithOTP,
  authWithWebAuthn,
  authWithStytch,
  signUp,
  error,
}: LoginProps) {
  const [view, setView] = useState<AuthView>('default');

  return (
    <div className="container">
      <div className="wrapper">
        {error && (
          <div className="alert alert--error">
            <p>{error.message}</p>
          </div>
        )}
        {view === 'default' && (
          <>
            <h1>Welcome back</h1>
            <p>Access your Lit wallet.</p>
            <AuthMethods
              handleGoogleLogin={handleGoogleLogin}
              handleDiscordLogin={handleDiscordLogin}
              setView={setView}
            />
            <div className="buttons-container">
              <button type="button" className="btn btn--link" onClick={signUp}>
                Need an account? Sign up
              </button>
            </div>
          </>
        )}
        {view === 'email' && (
          <EmailSMSAuth
            method={'email'}
            setView={setView}
            authWithOTP={authWithOTP}
          />
        )}
        {/* {view === 'phone' && (
          <EmailSMSAuth
            method={'phone'}
            setView={setView}
            authWithOTP={authWithOTP}
          />
        )} */}
        {view === 'phone' && (
          <StytchOTP authWithStytch={authWithStytch} setView={setView} />
        )}
        {view === 'wallet' && (
          <WalletMethods
            authWithEthWallet={authWithEthWallet}
            setView={setView}
          />
        )}
        {view === 'webauthn' && (
          <WebAuthn
            start={'authenticate'}
            authWithWebAuthn={authWithWebAuthn}
            setView={setView}
          />
        )}
      </div>
    </div>
  );
}
