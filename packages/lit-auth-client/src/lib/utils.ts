import * as cbor from 'cbor-web';

import { AuthMethodType } from '@lit-protocol/constants';
import { getLoggerbyId } from '@lit-protocol/misc';
import { AuthMethod, LoginUrlParams } from '@lit-protocol/types';

import DiscordProvider from './providers/DiscordProvider';
import EthWalletProvider from './providers/EthWalletProvider';
import GoogleProvider from './providers/GoogleProvider';
import StytchAuthFactorOtpProvider from './providers/StytchAuthFactorOtp';
import { StytchOtpProvider } from './providers/StytchOtpProvider';
import WebAuthnProvider from './providers/WebAuthnProvider';

export const STATE_PARAM_KEY = 'lit-state-param';
export const LIT_LOGIN_GATEWAY = 'https://login.litgateway.com';

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
 * @returns {Promise<string>} - Login url
 */
export async function prepareLoginUrl(
  provider: string,
  redirectUri: string,
  baseUrl = LIT_LOGIN_GATEWAY
): Promise<string> {
  const loginUrl = `${baseUrl}${getLoginRoute(provider)}`;
  const state = encode(await setStateParam());
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
function createQueryParams(params: any): string {
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
 * Check if current url is redirect uri to determine if app was redirected back from external login page
 *
 * @param {string} redirectUri - Redirect uri to check against
 *
 * @returns {boolean} - If current url is redirect uri
 */
export function isSignInRedirect(redirectUri: string): boolean {
  // Check if current url matches redirect uri
  const isRedirectUri = window.location.href.startsWith(redirectUri);
  if (!isRedirectUri) {
    return false;
  }
  // Check url for redirect params
  const { provider, accessToken, idToken, state, error } = parseLoginParams(
    window.document.location.search
  );
  // Check if current url is redirect uri and has redirect params
  if (isRedirectUri && (provider || accessToken || idToken || state || error)) {
    return true;
  }
  return false;
}

/**
 * Get provider name from redirect uri if available
 *
 * @returns {string} - Provider name
 */
export function getProviderFromUrl(): string | null {
  const { provider } = parseLoginParams(window.document.location.search);
  return provider;
}

/**
 * Create OAuth 2.0 state param and store it in session storage
 *
 * @returns {Promise<string>} - State param
 */
export async function setStateParam(): Promise<string> {
  const state = Math.random().toString(36).substring(2, 17);
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
 * Get RP ID from origin for WebAuthn
 *
 * @param {string} origin - Origin to get RP ID from
 *
 * @returns {string} - RP ID
 */
export function getRPIdFromOrigin(origin: string) {
  // remove protocol with regex
  const newOrigin = origin.replace(/(^\w+:|^)\/\//, '');
  // remove port with regex
  return newOrigin.replace(/:\d+$/, '');
}

// Function logic copied from Microsoft demo implementation: https://github.com/MicrosoftEdge/webauthnsample/blob/master/fido.js
// Decrypt the authData Buffer and split it in its single information pieces. Its structure is specified here: https://w3c.github.io/webauthn/#authenticator-data
export function parseAuthenticatorData(
  authDataBuffer: Buffer
): Record<string, unknown> {
  try {
    // deocde the buffer from cbor, will return an object.
    const authDataBufferDecoded = cbor.decode(authDataBuffer);
    const authenticatorData: any = {};
    const authData: Buffer = authDataBufferDecoded.authData;

    authenticatorData.rpIdHash = authData.slice(0, 32);
    authenticatorData.flags = authData[32];
    authenticatorData.signCount =
      (authData[33] << 24) |
      (authData[34] << 16) |
      (authData[35] << 8) |
      authData[36];

    // Check if the client sent attestedCredentialdata, which is necessary for every new public key scheduled. This is indicated by the 6th bit of the flag byte being 1 (See specification at function start for reference)
    if (authenticatorData.flags & 64) {
      // Extract the data from the Buffer. Reference of the structure can be found here: https://w3c.github.io/webauthn/#sctn-attested-credential-data
      const attestedCredentialData: Record<string, any> = {};
      attestedCredentialData['aaguid'] = unparse(authData.slice(37, 53)); ///.toUpperCase()
      attestedCredentialData['credentialIdLength'] =
        (authData[53] << 8) | authData[54];
      attestedCredentialData['credentialId'] = authData.slice(
        55,
        55 + attestedCredentialData['credentialIdLength']
      );
      // Public key is the first CBOR element of the remaining buffer
      let publicKeyCoseBufferCbor: Buffer = authData.slice(
        55 + attestedCredentialData['credentialIdLength'],
        authData.length
      );

      const publicKey = cbor.decode(publicKeyCoseBufferCbor);
      publicKeyCoseBufferCbor = cbor.encode(publicKey);

      attestedCredentialData['credentialPublicKey'] = publicKeyCoseBufferCbor;

      authenticatorData.attestedCredentialData = attestedCredentialData;
    }

    // Check for extension data in the authData, which is indicated by the 7th bit of the flag byte being 1 (See specification at function start for reference)
    if (authenticatorData.flags & 128) {
      // has extension data

      let extensionDataCbor;

      if (authenticatorData.attestedCredentialData) {
        // if we have attesttestedCredentialData, then extension data is
        // the second element
        extensionDataCbor = cbor.decode(
          // decodeAllSync(
          authData.slice(
            55 + authenticatorData.attestedCredentialData.credentialIdLength,
            authData.length
          )
        );
        extensionDataCbor = extensionDataCbor[1];
      } else {
        // Else it's the first element
        extensionDataCbor = cbor.decode(authData.slice(37, authData.length));
      }

      authenticatorData.extensionData = cbor
        .encode(extensionDataCbor)
        .toString('base64');
    }

    return authenticatorData;
  } catch (e) {
    throw new Error('Authenticator Data could not be parsed');
  }
}

// **`unparse()` - Convert UUID byte array (ala parse()) into a string**
export function unparse(buf: any) {
  // Maps for number <-> hex string conversion
  const _byteToHex = [];
  const _hexToByte: any = {};
  for (let it = 0; it < 256; it++) {
    _byteToHex[it] = (it + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[it]] = it;
  }
  let i: number = 0;
  const bth = _byteToHex;
  return (
    bth[buf[i++]] +
    bth[buf[i++]] +
    bth[buf[i++]] +
    bth[buf[i++]] +
    '-' +
    bth[buf[i++]] +
    bth[buf[i++]] +
    '-' +
    bth[buf[i++]] +
    bth[buf[i++]] +
    '-' +
    bth[buf[i++]] +
    bth[buf[i++]] +
    '-' +
    bth[buf[i++]] +
    bth[buf[i++]] +
    bth[buf[i++]] +
    bth[buf[i++]] +
    bth[buf[i++]] +
    bth[buf[i++]]
  );
}

export function log(...args: any) {
  const logger = getLoggerbyId('auth-client');
  logger.debug(...args);
}

/**
 * Retrieves the authentication ID based on the provided authentication method.
 *
 * @param {AuthMethod} authMethod - The authentication method
 * @returns {Promise<string>} - The authentication ID
 */
export async function getAuthIdByAuthMethod(
  authMethod: AuthMethod
): Promise<string> {
  let authId;

  switch (authMethod.authMethodType) {
case AuthMethodType.EthWallet:
  authId = await EthWalletProvider.authMethodId(authMethod);
  break;
case AuthMethodType.Discord:
  authId = await DiscordProvider.authMethodId(authMethod);
  break;
case AuthMethodType.WebAuthn:
  authId = await WebAuthnProvider.authMethodId(authMethod);
  break;
case AuthMethodType.GoogleJwt:
  authId = await GoogleProvider.authMethodId(authMethod);
  break;
case AuthMethodType.StytchOtp:
  authId = await StytchOtpProvider.authMethodId(authMethod);
  break;
case AuthMethodType.StytchEmailFactorOtp:
case AuthMethodType.StytchSmsFactorOtp:
case AuthMethodType.StytchTotpFactorOtp:
case AuthMethodType.StytchWhatsAppFactorOtp:
  authId = await StytchAuthFactorOtpProvider.authMethodId(authMethod);
  break;
default:
  log(`unsupported AuthMethodType: ${authMethod.authMethodType}`);
  throw new Error(
    `Unsupported auth method type: ${authMethod.authMethodType}`
  );
}

return authId;
}
