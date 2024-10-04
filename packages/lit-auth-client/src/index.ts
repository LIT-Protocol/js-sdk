import * as _LitAuthClient from './lib/lit-auth-client';
import { BaseProvider } from './lib/providers/BaseProvider';
import DiscordProvider from './lib/providers/DiscordProvider';
import EthWalletProvider from './lib/providers/EthWalletProvider';
import GoogleProvider from './lib/providers/GoogleProvider';
import AppleProvider from './lib/providers/AppleProvider';
import WebAuthnProvider from './lib/providers/WebAuthnProvider';
import { StytchOtpProvider } from './lib/providers/StytchOtpProvider';
import { isSignInRedirect, getProviderFromUrl } from './lib/utils';
import StytchAuthFactorOtpProvider from './lib/providers/StytchAuthFactorOtp';
import { LogLevel, LogManager } from '@lit-protocol/logger';
import { bootstrapLogger } from '@lit-protocol/misc';

declare global {
  var LitAuthClient: any; //eslint-disable-line no-var
}

const LitAuthClient = _LitAuthClient.LitAuthClient;
if (!globalThis.LitAuthClient) {
  globalThis.LitAuthClient = LitAuthClient;
}

const LOG_CATEGORY: string = "lit-auth-client";
export const logger = bootstrapLogger(LOG_CATEGORY, LogManager.Instance.level ?? LogLevel.OFF);


export * from './lib/lit-auth-client';

export {
  BaseProvider,
  DiscordProvider,
  EthWalletProvider,
  GoogleProvider,
  AppleProvider,
  WebAuthnProvider,
  StytchOtpProvider,
  StytchAuthFactorOtpProvider,
  isSignInRedirect,
  getProviderFromUrl,
};
