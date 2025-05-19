import { createSiweMessageWithResources } from '@lit-protocol/auth-helpers';
import {
  EoaAuthContextSchema,
  SessionKeyUriSchema,
} from '@lit-protocol/schemas';
import { Account, WalletClient } from 'viem';
import { z } from 'zod';
import { getViemAccountAuthenticator, getWalletClientAuthenticator } from '../../authenticators/ViemAccountAuthenticator';
import { LitAuthData, LitAuthDataSchema } from '../../types';
import { AuthConfigSchema } from './BaseAuthContextType';
import { GetWalletClientReturnType } from '@wagmi/core';

export type ExpectedAccountOrWalletClient =
  | Account
  | WalletClient
  | GetWalletClientReturnType;

// Define specific Authentication schema for EOA
// export const EoaAuthenticationSchema = z.object({
//   viemAccount: z.custom<ExpectedAccountOrWalletClient>(),
// });

// export const GetEoaAuthContextSchema = z.object({
//   authentication: EoaAuthenticationSchema,
//   authConfig: AuthConfigSchema,
//   deps: z.object({
//     nonce: z.string(),
//     authData: LitAuthDataSchema,
//   }),
// });

interface GetEoaAuthContextParams {
  authentication: {
    authenticator: ReturnType<typeof getViemAccountAuthenticator> | ReturnType<typeof getWalletClientAuthenticator>,
    account: ExpectedAccountOrWalletClient,
  },
  authConfig: z.infer<typeof AuthConfigSchema>,
  deps: {
    nonce: string,
    authData: LitAuthData
  }
}

export const getEoaAuthContext = async (
  params: GetEoaAuthContextParams,
): Promise<z.infer<typeof EoaAuthContextSchema>> => {
  // -- validate params
  // const _params = GetEoaAuthContextSchema.parse(params);
  const _params = params;

  const _sessionKeyPair = _params.deps.authData.sessionKey.keyPair;

  // const authenticator = getViemAccountAuthenticator({
  //   account: params.authentication.viemAccount,
  // });

  let walletAddress: string | undefined;
  let accountType: 'walletClient' | 'account' = 'account';

  // if ('account' in _params.authentication.viemAccount && _params.authentication.viemAccount.account?.type === 'json-rpc') {
  //   const walletClient = _params.authentication.viemAccount as WalletClient;
  //   walletAddress = walletClient.account?.address;
  //   accountType = 'walletClient';
  // } else if ('address' in _params.authentication.viemAccount) {
  //   walletAddress = _params.authentication.viemAccount.address;
  // }

  // if (!walletAddress) {
  //   throw new Error('Wallet address not found');
  // }

  const toSign = await createSiweMessageWithResources({
    uri: SessionKeyUriSchema.parse(_sessionKeyPair.publicKey),
    statement: _params.authConfig.statement,
    domain: _params.authConfig.domain,
    expiration: _params.authConfig.expiration,
    resources: _params.authConfig.resources,
    walletAddress: _params.authentication.authenticator.address,
    nonce: _params.deps.nonce,
  });

  console.log('🔥🔥🔥toSign:', toSign);

  const authMethod = await _params.authentication.authenticator.authenticate(toSign);
  console.log('🔥🔥🔥authMethod:', authMethod);

  return {
    // accountType: _params.authentication.authenticator.type,
    // viemAccount: _params.authentication.viemAccount,
    account: _params.authentication.account,
    authenticator: _params.authentication.authenticator,
    authMethod,
    authNeededCallback: async () => {
      return params.authentication.authenticator.getAuthSig(toSign);
    },
    sessionKeyPair: _sessionKeyPair,
    authConfig: _params.authConfig,
  };
};
