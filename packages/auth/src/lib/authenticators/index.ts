import { LitRelay } from '../relay';
import { AppleAuthenticator } from './AppleAuthenticator';
import { DiscordAuthenticator } from './DiscordAuthenticator';
import { GoogleAuthenticator } from './GoogleAuthenticator';
import { MetamaskAuthenticator } from './metamask';
import {
  StytchOtpAuthenticator,
  StytchAuthFactorOtpAuthenticator,
} from './stytch';
import {
  isSignInRedirect,
  getProviderFromUrl,
  getAuthIdByAuthMethod,
} from './utils';
import { WebAuthnAuthenticator } from './WebAuthnAuthenticator';

export {
  AppleAuthenticator,
  DiscordAuthenticator,
  MetamaskAuthenticator,
  GoogleAuthenticator,
  StytchAuthFactorOtpAuthenticator,
  StytchOtpAuthenticator,
  WebAuthnAuthenticator,
  isSignInRedirect,
  getProviderFromUrl,
  getAuthIdByAuthMethod,
  LitRelay,
};
