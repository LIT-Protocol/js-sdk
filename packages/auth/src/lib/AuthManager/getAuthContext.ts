import { ResourceAbilityRequestBuilder } from '@lit-protocol/auth-helpers';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  AuthenticationContext,
  AuthMethod,
  AuthSig,
  LitResourceAbilityRequest,
} from '@lit-protocol/types';
import { Hex } from 'viem';
import { getEoaAuthContext } from './authContexts/getEoaAuthContext';
import { getPkpAuthContext } from './authContexts/getPkpAuthContext';

interface BaseAuthContextParams {
  pkpPublicKey: Hex;
  litNodeClient: LitNodeClient;
  capabilityAuthSigs?: AuthSig[];
  resources?: LitResourceAbilityRequest[];
}

interface EthWalletAuthParams extends BaseAuthContextParams {
  authMethodType: 'EthWallet';
  signer: {
    signMessage: (message: any) => Promise<string>;
    address: string | Hex;
  };
}

interface PkpAuthParams extends BaseAuthContextParams {
  authMethodType:
    | 'Google'
    | 'Discord'
    | 'WebAuthn'
    | 'StytchEmailFactorOtp'
    | 'StytchSmsFactorOtp';
  authMethods: AuthMethod[];
}

export type GetAuthContextParams = EthWalletAuthParams | PkpAuthParams;

/**
 * Get Auth Context prepares the ingredients for the Auth Context
 */
export const getAuthContext = async (
  params: GetAuthContextParams
): Promise<AuthenticationContext> => {
  let finalResources = params.resources;
  if (!finalResources) {
    const resourceBuilder = new ResourceAbilityRequestBuilder();
    resourceBuilder.addPKPSigningRequest('*');
    finalResources = resourceBuilder.build();
  }

  const finalCapabilityAuthSigs = [...(params.capabilityAuthSigs ?? [])];

  switch (params.authMethodType) {
    case 'EthWallet': {
      const { signer } = params;

      if (!signer.address) {
        throw new Error(
          'For EthWallet auth method, signer object must have an `address` property.'
        );
      }

      const signerAddress = signer.address;
      const finalSignerAddress = (
        signerAddress?.startsWith('0x') ? signerAddress : `0x${signerAddress}`
      ) as Hex;

      return getEoaAuthContext({
        litNodeClient: params.litNodeClient,
        identity: {
          signer: signer,
          signerAddress: finalSignerAddress,
          pkpPublicKey: params.pkpPublicKey,
        },
        resources: finalResources,
        capabilityAuthSigs: finalCapabilityAuthSigs,
      });
    }
    case 'Google':
    case 'Discord':
    case 'WebAuthn':
    case 'StytchEmailFactorOtp':
    case 'StytchSmsFactorOtp': {
      const { authMethods } = params;
      return getPkpAuthContext({
        litNodeClient: params.litNodeClient,
        identity: {
          pkpPublicKey: params.pkpPublicKey,
          authMethods: authMethods,
        },
        resources: finalResources,
        capabilityAuthSigs: finalCapabilityAuthSigs,
      });
    }
    default:
      throw new Error(
        `Unsupported or unhandled auth method type: ${
          (params as any).authMethodType
        }`
      );
  }
};

// if (import.meta.main) {
//   (async () => {
//     const litNodeClient = new LitNodeClient({
//       litNetwork: 'naga-dev',
//       debug: false,
//     });

//     await litNodeClient.connect();

//     const anvilPrivateKey =
//       '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';

//     const ethersWallet = new ethers.Wallet(anvilPrivateKey);
//     const viemAccount = privateKeyToAccount(anvilPrivateKey);

//     const authContext = await getAuthContext({
//       authMethodType: 'EthWallet',
//       litNodeClient: litNodeClient,
//       signer: ethersWallet,
//       pkpPublicKey:
//         '0x04e5603fe1cc5ce207c12950939738583b599f22a152c3672a4c0eee887d75dd405246ac3ed2430283935a99733eac9520581af9923c0fc04fad1d67d60908ce18',
//     });

//     console.log('authContext', authContext);
//     process.exit();
//   })();
// }
