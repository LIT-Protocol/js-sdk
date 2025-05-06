import { SignerSchema } from '@lit-protocol/schemas';
import { z } from 'zod';
import {
  AuthManagerParams,
  BaseAuthContext,
  tryGetCachedAuthData,
} from '../auth-manager';
import { getEoaAuthContext } from '../authContexts/getEoaAuthContext';

export const EoaAuthDepsSchema = z.object({
  nonce: z.any(),
  // currentEpoch: no need for EOA
  // getSignSessionKey: no need for EOA
});

/**
 * The EOA auth context adapter params.
 */
export interface EoaAuthContextAdapterParams
  extends BaseAuthContext<{
    pkpPublicKey: string;
    signer: z.infer<typeof SignerSchema>;
  }> {}

export const getEoaAuthContextAdapter = async (
  upstreamParams: AuthManagerParams,
  params: EoaAuthContextAdapterParams
) => {
  const litClientConfig = EoaAuthDepsSchema.parse({
    nonce: await params.litClient.getLatestBlockhash(),
  });

  // Try to get LitAuthData from storage or generate a new one
  const authData = await tryGetCachedAuthData({
    storage: upstreamParams.storage,
    address: await params.config.signer.getAddress(),
    expiration: params.authConfig.expiration,
    type: 'EthWallet',
  });

  console.log('getEoaAuthContextAdapter - authData:', authData);

  // now use the actual getEoaAuthContext
  // we don't really care how messy the params look like, this adapter function will massage them into the correct shape
  return getEoaAuthContext({
    authentication: {
      pkpPublicKey: params.config.pkpPublicKey,
      signer: params.config.signer,
      signerAddress: await params.config.signer.getAddress(),
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
      nonce: litClientConfig.nonce,
    },
  });
};
