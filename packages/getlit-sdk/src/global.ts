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
    builder: OrNull<LitOptionsBuilder>;
    nodeClient: OrNull<Types.NodeClient>;
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

let authClient: LitAuthClient = new LitAuthClient({
  // redirectUri: window.location.href.replace(/\/+$/, ''),
  litRelayConfig: {
    relayApiKey: '67e55044-10b1-426f-9247-bb680e5fe0c8_relayer',
  },
});

const googleProvider = (
  authClient as LitAuthClient
).initProvider<GoogleProvider>(ProviderType.Google, {
  redirectUri: 'http://localhost:3000/redirect',
});

// const appleProvider = authClient.getProvider('apple');
// const discordProvider = authClient.getProvider('discord');
// const ethWalletProvider = authClient.getProvider('ethwallet');
// const webauthnProvider = authClient.getProvider('webauthn');
// const otpProvider = authClient.getProvider('otp');

// -- global "constructor" | APIs
globalThis.Lit = {
  builder: null,
  nodeClient: null,
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
    google: googleProvider,
    apple: null,
    discord: null,
    ethWallet: null,
    webauthn: null,
    otp: null,
  },
};
