import {
  createSiweMessageWithResources,
  generateAuthSig,
} from '@lit-protocol/auth-helpers';
import { AuthCallbackParams } from '@lit-protocol/types';
import { BaseAuthContextType, BaseIdentity } from './BaseAuthContextType';

interface EoaIdentity extends BaseIdentity {
  signer: {
    signMessage: (message: any) => Promise<string>;
    getAddress?: () => Promise<string>;
  };
  signerAddress: `0x${string}`;
}

export interface PrepareEoaAuthContextParams
  extends BaseAuthContextType<EoaIdentity> {
  identity: EoaIdentity;

  /**
   * The following are dependencies that were used to be provided by the litNodeClient
   */
  deps: {
    nonce: string;
  };
}

export const prepareEoaAuthContext = async (
  params: PrepareEoaAuthContextParams
) => {
  return {
    pkpPublicKey: params.identity.pkpPublicKey,
    chain: 'ethereum',
    resourceAbilityRequests: params.resources,
    authNeededCallback: async ({
      uri,
      expiration,
      resourceAbilityRequests,
    }: AuthCallbackParams) => {
      if (!expiration) {
        throw new Error('expiration is required');
      }

      if (!resourceAbilityRequests) {
        throw new Error('resourceAbilityRequests is required');
      }

      if (!uri) {
        throw new Error('uri is required');
      }

      const toSign = await createSiweMessageWithResources({
        uri: uri,
        expiration: expiration,
        resources: resourceAbilityRequests,
        walletAddress: params.identity.signerAddress,
        nonce: params.deps.nonce,
      });

      const authSig = await generateAuthSig({
        signer: params.identity.signer,
        toSign,
      });

      return authSig;
    },
    ...(params.capabilityAuthSigs && {
      capabilityAuthSigs: [...params.capabilityAuthSigs],
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

//     const authContext = await prepareEoaAuthContext({
//       identity: {
//         pkpPublicKey: '0x123',
//         signer: { signMessage: async () => '0x123' },
//         signerAddress: '0x123',
//       },
//       deps: {
//         nonce: await getNonce(),
//       },
//       resources: await getDefaultResources(),
//     });

//     console.log('authContext', authContext);
//   })();
// }
