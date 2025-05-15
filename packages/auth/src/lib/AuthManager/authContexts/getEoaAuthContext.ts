import { createSiweMessageWithResources } from '@lit-protocol/auth-helpers';
import { EoaAuthContextSchema } from '@lit-protocol/networks';
import { SessionKeyUriSchema } from '@lit-protocol/schemas';
import { Account } from 'viem';
import { z } from 'zod';
import { getViemAccountAuthenticator } from '../../authenticators/ViemAccountAuthenticator';
import { LitAuthDataSchema } from '../../types';
import { AuthConfigSchema } from './BaseAuthContextType';

// Define specific Authentication schema for EOA
export const EoaAuthenticationSchema = z.object({
  viemAccount: z.custom<Account>(),
});

export const GetEoaAuthContextSchema = z.object({
  authentication: EoaAuthenticationSchema,
  authConfig: AuthConfigSchema,
  deps: z.object({
    nonce: z.string(),
    authData: LitAuthDataSchema,
  }),
});

export const getEoaAuthContext = async (
  params: z.infer<typeof GetEoaAuthContextSchema>
): Promise<z.infer<typeof EoaAuthContextSchema>> => {
  // -- validate params
  const _params = GetEoaAuthContextSchema.parse(params);
  const _sessionKeyPair = _params.deps.authData.sessionKey.keyPair;

  const authenticator = getViemAccountAuthenticator({
    account: params.authentication.viemAccount,
  });

  const toSign = await createSiweMessageWithResources({
    uri: SessionKeyUriSchema.parse(_sessionKeyPair.publicKey),
    statement: _params.authConfig.statement,
    domain: _params.authConfig.domain,
    expiration: _params.authConfig.expiration,
    resources: _params.authConfig.resources,
    walletAddress: _params.authentication.viemAccount.address,
    nonce: _params.deps.nonce,
  });

  const authMethod = await authenticator.authenticate(toSign);

  return {
    viemAccount: _params.authentication.viemAccount,
    authMethod,
    authNeededCallback: async () => {
      const authenticator = getViemAccountAuthenticator({
        account: params.authentication.viemAccount,
      });
      return authenticator.getAuthSig(toSign);
    },
    sessionKeyPair: _sessionKeyPair,
    authConfig: _params.authConfig,
  };
};
