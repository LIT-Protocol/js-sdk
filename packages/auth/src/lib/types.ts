import { AUTH_METHOD_TYPE } from '@lit-protocol/constants';

export interface LitAuthData {
  sessionKey: {
    keyPair: `${string}`;
    expiresAt: number;
  };

  // result of authenticator
  authMethod: keyof typeof AUTH_METHOD_TYPE;
}
