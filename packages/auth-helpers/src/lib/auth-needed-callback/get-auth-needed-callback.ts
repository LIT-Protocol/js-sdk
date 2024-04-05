import { ethers } from 'ethers';
import {
  AuthCallbackFields,
  createSiweMessage,
} from './create-siwe-message/create-siwe-message';
import { AuthSig, LitResourceAbilityRequest } from '../models';
import { craftAuthSig } from './craft-auth-sig';

export interface AuthCallbackParams {
  chain: string;
  statement?: string;
  nonce: string;
  resources?: string[];
  switchChain?: boolean;
  expiration?: string;
  uri?: string;
  resourceAbilityRequests?: LitResourceAbilityRequest[];
}

export type AuthCallback = (params: AuthCallbackParams) => Promise<AuthSig>;

export enum AuthSigCallbackType {
  HOT_WALLET = 'HOT_WALLET',
}

export const getAuthSigCallback = async ({
  litNodeClient,
  type,
  signer,
}: {
  litNodeClient: any;
  type: AuthSigCallbackType;
  signer: ethers.Wallet | ethers.Signer;
}): Promise<AuthCallback> => {
  const nonce = await litNodeClient.getLatestBlockhash();

  switch (type) {
    case AuthSigCallbackType.HOT_WALLET:
      return async ({
        resources,
        expiration,
        uri,
      }: AuthCallbackParams): Promise<AuthSig> => {
        const hotWalletAddress = await signer.getAddress();

        if (!expiration) {
          throw new Error('expiration is required');
        }

        if (!resources) {
          throw new Error('resources is required');
        }

        if (!uri) {
          throw new Error('uri is required');
        }

        const toSign = await createSiweMessage<AuthCallbackFields>({
          uri,
          walletAddress: hotWalletAddress,
          expiration,
          resources,
          nonce,
        });

        const authSig = await craftAuthSig({
          signer,
          toSign,
          address: hotWalletAddress,
        });

        return authSig;
      };
    default:
      throw new Error('Invalid AuthSigCallbackType');
  }
};
