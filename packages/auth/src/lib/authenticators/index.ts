import { AppleAuthenticator } from './AppleAuthenticator';
import { DiscordAuthenticator } from './DiscordAuthenticator';
import { EthWalletAuthenticator } from './EthWalletAuthenticator';
import { GoogleAuthenticator } from './GoogleAuthenticator';
import { LitRelay } from '../relay';
import { StytchAuthFactorOtpAuthenticator } from './stytch/StytchAuthFactorOtpAuthenticator';
import { StytchOtpAuthenticator } from './stytch/StytchOtpAuthenticator';
import {
  isSignInRedirect,
  getProviderFromUrl,
  getAuthIdByAuthMethod,
} from './utils';
import { WebAuthnAuthenticator } from './WebAuthnAuthenticator';

export {
  LitRelay,
  AppleAuthenticator,
  DiscordAuthenticator,
  EthWalletAuthenticator,
  GoogleAuthenticator,
  StytchAuthFactorOtpAuthenticator,
  StytchOtpAuthenticator,
  WebAuthnAuthenticator,
  isSignInRedirect,
  getProviderFromUrl,
  getAuthIdByAuthMethod,
};
