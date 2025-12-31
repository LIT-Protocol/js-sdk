import { AUTH_METHOD_TYPE } from '@lit-protocol/constants';
import { getChildLogger } from '@lit-protocol/logger';
import { AuthConfigSchema } from '@lit-protocol/schemas';
import { AuthSig, SessionKeyPair } from '@lit-protocol/types';
import { z } from 'zod';
import { AuthConfigV2 } from '../../authenticators/types';
import { LitAuthData } from '../../types';
import { AuthManagerParams } from '../auth-manager';
import {
  ExpectedAccountOrWalletClient,
  getEoaAuthContext,
} from '../authContexts/getEoaAuthContext';
import { processResources } from '../utils/processResources';
import { WalletClientAuthenticator } from '../../authenticators/WalletClientAuthenticator';
import { ViemAccountAuthenticator } from '../../authenticators/ViemAccountAuthenticator';

const _logger = getChildLogger({
  module: 'generateEoaDelegationAuthSig',
});

/**
 * Generates an EOA delegation auth signature for a given session key pair.
 * The EOA wallet will sign the session key delegation message directly.
 * This function is useful for server-side scenarios where you want to pre-generate
 * EOA session materials and reuse them across multiple requests.
 *
 * @param upstreamParams - Auth manager parameters including storage
 * @param params - Parameters for generating the EOA delegation signature
 * @returns The delegation auth signature (AuthSig) signed by the EOA wallet
 */
export async function generateEoaDelegationAuthSig(
  upstreamParams: AuthManagerParams,
  params: {
    account: ExpectedAccountOrWalletClient;
    sessionKeyPair: SessionKeyPair;
    authConfig: AuthConfigV2;
    litClient: {
      getContext: () => Promise<any>;
    };
  }
): Promise<AuthSig> {
  _logger.info(
    {
      hasAccount: !!params.account,
      hasSessionKeyPair: !!params.sessionKeyPair,
    },
    'generateEoaDelegationAuthSig: Starting EOA delegation signature generation'
  );

  const _resources = processResources(params.authConfig.resources);

  // Get network context from litClient for nonce
  const litClientCtx = await params.litClient.getContext();

  // Create a minimal LitAuthData structure with the provided session key pair
  const litAuthData: LitAuthData = {
    sessionKey: {
      keyPair: params.sessionKeyPair,
      expiresAt: params.authConfig.expiration!,
    },
    // For EOA, we use EthWallet as the auth method type
    authMethodType: AUTH_METHOD_TYPE.EthWallet,
  };

  // Determine the authenticator and address based on account type
  let authenticatorClass;
  let authenticatorAddress: string;
  if (
    'account' in params.account &&
    params.account.account?.type === 'json-rpc'
  ) {
    // WalletClient
    authenticatorClass = WalletClientAuthenticator;
    authenticatorAddress = params.account.account!.address;
  } else {
    // Viem Account
    authenticatorClass = ViemAccountAuthenticator;
    authenticatorAddress = (params.account as { address: string }).address;
  }

  // Create auth config for validation
  const authConfigForValidation = {
    ...params.authConfig,
    resources: _resources,
  };
  const validatedAuthConfig = AuthConfigSchema.parse(authConfigForValidation);

  // Call getEoaAuthContext which will generate the delegation signature
  const authContext = await getEoaAuthContext({
    authentication: {
      authenticator: authenticatorClass,
      account: params.account,
    },
    authConfig: validatedAuthConfig,
    deps: {
      nonce: litClientCtx.latestBlockhash,
      authData: litAuthData,
      storage: upstreamParams.storage,
      address: authenticatorAddress,
    },
  });

  // Get the delegation signature from the auth context
  const delegationAuthSig = await authContext.authNeededCallback();

  _logger.info(
    {
      hasSignature: !!delegationAuthSig,
    },
    'generateEoaDelegationAuthSig: EOA delegation signature generated successfully'
  );

  return delegationAuthSig as AuthSig;
}
