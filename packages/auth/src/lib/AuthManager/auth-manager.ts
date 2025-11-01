import { getChildLogger } from '@lit-protocol/logger';
import type { LitClient } from '@lit-protocol/lit-client';
import { AuthData, HexPrefixedSchema } from '@lit-protocol/schemas';
import { AuthSig, SessionKeyPair } from '@lit-protocol/types';
import { z } from 'zod';
import { AuthConfigV2 } from '../authenticators/types';
import type { LitAuthStorageProvider } from '../storage/types';
import {
  EoaAuthContextAdapterParams,
  getEoaAuthContextAdapter,
} from './authAdapters/getEoaAuthContextAdapter';
import { getPkpAuthContextAdapter } from './authAdapters/getPkpAuthContextAdapter';
import { AuthConfigSchema } from './authContexts/BaseAuthContextType';
import { getCustomAuthContextAdapter } from './authAdapters/getCustomAuthContextAdapter';
import { generatePkpDelegationAuthSig } from './authAdapters/generatePkpDelegationAuthSig';
import { generateEoaDelegationAuthSig } from './authAdapters/generateEoaDelegationAuthSig';
import { getPkpAuthContextFromPreGeneratedAdapter } from './authAdapters/getPkpAuthContextFromPreGeneratedAdapter';
import type { PkpSessionSigsProduct } from './authAdapters/getPkpSessionSigsAdapter';
import { getPkpSessionSigsAdapter } from './authAdapters/getPkpSessionSigsAdapter';

export interface AuthManagerParams {
  storage: LitAuthStorageProvider;
}

const _logger = getChildLogger({
  module: 'auth-manager',
});

/**
 * The auth context that both EOA and PKP auth contexts have in common.
 */
export interface BaseAuthContext<T> {
  // authenticator: LitAuthAuthenticator;
  authConfig: z.infer<typeof AuthConfigSchema>;
  config: T;

  litClient: LitClient;
}

/**
 * Defines the base structure for PKP Auth Context Adapter parameters,
 * excluding the parts that vary by authenticator.
 */
export interface BasePkpAuthContextAdapterParams {
  authConfig: AuthConfig;
  litClient: BaseAuthContext<any>['litClient'];
}

// async function tryGetAuthMethodFromAuthenticator() {
//   // Use authenticator `getAuthMethod()` method to get a new auth method
// }

// function validateAuthData(authData: LitAuthData) {
//   // Validate auth data is not expired, and is well-formed
// }

// @deprecated - use AuthConfigV2 instead
export type AuthConfig = z.infer<typeof AuthConfigSchema>;

export type ConstructorConfig<T> = T extends new (config: infer C) => any
  ? C
  : never;

export const createAuthManager = (authManagerParams: AuthManagerParams) => {
  return {
    /**
     * A migration helper to create session sigs for wrapped keys and datil v7
     */
    createPkpSessionSigs: async (params: {
      pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
      litClient: BaseAuthContext<any>['litClient'];
      sessionKeyPair: SessionKeyPair;
      delegationAuthSig: AuthSig;
      product?: PkpSessionSigsProduct;
    }) => {
      return getPkpSessionSigsAdapter(authManagerParams, params);
    },
    createEoaAuthContext: (params: EoaAuthContextAdapterParams) => {
      return getEoaAuthContextAdapter(authManagerParams, params);
    },
    createPkpAuthContext: (params: {
      authData: AuthData;
      pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
      authConfig: AuthConfigV2;
      litClient: BaseAuthContext<any>['litClient'];
      cache?: {
        delegationAuthSig?: boolean;
      };
      sessionKeyPair?: SessionKeyPair;
      delegationAuthSig?: AuthSig;
    }) => {
      return getPkpAuthContextAdapter(authManagerParams, params);
    },
    createPkpAuthContextFromPreGenerated: (params: {
      pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
      sessionKeyPair: SessionKeyPair;
      delegationAuthSig: AuthSig;
      authData?: AuthData;
    }) => {
      return getPkpAuthContextFromPreGeneratedAdapter(params);
    },
    createCustomAuthContext: (params: {
      // authData: AuthData;
      pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
      authConfig: AuthConfigV2;
      litClient: BaseAuthContext<any>['litClient'];

      // custom auth params
      customAuthParams: {
        litActionCode?: string;
        litActionIpfsId?: string;
        jsParams?: Record<string, any>;
      };
    }) => {
      // make jsParams nested inside jsParams so that
      // the dev can check all variables inside an object in Lit action
      params.customAuthParams.jsParams = {
        jsParams: params.customAuthParams.jsParams,
      };

      return getCustomAuthContextAdapter(authManagerParams, params);
    },
    generatePkpDelegationAuthSig: (params: {
      pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
      authData: AuthData;
      sessionKeyPair: SessionKeyPair;
      authConfig: AuthConfigV2;
      litClient: BaseAuthContext<any>['litClient'];
    }) => {
      return generatePkpDelegationAuthSig(authManagerParams, params);
    },
    generateEoaDelegationAuthSig: (params: {
      account: any; // ExpectedAccountOrWalletClient type
      sessionKeyPair: SessionKeyPair;
      authConfig: AuthConfigV2;
      litClient: BaseAuthContext<any>['litClient'];
    }) => {
      return generateEoaDelegationAuthSig(authManagerParams, params);
    },
  };
};
