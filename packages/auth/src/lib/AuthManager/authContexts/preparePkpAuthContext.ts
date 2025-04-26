import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  AuthCallbackParams,
  AuthMethod,
  AuthSig,
  LitResourceAbilityRequest,
} from '@lit-protocol/types';
import { Hex } from 'viem';
import { BaseAuthContextType, BaseIdentity } from './BaseAuthContextType';
import { AuthMethodSchema, SessionKeyPairSchema } from '@lit-protocol/schemas';
import { z } from 'zod';

interface PkpIdentity extends BaseIdentity {
  authMethods: z.infer<typeof AuthMethodSchema>[];
  expiration: string;
  sessionKey: z.infer<typeof SessionKeyPairSchema>;
}

/**
 * Interface for parameters required to get the native auth context.
 */
export interface PreparePkpAuthContextParams
  extends BaseAuthContextType<PkpIdentity> {
  identity: PkpIdentity;

  /**
   * The following are dependencies that were used to be provided by the litNodeClient
   */
  deps: {
    litNodeClient: LitNodeClient;
  };
}

// always take a provider
/**
 * Get the auth context for a Lit supported native auth method (eg. WebAuthn, Discord, Google).
 * This context is needed for requesting session signatures with PKP-based authentication.
 *
 * @param {PreparePkpAuthContextParams} params - Parameters for getting the native auth context.
 */
export const preparePkpAuthContext = (params: PreparePkpAuthContextParams) => {
  return {
    chain: 'ethereum', // TODO: make this dynamic
    pkpPublicKey: params.identity.pkpPublicKey,
    resourceAbilityRequests: params.resources,
    capabilityAuthSigs: params.capabilityAuthSigs,
    authMethods: params.identity.authMethods,
    expiration: params.identity.expiration,
    sessionKey: params.identity.sessionKey,
    authNeededCallback: async (props: AuthCallbackParams) => {
      const response = await params.deps.litNodeClient.signSessionKey({
        sessionKey: params.identity.sessionKey,
        statement: 'some custom statement', // TODO: make this dynamic
        authMethods: params.identity.authMethods,
        pkpPublicKey: params.identity.pkpPublicKey,
        expiration: params.identity.expiration,
        resourceAbilityRequests: params.resources,
        chainId: 1,
      });

      return response.authSig;
    },
  };
};
