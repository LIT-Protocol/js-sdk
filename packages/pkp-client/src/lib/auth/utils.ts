import {
  AuthMethod,
  AuthMethodType,
  AuthNeededCallbackParams,
  LoginUrlParams,
} from './types';
import { ethers } from 'ethers';
import { SiweMessage } from 'lit-siwe';
import { nanoid } from 'nanoid';
import { STATE_PARAM_KEY } from './constants';

/**
 * Check if OAuth provider is supported
 *
 * @param provider {string} - Auth provider name
 *
 * @returns {boolean} - True if provider is supported
 */
export function isOAuthProviderSupported(provider: string): boolean {
  return ['google', 'discord'].includes(provider);
}

/**
 * Create login url using the parameters provided as arguments when initializing the client
 *
 * @param {string} provider - Social login provider to use
 * @param {string} redirectUri - Redirect uri to use
 *
 * @returns {string} - Login url
 */
export function prepareLoginUrl(provider: string, redirectUri: string): string {
  const baseUrl = 'https://login.litgateway.com';
  const loginUrl = `${baseUrl}${getLoginRoute(provider)}`;
  const state = encode(setStateParam());
  const authParams = {
    app_redirect: redirectUri,
  };
  const queryAuthParams = createQueryParams(authParams);
  return `${loginUrl}?${queryAuthParams}&state=${state}`;
}

/**
 * Get route for logging in with given provider
 *
 * @param provider {string} - Auth provider name
 *
 * @returns route
 */
function getLoginRoute(provider: string): string {
  switch (provider) {
    case 'google':
      return '/auth/google';
    case 'discord':
      return '/auth/discord';
    default:
      throw new Error(
        `No login route available for the given provider "${provider}".`
      );
  }
}

/**
 * Create query params string from given object
 *
 * @param params {any} - Object of query params
 *
 * @returns {string} - Query string
 */
function createQueryParams(params: any) {
  // Strip undefined values from params
  const filteredParams = Object.keys(params)
    .filter((k) => typeof params[k] !== 'undefined')
    .reduce((acc, key) => ({ ...acc, [key]: params[key] }), {});
  // Create query string
  return new URLSearchParams(filteredParams).toString();
}

/**
 * Parse out login parameters from the query string
 *
 * @param {string} search - Query string
 *
 * @returns {LoginUrlParams} - Login url params
 */
export function parseLoginParams(search: string): LoginUrlParams {
  const searchParams = new URLSearchParams(search);
  const provider = searchParams.get('provider');
  const accessToken = searchParams.get('access_token');
  const idToken = searchParams.get('id_token');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  return {
    provider,
    accessToken,
    idToken,
    state,
    error,
  };
}

/**
 * Create OAuth 2.0 state param and store it in session storage
 *
 * @returns {string} - State param
 */
function setStateParam(): string {
  const state = nanoid(15);
  sessionStorage.setItem(STATE_PARAM_KEY, state);
  return state;
}

/**
 * Get OAuth 2.0 state param from session storage
 *
 * @returns {string} - State param
 */
export function getStateParam(): string | null {
  return sessionStorage.getItem(STATE_PARAM_KEY);
}

/**
 * Remove OAuth 2.0 state param from session storage
 *
 * @returns {void}
 */
export function removeStateParam(): void {
  return sessionStorage.removeItem(STATE_PARAM_KEY);
}

/**
 * Encode a string with base64
 *
 * @param value {string} - String to encode
 *
 * @returns {string} - Encoded string
 */
export function encode(value: string): string {
  return window.btoa(value);
}

/**
 * Decode a string with base64
 *
 * @param value {string} - String to decode
 *
 * @returns {string} - Decoded string
 */
export function decode(value: string): string {
  return window.atob(value);
}

/**
 * Default callback to prompt the user to authenticate with their PKP via non-wallet auth methods such as social login
 *
 * @param {AuthMethod[]} authMethods - Auth method array that includes the auth method type and data
 * @param {string} pkpPublicKey - Public key of the PKP
 *
 * @returns callback function
 */
export function getDefaultAuthNeededCallback(
  authMethods: AuthMethod[],
  pkpPublicKey: string
): any {
  const defaultCallback = async ({
    chainId,
    resources,
    expiration,
    uri,
    litNodeClient,
  }: AuthNeededCallbackParams) => {
    const sessionSig = await litNodeClient.signSessionKey({
      sessionKey: uri,
      authMethods: authMethods,
      pkpPublicKey: pkpPublicKey,
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
 * @param {string} domain - Domain that is requesting the signing
 * @param {string} ethAddress - Ethereum address of authorized wallet
 * @param {ethers.Signer} signer - Signer to sign the message
 * @param {string} pkpPublicKey - Public key of the PKP to auth with
 * @param {number} chainId - Chain ID to use
 * @param {string} [statement] - Optional statement to include in the message
 *
 * @returns callback function
 */
export function getDefaultWalletAuthNeededCallback(
  domain: string,
  ethAddress: string,
  signer: ethers.Signer,
  pkpPublicKey: string,
  chainId: number,
  statement?: string
): any {
  const defaultCallback = async ({
    chainId,
    resources,
    expiration,
    uri,
    litNodeClient,
  }: AuthNeededCallbackParams) => {
    const statementParam = statement
      ? statement
      : 'Lit Protocol PKP session signature';
    const message = new SiweMessage({
      domain,
      address: ethAddress,
      statement: statementParam,
      uri,
      version: '1',
      // it's a string here https://github.com/LIT-Protocol/lit-js-sdk/blob/serrano/src/utils/litNodeClient.js#L519
      chainId: chainId,
      expirationTime: expiration,
      resources,
    });
    const toSign = message.prepareMessage();
    const signature = await signer.signMessage(toSign);

    const authSig = {
      sig: signature,
      derivedVia: 'web3.eth.personal.sign',
      signedMessage: toSign,
      address: ethAddress,
    };

    const sessionSig = await litNodeClient.signSessionKey({
      sessionKey: uri,
      pkpPublicKey: pkpPublicKey,
      authSig: authSig,
      authMethods: [
        {
          authMethodType: AuthMethodType.EthWallet,
          accessToken: ethAddress,
        },
      ],
      expiration,
      resources,
      chainId,
    });

    return sessionSig;
  };

  return defaultCallback;
}
