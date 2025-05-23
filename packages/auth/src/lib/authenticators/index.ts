import { DiscordAuthenticator } from './native/DiscordAuthenticator';
import { GoogleAuthenticator } from './native/GoogleAuthenticator';
import { EOAAuthenticator } from './metamask';

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
  WebAuthnAuthenticator,
  isSignInRedirect,
  getProviderFromUrl,
  getAuthIdByAuthMethod,
};

export type LitAuthAuthenticator =
  | typeof EOAAuthenticator
  | typeof WebAuthnAuthenticator
  | typeof DiscordAuthenticator;
