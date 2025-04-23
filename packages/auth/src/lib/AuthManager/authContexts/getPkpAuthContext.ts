import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  AuthMethod,
  AuthSig,
  AuthenticationContext,
  LitResourceAbilityRequest,
} from '@lit-protocol/types';
import { Hex } from 'viem';

/**
 * Interface for parameters required to get the native auth context.
 */
interface GetNativeAuthContextParams {
  litNodeClient: LitNodeClient;
  identity: {
    pkpPublicKey: Hex;
    authMethods: AuthMethod[];
  };
  resources: LitResourceAbilityRequest[];
  capabilityAuthSigs?: AuthSig[];
  expiration?: string;
}

/**
 * Get the auth context for a Lit supported native auth method (eg. WebAuthn, Discord, Google).
 * This context is needed for requesting session signatures with PKP-based authentication.
 *
 * @param {GetNativeAuthContextParams} params - Parameters for getting the native auth context.
 * @returns {AuthenticationContext} The authentication context object.
 */
export const getPkpAuthContext = (
  params: GetNativeAuthContextParams
): AuthenticationContext => {
  const authContext = params.litNodeClient.getPkpAuthContext({
    pkpPublicKey: params.identity.pkpPublicKey,
    authMethods: params.identity.authMethods,
    expiration: params.expiration,
    resourceAbilityRequests: params.resources,
    capabilityAuthSigs: params.capabilityAuthSigs,
  });

  return authContext;
};
