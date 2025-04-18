import { generateSessionKeyPair } from '@lit-protocol/crypto';

import type { LitAuthStorageProvider } from './storage/types';
import type { LitAuthData } from './types';

interface LitAuthManagerConfig {
  storage: LitAuthStorageProvider;
}

async function tryGetCachedAuthData() {
  // Use `storage` to see if there is cached auth data
  // If error thrown trying to get it, error to caller or ??
}

async function tryGetAuthMethodFromAuthenticator() {
  // Use authenticator `getAuthMethod()` method to get a new auth method
}

function validateAuthData(authData: LitAuthData) {
  // Validate auth data is not expired, and is well-formed
}

async function signSessionKey({ storage }: LitAuthManagerConfig) {
  // Use LitNodeClient to signSessionKey with AuthData
}

export function getAuthManager({ storage }: LitAuthManagerConfig) {
  return {
    getAuthContext() {},
  };
}
