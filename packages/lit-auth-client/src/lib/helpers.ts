import {
  DefaultAuthNeededCallbackParams,
  EthWalletAuthNeededCallbackParams,
  SocialAuthNeededCallbackParams,
} from '@lit-protocol/types';
import { SiweMessage } from 'lit-siwe';

/**
 * Default callback to prompt the user to authenticate with their PKP via social login methods
 *
 * @param {SocialAuthNeededCallbackParams} params
 * @param {AuthMethod[]} params.authMethods - Auth methods to use
 * @param {string} params.pkpPublicKey - Public key of the PKP to use for signing
 *
 * @returns callback function
 */
export function getSocialAuthNeededCallback(
  params: SocialAuthNeededCallbackParams
): any {
  const defaultCallback = async ({
    chainId,
    resources,
    expiration,
    uri,
    litNodeClient,
  }: DefaultAuthNeededCallbackParams) => {
    const sessionSig = await litNodeClient.signSessionKey({
      sessionKey: uri,
      authMethods: params.authMethods,
      pkpPublicKey: params.pkpPublicKey,
      expiration,
      resources,
      chainId,
    });
    return sessionSig;
  };

  return defaultCallback;
}

/**
 * Default callback to prompt the user to authenticate with their PKP using wallet signatures
 *
 * @param {EthWalletAuthNeededCallbackParams} params
 * @param {string} params.domain - Domain that is requesting the signing
 * @param {string} params.address - Ethereum wallet address
 * @param {string} params.signMessage - Function to sign a message
 * @param {string} [params.statement] - Optional statement to include in the message
 *
 * @returns callback function
 */
export function getEthWalletAuthNeededCallback(
  params: EthWalletAuthNeededCallbackParams
): any {
  const defaultCallback = async ({
    chainId,
    resources,
    expiration,
    uri,
    litNodeClient,
  }: DefaultAuthNeededCallbackParams) => {
    const message = new SiweMessage({
      domain: params.domain,
      address: params.address,
      statement: params.statement || 'Lit Protocol PKP session signature',
      uri,
      version: '1',
      chainId: 1,
      expirationTime: expiration,
      resources,
    });
    const toSign = message.prepareMessage();
    const signature = await params.signMessage(toSign);

    const authSig = {
      sig: signature,
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: toSign,
      address: params.address,
    };

    return authSig;
  };

  return defaultCallback;
}
