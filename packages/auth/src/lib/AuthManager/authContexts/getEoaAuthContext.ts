import {
  createSiweMessageWithResources,
  generateAuthSig,
} from '@lit-protocol/auth-helpers';
import {
  HexPrefixedSchema,
  SessionKeyPairSchema,
  SessionKeyUriSchema,
  SignerSchema,
} from '@lit-protocol/schemas';
import { AuthCallbackParams } from '@lit-protocol/types';
import { z } from 'zod';
import {
  AuthConfigSchema,
  BaseAuthenticationSchema,
} from './BaseAuthContextType';

// Define specific Authentication schema for EOA
const EoaAuthenticationSchema = BaseAuthenticationSchema.extend({
  signer: SignerSchema,
  signerAddress: HexPrefixedSchema,
  sessionKeyPair: SessionKeyPairSchema,
});

export const GetEoaAuthContextSchema = z.object({
  authentication: EoaAuthenticationSchema,
  authConfig: AuthConfigSchema,
  deps: z.object({
    nonce: z.string(),
  }),
});

export const getEoaAuthContext = async (
  params: z.infer<typeof GetEoaAuthContextSchema>
) => {
  // Validate the input parameters against the schema
  const _params = GetEoaAuthContextSchema.parse(params);

  // Prepare the auth context object to be returned
  return {
    pkpPublicKey: _params.authentication.pkpPublicKey,
    chain: 'ethereum',
    resourceAbilityRequests: _params.authConfig.resources,
    sessionKeyPair: _params.authentication.sessionKeyPair,
    authNeededCallback: async ({
      // uri,
      expiration,
      resourceAbilityRequests,
    }: AuthCallbackParams) => {
      if (!expiration) {
        throw new Error('expiration is required');
      }

      if (!resourceAbilityRequests) {
        throw new Error('resourceAbilityRequests is required');
      }

      // if (!uri) {
      //   throw new Error('uri is required');
      // }

      const uri = SessionKeyUriSchema.parse(
        _params.authentication.sessionKeyPair.publicKey
      );

      const toSign = await createSiweMessageWithResources({
        uri: uri,
        domain: _params.authConfig.domain,
        expiration: _params.authConfig.expiration,
        resources: _params.authConfig.resources,
        walletAddress: _params.authentication.signerAddress,
        nonce: _params.deps.nonce, // deps is added via .extend, accessed directly
      });

      const authSig = await generateAuthSig({
        signer: _params.authentication.signer,
        toSign,
      });

      return authSig;
    },
    ...(_params.authConfig.capabilityAuthSigs && {
      capabilityAuthSigs: [..._params.authConfig.capabilityAuthSigs],
    }),
  };
};

// if (import.meta.main) {
//   (async () => {
//     /**
//      * @deprecated - this should be provided externally, previously it was provided by the litNodeClient
//      */
//     async function getNonce(): Promise<string> {
//       const { LitNodeClient } = await import('@lit-protocol/lit-node-client');
//       const litNodeClient = new LitNodeClient({
//         litNetwork: 'naga-dev',
//         debug: true,
//       });

//       await litNodeClient.connect();
//       return await litNodeClient.getLatestBlockhash();
//     }

//     /**
//      * @deprecated - this should be provided externally, previously it was provided by the litNodeClient
//      */
//     async function getDefaultResources() {
//       const { createResourceBuilder } = await import(
//         '@lit-protocol/auth-helpers'
//       );

//       return createResourceBuilder().addPKPSigningRequest('*').requests;
//     }

//     const authContext = await GetEoaAuthContext({
//       identity: {
//         pkpPublicKey: '0x123',
//         signer: { signMessage: async () => '0x123' },
//         signerAddress: '0x123',
//       },
//       authMaterial: {
//         resources: await getDefaultResources(),
//         expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Example expiration
//       },
//       deps: {
//         nonce: await getNonce(),
//       },
//     });

//     console.log('authContext', authContext);
//   })();
// }
