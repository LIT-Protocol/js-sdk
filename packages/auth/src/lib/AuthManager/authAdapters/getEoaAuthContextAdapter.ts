import { z } from 'zod';
import {
  AuthManagerParams,
  BaseAuthContext,
  tryGetCachedAuthData,
} from '../auth-manager';
import { ExpectedAccountOrWalletClient, getEoaAuthContext } from '../authContexts/getEoaAuthContext';
import { AuthConfigSchema } from '@lit-protocol/schemas';
import { GetWalletClientReturnType } from '@wagmi/core';
import { Account, createWalletClient, http, WalletClient } from 'viem';
import { getViemAccountAuthenticator, getWalletClientAuthenticator } from '../../authenticators/ViemAccountAuthenticator';

// const normaliseViemAccount = (accountOrWalletClient: ExpectedAccountOrWalletClient) => {
//   if ('account' in accountOrWalletClient && accountOrWalletClient.account?.type === 'json-rpc') {
//     return {
//       ...accountOrWalletClient,
//       address: accountOrWalletClient.account.address,
//     };
//   }
//   return accountOrWalletClient;
// };

/**
 * The EOA auth context adapter params.
 */
export interface EoaAuthContextAdapterParams {
  authConfig: z.infer<typeof AuthConfigSchema>;
  config: {
    account: ExpectedAccountOrWalletClient,
  },
  // @ts-expect-error - LitClientType is not defined in the package. We need to define this
  // once the LitClienType is ready
  litClient: ReturnType<typeof createLitClient>;
}

export const getEoaAuthContextAdapter = async (
  upstreamParams: AuthManagerParams,
  params: EoaAuthContextAdapterParams
) => {
  // TODO: This is not typed - we have to fix this!
  const litClientCtx = await params.litClient.getContext();

  let authenticator: ReturnType<typeof getViemAccountAuthenticator> | ReturnType<typeof getWalletClientAuthenticator>;

  if ('account' in params.config.account && params.config.account.account?.type === 'json-rpc') {
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
    type: 'EthWallet',
  });

  // now use the actual getEoaAuthContext
  // we don't really care how messy the params look like, this adapter function will massage them into the correct shape
  return getEoaAuthContext({
    authentication: {
      authenticator: authenticator,
      account: params.config.account,
    },
    authConfig: {
      domain: params.authConfig.domain,
      resources: params.authConfig.resources,
      capabilityAuthSigs: params.authConfig.capabilityAuthSigs,
      expiration: params.authConfig.expiration,
      statement: params.authConfig.statement,
    },
    deps: {
      authData: authData,
      nonce: litClientCtx.latestBlockhash,
    },
  });
};
