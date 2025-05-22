import { LitRelay } from '../relay';
import { DiscordAuthenticator } from './native/DiscordAuthenticator';
import { GoogleAuthenticator } from './native/GoogleAuthenticator';
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
import { WebAuthnAuthenticator } from './native/WebAuthnAuthenticator';

export {
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

export type LitAuthAuthenticator =
  | typeof EOAAuthenticator
  | typeof StytchOtpAuthenticator
  | typeof WebAuthnAuthenticator
  | typeof DiscordAuthenticator;
