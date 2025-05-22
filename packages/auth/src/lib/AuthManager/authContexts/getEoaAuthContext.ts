import { createSiweMessageWithResources } from '@lit-protocol/auth-helpers';
import {
  AuthData,
  EoaAuthContextSchema,
  SessionKeyUriSchema,
} from '@lit-protocol/schemas';
import { AuthSig } from '@lit-protocol/types';
import { GetWalletClientReturnType } from '@wagmi/core';
import { Account, WalletClient } from 'viem';
import { z } from 'zod';
import { ViemAccountAuthenticator } from '../../authenticators/ViemAccountAuthenticator';
import { WalletClientAuthenticator } from '../../authenticators/WalletClientAuthenticator';
import { LitAuthData } from '../../types';
import { AuthConfigSchema } from './BaseAuthContextType';

export type ExpectedAccountOrWalletClient =
  | Account
  | WalletClient
  | GetWalletClientReturnType;

interface GetEoaAuthContextParams {
  authentication: {
    authenticator:
      | typeof ViemAccountAuthenticator
      | typeof WalletClientAuthenticator;
    account: ExpectedAccountOrWalletClient;
  };
  authConfig: z.infer<typeof AuthConfigSchema>;
  deps: {
    nonce: string;
    authData: LitAuthData;
  };
}

export const getEoaAuthContext = async (
  params: GetEoaAuthContextParams
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

  const authData = await _params.authentication.authenticator.authenticate(
    _params.authentication.account as any,
    toSign
  );

  // const authMethodId = await _params.authentication.authenticator.authMethodId(
  //   authMethod
  // );

  // const authData: AuthData = {
  //   ...authMethod,
  //   authMethodId,
  // };

  const authSig: AuthSig =
    await _params.authentication.authenticator.createAuthSig(
      _params.authentication.account as any,
      toSign
    );

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
