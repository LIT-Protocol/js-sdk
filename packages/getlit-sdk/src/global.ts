import { Lit, Lit as LitInstance } from './lib/lit';
import { LitOptionsBuilder } from './lib/lit-options-builder';
import { GetLitAccount, GetLitAccountInstance, LitAuthMethod, OrNull, Types } from './lib/types';
import {
  GoogleProvider,
  AppleProvider,
  DiscordProvider,
  EthWalletProvider,
  WebAuthnProvider,
  // StytchOtpProvider,
} from '@lit-protocol/lit-auth-client';

import { LitStorage } from '@lit-protocol/lit-storage';
import { LitEmitter } from './lib/events/lit-emitter';
import { BrowserHelper } from './lib/browser-helper';
import { BaseIPFSProvider } from './lib/ipfs-provider/providers/base-ipfs-provider';
import { waitForLit } from './lib/utils';
import { StytchOTPProviderBrowser } from './lib/stych-otp-provider/providers/stytch-otp-provider-browser';
import { StytchOTPProviderNodeJS } from './lib/stych-otp-provider/providers/stytch-otp-provider-nodejs';

declare global {
  //@ts-ignore
  var Lit: {
    wait: any;

    // clients
    nodeClient: OrNull<Types.NodeClient>;
    authClient: OrNull<Types.AuthClient>;

    // persistent storage
    persistentStorage: OrNull<BaseIPFSProvider>;

    // storage
    storage: OrNull<LitStorage>;

    // getlit sdk
    builder: OrNull<LitOptionsBuilder>;
    debug: boolean;
    ready: boolean;
    eventEmitter: OrNull<LitEmitter>;

    // Lit class instance
    instance: OrNull<LitInstance>;

    // Lit class methods
    encrypt: LitInstance['encrypt'] | Function;
    decrypt: LitInstance['decrypt'] | Function;
    createAccount: LitInstance['createAccount'] | Function;
    getAccounts: LitInstance['getAccounts'] | Function;
    createAccountSession: LitInstance['createAccountSession'] | Function;
    account: (params: GetLitAccount) => GetLitAccountInstance;
    sign: LitInstance['sign'] | Function;

    // auths
    auth: {
      ethwallet: OrNull<EthWalletProvider>;
      webauthn: OrNull<WebAuthnProvider>;
      discord: OrNull<DiscordProvider>;
      google: OrNull<GoogleProvider>;
      otp: OrNull<StytchOTPProviderBrowser | StytchOTPProviderNodeJS>;
      apple: OrNull<AppleProvider>;
    };

    // utils
    getStoredAuthMethods: OrNull<Function>;
    getStoredAuthMethodsWithKeys: OrNull<Function>;
    getStoredEncryptedData: OrNull<Function>;
    clearAuthMethodSessions: OrNull<Function>;
    clearLitSessionItems: OrNull<Function>;

    // browser only
    browserHelper: BrowserHelper | null;

    collectAnalytics: boolean;
  };

  var ethereum: any;
}

// -- global "constructor" | APIs
globalThis.Lit = {
  wait: waitForLit,

  // clients
  nodeClient: null,
  authClient: null,

  // persistent storage
  persistentStorage: null,

  // storage
  storage: null,

  // getlit sdk
  builder: null,
  debug: true,
  ready: false,
  eventEmitter: null,

  // Lit class instance
  instance: null,

  // Lit class methods
  // encrypt: Lit.encrypt,
  encrypt: () => {
    console.log('not initialized');
  },
  decrypt: () => {
    console.log('not initialized');
  },
  createAccount: () => {
    console.log('not initialized');
  },
  getAccounts: () => {
    console.log('not initialized');
  },
  createAccountSession: () => {
    console.log('not initialized');
  },
  account: () => {
    console.log('not initialized');
    return {} as GetLitAccountInstance;
  },
  sign: () => {
    console.log('not initialized');
  },

  // auths
  auth: {
    ethwallet: null,
    webauthn: null,
    discord: null,
    google: null,
    otp: null,
    apple: null,
  },

  // utils
  getStoredAuthMethods: () => {
    console.log('not initialized');
  },
  getStoredAuthMethodsWithKeys: () => {
    console.log('not initialized');
  },
  getStoredEncryptedData: () => {
    console.log('not initialized');
  },
  clearAuthMethodSessions: () => {
    console.log('not initialized');
  },
  clearLitSessionItems: () => {
    console.log('not initialized');
  },

  // browser only
  browserHelper: null,

  collectAnalytics: true,
};
