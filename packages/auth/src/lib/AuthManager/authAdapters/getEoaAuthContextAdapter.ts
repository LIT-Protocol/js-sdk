import { AUTH_METHOD_TYPE } from '@lit-protocol/constants';
import { AuthConfigSchema } from '@lit-protocol/schemas';
import { Account, WalletClient } from 'viem';
import { AuthConfigV2 } from '../../authenticators/types';
import { getViemAccountAuthenticator } from '../../authenticators/ViemAccountAuthenticator';
import { getWalletClientAuthenticator } from '../../authenticators/WalletClientAuthenticator';
import { AuthManagerParams, tryGetCachedAuthData } from '../auth-manager';
import {
  ExpectedAccountOrWalletClient,
  getEoaAuthContext,
} from '../authContexts/getEoaAuthContext';
import { processResources } from '../utils/processResources';

/**
 * The EOA auth context adapter params.
 */
export interface EoaAuthContextAdapterParams {
  authConfig: AuthConfigV2;
  config: {
    account: ExpectedAccountOrWalletClient;
  };
  // @ts-expect-error - LitClientType is not defined in the package. We need to define this
  // once the LitClienType is ready
  litClient: ReturnType<typeof createLitClient>;
}

/**
 * This check verifies two main things:
 * 1. `account` has a property named `account` (typical for Viem's WalletClient structure
 *    when an account is associated).
 * 2. The associated `account.account` (which should be a Viem Account object)
 *    has `type === 'json-rpc'`, indicating it's managed by a JSON-RPC provider
 *    (e.g., a browser extension like MetaMask).
 */
const isWalletClient = (
  account: ExpectedAccountOrWalletClient
): account is WalletClient => {
  return 'account' in account && account.account?.type === 'json-rpc';
};

export const getEoaAuthContextAdapter = async (
  upstreamParams: AuthManagerParams,
  params: EoaAuthContextAdapterParams
) => {
  // TODO: This is not typed - we have to fix this!
  const litClientCtx = await params.litClient.getContext();

  let processedResources = processResources(params.authConfig.resources);
  // Construct a validated AuthConfig object for internal use, ensuring defaults are applied
  // and the structure (especially transformed resources) is correct.
  const authConfigForValidation = {
    ...params.authConfig,
    resources: processedResources, // Use the processed (transformed or original) resources
  };

  // Validate the entire AuthConfig object after potential transformation of resources.
  // AuthConfigSchema expects resources to be in the full, structured format.
  const validatedAuthConfig = AuthConfigSchema.parse(authConfigForValidation);

  let authenticator:
    | ReturnType<typeof getViemAccountAuthenticator>
    | ReturnType<typeof getWalletClientAuthenticator>;

  if (isWalletClient(params.config.account)) {
    const walletClient = params.config.account as WalletClient;
    authenticator = getWalletClientAuthenticator({ account: walletClient });
  } else {
    const viemAccount = params.config.account as Account;
    authenticator = getViemAccountAuthenticator({ account: viemAccount });
  }

  // Try to get LitAuthData from storage or generate a new one
  const authData = await tryGetCachedAuthData({
    storage: upstreamParams.storage,
    address: authenticator.address,
    expiration: params.authConfig.expiration,
    type: AUTH_METHOD_TYPE.EthWallet,
  });

  // now use the actual getEoaAuthContext
  // we don't really care how messy the params look like, this adapter function will massage them into the correct shape
  return getEoaAuthContext({
    authentication: {
      authenticator: authenticator,
      account: params.config.account,
    },
    authConfig: {
      domain: validatedAuthConfig.domain,
      resources: validatedAuthConfig.resources,
      capabilityAuthSigs: validatedAuthConfig.capabilityAuthSigs,
      expiration: validatedAuthConfig.expiration,
      statement: validatedAuthConfig.statement,
    },
    deps: {
      authData: authData,
      nonce: litClientCtx.latestBlockhash,
    },
  });
};
