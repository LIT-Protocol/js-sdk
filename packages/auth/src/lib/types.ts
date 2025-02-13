import { AUTH_METHOD_TYPE } from '@lit-protocol/constants';

export interface LitAuthData {
  credential: string;
  authMethod: keyof typeof AUTH_METHOD_TYPE;
}
