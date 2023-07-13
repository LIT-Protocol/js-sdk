import { EventEmitter } from 'stream';
import { Lit } from './lib/lit';
import { LitOptionsBuilder } from './lib/lit-options-builder';
import { OrNull, SignProps, Types } from './lib/types';
import {
  GoogleProvider,
  AppleProvider,
  DiscordProvider,
  EthWalletProvider,
  WebAuthnProvider,
  OtpProvider,
  LitAuthClient,
} from '@lit-protocol/lit-auth-client';
import { ProviderType } from '@lit-protocol/constants';
// import { ProviderType } from '@lit-protocol/constants';

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
    encrypt: Function;
    decrypt: Function;
    createAccount: Function;
    sign: Function;

    // auths
    auth: {
      google: OrNull<GoogleProvider>;
      apple: OrNull<AppleProvider>;
      discord: OrNull<DiscordProvider>;
      ethWallet: OrNull<EthWalletProvider>;
      webauthn: OrNull<WebAuthnProvider>;
      otp: OrNull<OtpProvider>;
    };
  };

  var ethereum: any;
}

// const appleProvider = authClient.getProvider('apple');
// const discordProvider = authClient.getProvider('discord');
// const ethWalletProvider = authClient.getProvider('ethwallet');
// const webauthnProvider = authClient.getProvider('webauthn');
// const otpProvider = authClient.getProvider('otp');

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
  createAccount: () => {
    console.log('not initialized');
  },
  sign: (options: SignProps) => {
    console.log('not initialized');
  },

  // auths
  auth: {
    google: null,
    apple: null,
    discord: null,
    ethWallet: null,
    webauthn: null,
    otp: null,
  },
};
