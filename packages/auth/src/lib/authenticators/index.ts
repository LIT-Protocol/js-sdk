import { LitRelay } from '../relay';
import { AppleAuthenticator } from './AppleAuthenticator';
import { DiscordAuthenticator } from './DiscordAuthenticator';
import { GoogleAuthenticator } from './GoogleAuthenticator';
import { EOAAuthenticator } from './metamask';
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
  EOAAuthenticator,
  GoogleAuthenticator,
  StytchAuthFactorOtpAuthenticator,
  StytchOtpAuthenticator,
  WebAuthnAuthenticator,
  isSignInRedirect,
  getProviderFromUrl,
  getAuthIdByAuthMethod,
  LitRelay,
};

export type LitAuthAuthenticators =
  | EOAAuthenticator
  | StytchOtpAuthenticator
  | WebAuthnAuthenticator
  | AppleAuthenticator
  | DiscordAuthenticator;
