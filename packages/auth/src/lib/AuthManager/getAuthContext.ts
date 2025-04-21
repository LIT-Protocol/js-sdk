import { AUTH_METHOD_TYPE_TYPE } from '@lit-protocol/constants';
import {
  AuthCallbackParams,
  AuthSig,
  LitResourceAbilityRequest,
} from '@lit-protocol/types';
import { getEoaAuthContext } from './authContexts/getEoaAuthContext';
import { LitNodeClient } from '@lit-protocol/lit-node-client';

export interface AuthenticationContext {
  pkpPublicKey: string;
  chain: string;
  resourceAbilityRequests: LitResourceAbilityRequest[];
  authNeededCallback: (params: AuthCallbackParams) => Promise<AuthSig>;
  capabilityAuthSigs?: AuthSig[];
}

export interface GetAuthContextParams {
  authContextType: 'eoa' | 'pkp' | 'lit-action';
  pkpPublicKey: `0x${string}`;
  pkpAddress: `0x${string}`;
  litNodeClient: LitNodeClient;
  signer: {
    signMessage: (message: any) => Promise<string>;
    getAddress?: () => Promise<string>;
  };
}

export const getAuthContext = (
  params: GetAuthContextParams
): AuthenticationContext => {
  switch (params.authContextType) {
    case 'eoa':
      return getEoaAuthContext({
        litNodeClient: params.litNodeClient,
        identity: {
          pkpPublicKey: params.pkpPublicKey,
          signer: params.signer,
          signerAddress: params.pkpAddress,
        },
      });
    // case 'pkp':
    // case 'lit-action':
    default:
      throw new Error(
        `Unsupported auth method type: ${params.authContextType}`
      );
  }
};

// if (import.meta.main) {
//   const litNodeClient = new LitNodeClient({
//     litNetwork: 'naga-dev',
//   });
//   const authContext = getAuthContext({
//     authMethodType: 'EthWallet',
//     pkpAddress: '0x0000000000000000000000000000000000000000',
//     litNodeClient: litNodeClient,
//     signer: {
//       signMessage: async (message: any) => {
//         return '0x0000000000000000000000000000000000000000';
//       },
//     },
//   });

//   console.log('authContext', authContext);
// }
