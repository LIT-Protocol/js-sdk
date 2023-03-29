import { nanoid } from 'nanoid';
import { LoginUrlParams } from '@lit-protocol/types';

export const STATE_PARAM_KEY = 'lit-state-param';

/**
 * Check if OAuth provider is supported
 *
 * @param provider {string} - Auth provider name
 *
 * @returns {boolean} - True if provider is supported
 */
export function isSocialLoginSupported(provider: string): boolean {
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
export function setStateParam(): string {
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
