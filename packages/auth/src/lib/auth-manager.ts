import { nacl } from '@lit-protocol/nacl';
import { SessionKeyPair } from '@lit-protocol/types';
import { uint8arrayToString } from '@lit-protocol/uint8arrays';

import type { LitAuthStorageProvider } from './storage/types';
import type { LitAuthData } from '@lit-protocol/auth';

interface LitAuthManagerConfig {
  storage: LitAuthStorageProvider;
}

function generateSessionKeyPair(): SessionKeyPair {
  const keyPair = nacl.sign.keyPair();

  return {
    publicKey: uint8arrayToString(keyPair.publicKey, 'base16'),
    secretKey: uint8arrayToString(keyPair.secretKey, 'base16'),
  };
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
