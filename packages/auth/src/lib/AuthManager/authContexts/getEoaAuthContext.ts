import { GetWalletClientReturnType } from '@wagmi/core';
import {
  Account,
  getAddress,
  keccak256,
  PrivateKeyAccount,
  stringToBytes,
  WalletClient,
} from 'viem';
import { z } from 'zod';
import { createSiweMessageWithResources } from '@lit-protocol/auth-helpers';
import { AUTH_METHOD_TYPE } from '@lit-protocol/constants';
import {
  AuthConfigSchema,
  EoaAuthContextSchema,
  SessionKeyUriSchema,
} from '@lit-protocol/schemas';
import { AuthSig } from '@lit-protocol/types';
import { ViemAccountAuthenticator } from '../../authenticators/ViemAccountAuthenticator';
import { WalletClientAuthenticator } from '../../authenticators/WalletClientAuthenticator';
import { LitAuthStorageProvider } from '../../storage';
import { LitAuthDataSchema } from '../../types';
import { tryGetCachedDelegationAuthSig } from '../try-getters/tryGetCachedDelegationAuthSig';

export type ExpectedAccountOrWalletClient =
  | Account
  | WalletClient
  | GetWalletClientReturnType
  | PrivateKeyAccount;

const EoaAuthenticationSchema = z.object({
  authenticator: z.custom<
    typeof ViemAccountAuthenticator | typeof WalletClientAuthenticator
  >(),
  account: z.custom<ExpectedAccountOrWalletClient>(),
});

export const GetEoaAuthContextSchema = z.object({
  authentication: EoaAuthenticationSchema,
  authConfig: AuthConfigSchema,
  deps: z.object({
    nonce: z.string(),
    authData: LitAuthDataSchema,
    storage: z.custom<LitAuthStorageProvider>(),
    address: z.string(),
  }),
  cache: z
    .object({
      delegationAuthSig: z.boolean().optional(),
    })
    .optional(),
});

export const getEoaAuthContext = async (
  params: z.infer<typeof GetEoaAuthContextSchema>
): Promise<z.infer<typeof EoaAuthContextSchema>> => {
  const _params = params;

  const _sessionKeyPair = _params.deps.authData.sessionKey.keyPair;

  // This will either be the Viem account or the WalletClient account
  let walletAddressForSiwe: string;
  if ('address' in _params.authentication.account) {
    walletAddressForSiwe = _params.authentication.account.address;
  } else if (_params.authentication.account.account?.address) {
    walletAddressForSiwe = _params.authentication.account.account.address;
  } else {
    throw new Error('Could not determine wallet address from account object');
  }

  const toSign = await createSiweMessageWithResources({
    uri: SessionKeyUriSchema.parse(_sessionKeyPair.publicKey),
    statement: _params.authConfig.statement,
    domain: _params.authConfig.domain,
    expiration: _params.authConfig.expiration,
    resources: _params.authConfig.resources,
    walletAddress: walletAddressForSiwe,
    nonce: _params.deps.nonce,
  });

  // Use tryGetCachedDelegationAuthSig to cache AuthSig in localStorage like PKP flow
  const authSig: AuthSig = await tryGetCachedDelegationAuthSig({
    cache: _params.cache?.delegationAuthSig,
    storage: _params.deps.storage,
    address: _params.deps.address,
    expiration: _params.authConfig.expiration,
    signSessionKey: async () => {
      const authDataResult =
        await _params.authentication.authenticator.authenticate(
          _params.authentication.account as any,
          toSign
        );
      // Reuse the AuthSig generated during authenticate to avoid a second signature
      try {
        return JSON.parse(authDataResult.accessToken) as AuthSig;
      } catch {
        return await _params.authentication.authenticator.createAuthSig(
          _params.authentication.account as any,
          toSign
        );
      }
    },
  });

  const checksumAddress = getAddress(authSig.address);
  const messageBytes = stringToBytes(`${checksumAddress}:lit`);
  const authMethodId = keccak256(messageBytes);

  const authData = {
    authMethodType: AUTH_METHOD_TYPE.EthWallet,
    accessToken: JSON.stringify(authSig),
    authMethodId,
  };

  return EoaAuthContextSchema.parse({
    account: _params.authentication.account,
    authenticator: _params.authentication.authenticator,
    authData,
    authNeededCallback: async () => {
      return authSig;
    },
    sessionKeyPair: _sessionKeyPair,
    authConfig: _params.authConfig,
  });
};
