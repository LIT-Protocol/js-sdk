import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { AuthSig, LitResourceAbilityRequest } from '@lit-protocol/types';

export interface BaseIdentity {
  pkpPublicKey: string;
}

/**
 * Any auth context type must implement this interface.
 */
export interface BaseAuthContextType<T extends BaseIdentity> {
  litNodeClient: LitNodeClient;
  resources: LitResourceAbilityRequest[];
  capabilityAuthSigs?: AuthSig[];
  identity: T;
}
