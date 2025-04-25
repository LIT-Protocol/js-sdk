import {
  createSiweMessageWithRecaps,
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

      const toSign = await createSiweMessageWithRecaps({
        uri: uri,
        expiration: expiration,
        resources: resourceAbilityRequests,
        walletAddress: params.identity.signerAddress,
        nonce: await params.litNodeClient.getLatestBlockhash(),
        litNodeClient: params.litNodeClient,
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
//   const litNodeClient = new LitNodeClient({
//     litNetwork: 'naga-dev',
//     debug: true,
//   });

//   const resourceBuilder = new ResourceAbilityRequestBuilder();
//   resourceBuilder.addPKPSigningRequest('*');
//   const resourceRequests = resourceBuilder.build();

//   console.log('resourceRequests', JSON.stringify(resourceRequests, null, 2));

//   const authContext = prepareEoaAuthContext({
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
