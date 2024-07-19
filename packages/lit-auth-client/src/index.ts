// import * as _LitAuthClient from './lib/lit-auth-client';
import AppleProvider from './lib/providers/AppleProvider';
import { BaseProvider } from './lib/providers/BaseProvider';
import DiscordProvider from './lib/providers/DiscordProvider';
import EthWalletProvider from './lib/providers/EthWalletProvider';
import GoogleProvider from './lib/providers/GoogleProvider';
import StytchAuthFactorOtpProvider from './lib/providers/StytchAuthFactorOtp';
import { StytchOtpProvider } from './lib/providers/StytchOtpProvider';
import WebAuthnProvider from './lib/providers/WebAuthnProvider';
import { LitRelay } from './lib/relay';
import { isSignInRedirect, getProviderFromUrl } from './lib/utils';

// declare global {
//   var LitAuthClient: any; //eslint-disable-line no-var
// }

// const LitAuthClient = _LitAuthClient.LitAuthClient;
// if (!globalThis.LitAuthClient) {
//   globalThis.LitAuthClient = LitAuthClient;
// }

// export * from './lib/lit-auth-client';

export {
  AppleProvider,
  BaseProvider,
  DiscordProvider,
  EthWalletProvider,
  GoogleProvider,
  LitRelay,
  StytchOtpProvider,
  StytchAuthFactorOtpProvider,
  WebAuthnProvider,
  isSignInRedirect,
  getProviderFromUrl,
};
