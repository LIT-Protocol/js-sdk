import { createSiweMessageWithResources } from '@lit-protocol/auth-helpers';
import {
  EoaAuthContextSchema,
  SessionKeyUriSchema,
} from '@lit-protocol/schemas';
import { GetWalletClientReturnType } from '@wagmi/core';
import { Account, WalletClient } from 'viem';
import { z } from 'zod';
import { getViemAccountAuthenticator } from '../../authenticators/ViemAccountAuthenticator';
import { getWalletClientAuthenticator } from '../../authenticators/WalletClientAuthenticator';
import { LitAuthData } from '../../types';
import { AuthConfigSchema } from './BaseAuthContextType';

export type ExpectedAccountOrWalletClient =
  | Account
  | WalletClient
  | GetWalletClientReturnType;

interface GetEoaAuthContextParams {
  authentication: {
    authenticator:
      | ReturnType<typeof getViemAccountAuthenticator>
      | ReturnType<typeof getWalletClientAuthenticator>;
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

  const toSign = await createSiweMessageWithResources({
    uri: SessionKeyUriSchema.parse(_sessionKeyPair.publicKey),
    statement: _params.authConfig.statement,
    domain: _params.authConfig.domain,
    expiration: _params.authConfig.expiration,
    resources: _params.authConfig.resources,
    walletAddress: _params.authentication.authenticator.address,
    nonce: _params.deps.nonce,
  });

  const authMethod = await _params.authentication.authenticator.authenticate(
    toSign
  );

  return {
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
