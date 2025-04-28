import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { AuthSig, LitResourceAbilityRequest } from '@lit-protocol/types';
import { Hex } from 'viem';

export interface BaseIdentity {
  pkpPublicKey: Hex;
}

export interface BaseAuthMaterial {
  resources: LitResourceAbilityRequest[];
  expiration: string;
  statement?: string;
  capabilityAuthSigs?: AuthSig[];
  domain?: string;
}

/**
 * Any auth context type must implement this interface.
 */
export interface BaseAuthContextType<
  T extends BaseIdentity,
  M extends BaseAuthMaterial
> {
  identity: T;
  authMaterial: M;
}

export interface BaseBehaviour {
  /**
   * If you want to ask MetaMask to try and switch the user's chain, you may pass true here. This will only work if the user is using MetaMask, otherwise this will be ignored.
   */
  switchChain: boolean;
}
