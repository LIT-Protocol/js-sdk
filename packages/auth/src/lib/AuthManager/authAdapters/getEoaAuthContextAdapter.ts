import { Account } from 'viem';
import { z } from 'zod';
import {
  AuthManagerParams,
  BaseAuthContext,
  tryGetCachedAuthData,
} from '../auth-manager';
import { getEoaAuthContext } from '../authContexts/getEoaAuthContext';

/**
 * The EOA auth context adapter params.
 */
export interface EoaAuthContextAdapterParams
  extends BaseAuthContext<{
    account: Account;
  }> {}

export const getEoaAuthContextAdapter = async (
  upstreamParams: AuthManagerParams,
  params: EoaAuthContextAdapterParams
) => {
  // TODO: This is not typed - we have to fix this!
  const litClientCtx = await params.litClient.getContext();

  // Try to get LitAuthData from storage or generate a new one
  const authData = await tryGetCachedAuthData({
    storage: upstreamParams.storage,
    address: params.config.account.address,
    expiration: params.authConfig.expiration,
    type: 'EthWallet',
  });

  // now use the actual getEoaAuthContext
  // we don't really care how messy the params look like, this adapter function will massage them into the correct shape
  return getEoaAuthContext({
    authentication: {
      viemAccount: params.config.account,
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
