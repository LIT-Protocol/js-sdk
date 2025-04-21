import {
  createSiweMessageWithRecaps,
  generateAuthSig,
  ResourceAbilityRequestBuilder,
} from '@lit-protocol/auth-helpers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  AuthCallbackParams,
  AuthSig,
  LitResourceAbilityRequest,
} from '@lit-protocol/types';

interface GetEoaAuthContextParams {
  litNodeClient: LitNodeClient;
  identity: {
    pkpPublicKey: string;
    signer: {
      signMessage: (message: any) => Promise<string>;
      getAddress?: () => Promise<string>;
    };
    signerAddress: `0x${string}`;
  };
  resources?: LitResourceAbilityRequest[];
  capabilityAuthSigs?: AuthSig[];
}

export const getEoaAuthContext = ({
  litNodeClient,
  identity: { pkpPublicKey, signer, signerAddress },
  resources,
  capabilityAuthSigs,
}: GetEoaAuthContextParams) => {
  const resourceBuilder = new ResourceAbilityRequestBuilder();
  resourceBuilder.addPKPSigningRequest('*');
  const resourceRequests = resourceBuilder.build();

  return {
    pkpPublicKey,
    chain: 'ethereum',
    resourceAbilityRequests: resources || resourceRequests,
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

      const toSign = await createSiweMessageWithRecaps({
        uri: uri,
        expiration: expiration,
        resources: resourceAbilityRequests,
        walletAddress: signerAddress,
        nonce: await litNodeClient.getLatestBlockhash(),
        litNodeClient: litNodeClient,
      });

      const authSig = await generateAuthSig({
        signer: signer,
        toSign,
      });

      return authSig;
    },
    ...(capabilityAuthSigs && {
      capabilityAuthSigs: [...capabilityAuthSigs],
    }),
  };
};

// if (import.meta.main) {
//   const litNodeClient = new LitNodeClient({
//     litNetwork: 'naga-dev',
//     debug: true,
//   });

//   const resourceBuilder = new ResourceAbilityRequestBuilder();
//   resourceBuilder.addPKPSigningRequest('*');
//   const resourceRequests = resourceBuilder.build();

//   console.log('resourceRequests', JSON.stringify(resourceRequests, null, 2));

//   const authContext = getEoaAuthContext({
//     litNodeClient: litNodeClient,
//     identity: {
//       pkpPublicKey: '0x123',
//       signer: { signMessage: async () => '0x123' },
//       signerAddress: '0x123',
//     },
//     resources: resourceRequests,
//   });

//   console.log('authContext', authContext);
// }
