import * as _LitAuthClient from './lib/lit-auth-client';
import { BaseProvider } from './lib/providers/BaseProvider';
import DiscordProvider from './lib/providers/DiscordProvider';
import EthWalletProvider from './lib/providers/EthWalletProvider';
import GoogleProvider from './lib/providers/GoogleProvider';
import AppleProvider from './lib/providers/AppleProvider';
import WebAuthnProvider from './lib/providers/WebAuthnProvider';
import { isSignInRedirect, getProviderFromUrl } from './lib/utils';

declare global {
  var LitAuthClient: any; //eslint-disable-line no-var
}

const LitAuthClient = _LitAuthClient.LitAuthClient;
if (!globalThis.LitAuthClient) {
  globalThis.LitAuthClient = LitAuthClient;
}

export * from './lib/lit-auth-client';

export {
  BaseProvider,
  DiscordProvider,
  EthWalletProvider,
  GoogleProvider,
  AppleProvider,
  WebAuthnProvider,
  isSignInRedirect,
  getProviderFromUrl,
};
