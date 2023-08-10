import { Lit, Lit as LitInstance } from './lib/lit';
import { LitOptionsBuilder } from './lib/lit-options-builder';
import { LitAuthMethod, OrNull, Types } from './lib/types';
import {
  GoogleProvider,
  AppleProvider,
  DiscordProvider,
  EthWalletProvider,
  WebAuthnProvider,
  OtpProvider,
} from '@lit-protocol/lit-auth-client';

import { LitStorage } from '@lit-protocol/lit-storage';
import { LitEmitter } from './lib/events/lit-emitter';
import { BrowserHelper } from './lib/browser-helper';
import { BaseIPFSProvider } from './lib/ipfs-provider/providers/BaseIPFSProvider';
import { waitForLit } from './lib/utils';

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
    getAccountSession: LitInstance['getAccountSession'] | Function;
    sign: LitInstance['sign'] | Function;

    // auths
    auth: {
      ethwallet: OrNull<EthWalletProvider>;
      webauthn: OrNull<WebAuthnProvider>;
      discord: OrNull<DiscordProvider>;
      google: OrNull<GoogleProvider>;
      otp: OrNull<OtpProvider>;
      apple: OrNull<AppleProvider>;
    };

    // utils
    getStoredAuthData: OrNull<Function>;
    getStoredEncryptedData: OrNull<Function>;
    clearSessions: OrNull<Function>;

    // browser only
    browserHelper: BrowserHelper | null;
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
  getAccountSession: () => {
    console.log('not initialized');
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
  getStoredAuthData: () => {
    console.log('not initialized');
  },
  getStoredEncryptedData: () => {
    console.log('not initialized');
  },
  clearSessions: () => {
    console.log('not initialized');
  },

  // browser only
  browserHelper: null,
};
