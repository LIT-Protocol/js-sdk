import { EventEmitter } from 'stream';
import { Lit } from './lib/lit';
import { LitOptionsBuilder } from './lib/lit-options-builder';
import {
  LitAuthMethodOptions,
  OrNull,
  PKPInfo,
  SignProps,
  Types,
} from './lib/types';
import {
  GoogleProvider,
  AppleProvider,
  DiscordProvider,
  EthWalletProvider,
  WebAuthnProvider,
  OtpProvider,
} from '@lit-protocol/lit-auth-client';

declare global {
  var Lit: {
    // clients
    nodeClient: OrNull<Types.NodeClient>;
    authClient: OrNull<Types.AuthClient>;

    // getlit sdk
    builder: OrNull<LitOptionsBuilder>;
    debug: boolean;
    ready: boolean;
    events: OrNull<EventEmitter>;

    // Lit class instance
    instance: OrNull<Lit>;

    // Lit class methods
    encrypt: Lit['encrypt'];
    decrypt: Lit['decrypt'];
    createAccount: Lit['createAccount'];
    sign: Lit['sign'] | Function;

    // auths
    auth: {
      ethwallet: OrNull<EthWalletProvider>;
      webauthn: OrNull<WebAuthnProvider>;
      discord: OrNull<DiscordProvider>;
      google: OrNull<GoogleProvider>;
      otp: OrNull<OtpProvider>;
      apple: OrNull<AppleProvider>;
    };
  };

  var ethereum: any;
}

// -- global "constructor" | APIs
globalThis.Lit = {
  // clients
  nodeClient: null,
  authClient: null,

  // getlit sdk
  builder: null,
  debug: true,
  ready: false,
  events: null,

  // Lit class instance
  instance: null,

  // Lit class methods
  encrypt: () => {
    console.log('not initialized');
  },
  decrypt: () => {
    console.log('not initialized');
  },
  createAccount: async () => {
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
};
