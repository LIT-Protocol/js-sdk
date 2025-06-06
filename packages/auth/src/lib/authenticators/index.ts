import { DiscordAuthenticator } from './native/DiscordAuthenticator';
import { GoogleAuthenticator } from './native/GoogleAuthenticator';

import {
  isSignInRedirect,
  getProviderFromUrl,
  getAuthIdByAuthMethod,
} from './helper/utils';
import { WebAuthnAuthenticator } from './native/WebAuthnAuthenticator';

export {
  DiscordAuthenticator,
  GoogleAuthenticator,
  WebAuthnAuthenticator,
  isSignInRedirect,
  getProviderFromUrl,
  getAuthIdByAuthMethod,
};

export type LitAuthAuthenticator =
  | typeof WebAuthnAuthenticator
  | typeof DiscordAuthenticator;
