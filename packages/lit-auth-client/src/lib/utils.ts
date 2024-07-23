import * as cbor from 'cbor-web';
import { ethers } from 'ethers';
import * as jose from 'jose';

import { getLoggerbyId } from '@lit-protocol/misc';
import { LoginUrlParams, StytchToken } from '@lit-protocol/types';

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
    let authDataBufferDecoded: any = cbor.decode(authDataBuffer);
    const authenticatorData: any = {};
    let authData: Buffer = authDataBufferDecoded.authData;

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
      const attestedCredentialData: { [key: string]: any } = {};
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

      const publicKey: any = cbor.decode(publicKeyCoseBufferCbor);
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
  var _byteToHex = [];
  var _hexToByte: any = {};
  for (var i = 0; i < 256; i++) {
    _byteToHex[i] = (i + 0x100).toString(16).substr(1);
    _hexToByte[_byteToHex[i]] = i;
  }
  var i: number = 0;
  var bth = _byteToHex;
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
 * Get the auth method id for an eth auth method
 * @param authMethod
 * @returns
 */
export async function getAuthIdByAuthMethod(authMethod: any): Promise<string> {
  let authMethodId;

  switch (authMethod.authMethodType) {
    case 1:
      authMethodId = getEthAuthMethodId(authMethod);
      break;
    case 4:
      authMethodId = await getDiscordAuthId(authMethod);
      break;
    case 3:
      authMethodId = await getWebauthnAuthId(authMethod);
      break;
    case 6:
      authMethodId = await getGoogleJwtAuthId(authMethod);
      break;
    case 9:
      authMethodId = await getStytchAuthId(authMethod);
      break;
    case 10:
    case 11:
    case 12:
    case 13:
      authMethodId = await getStytchFactorAuthMethodId(authMethod);
      break;
    default:
      throw new Error(
        `Unsupported auth method type: ${authMethod.authMethodType}`
      );
  }

  return authMethodId;
}

/**
 * Get the auth method id for an eth auth method, the access token can either be an auth sig or a session sigs object
 * @param authMethod
 * @returns
 */
export function getEthAuthMethodId(authMethod: any): string {
  let address: string;
  let accessToken: any;

  // -- try if access token can be parsed as JSON object first
  try {
    accessToken = JSON.parse(authMethod.accessToken);
  } catch (err) {
    throw new Error('Unable to parse access token as JSON object');
  }

  address = accessToken.address;

  // -- check if address is empty
  if (!address) {
    throw new Error('No address found in access token');
  }

  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${address}:lit`));
}

async function getDiscordAuthId(authMethod: any): Promise<string> {
  const _clientId = '1052874239658692668';

  // -- get user id from access token
  let userId;
  const meResponse = await fetch('https://discord.com/api/users/@me', {
    method: 'GET',
    headers: {
      authorization: `Bearer ${authMethod.accessToken}`,
    },
  });
  if (meResponse.ok) {
    const user = await meResponse.json();
    userId = user.id;
  } else {
    throw new Error('Unable to verify Discord account');
  }

  // -- get auth method id
  const authMethodId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(`${userId}:${_clientId}`)
  );

  return authMethodId;
}

async function getWebauthnAuthId(authMethod: any): Promise<string> {
  let credentialId: string;

  const rpNameToUse = 'lit';

  try {
    credentialId = JSON.parse(authMethod.accessToken).rawId;
  } catch (err) {
    throw new Error(
      `Error when parsing auth method to generate auth method ID for WebAuthn: ${err}`
    );
  }

  const authMethodId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(`${credentialId}:${rpNameToUse}`)
  );
  return authMethodId;
}

async function getStytchAuthId(authMethod: any): Promise<string> {
  try {
    const tokenBody = _parseJWT(authMethod.accessToken);
    const userId = tokenBody['sub'] as string;
    const orgId = (tokenBody['aud'] as string[])[0];
    const authMethodId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(`${userId.toLowerCase()}:${orgId.toLowerCase()}`)
    );
    return authMethodId;
  } catch (err) {
    throw new Error(
      `Error while parsing auth method to generate auth method id for Stytch OTP: ${err}`
    );
  }
}

/**
 * Get auth method id that can be used to look up and interact with
 * PKPs associated with the given auth method.
 * Will parse out the given `authentication factor` and use the transport
 * for the otp code as the `user identifier` for the given auth method.
 * @param {AuthMethod} authMethod - Auth method object
 *
 * @returns {Promise<string>} - Auth method id
 */
function getStytchFactorAuthMethodId(authMethod: any): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const accessToken = authMethod.accessToken;
    const parsedToken: StytchToken = _parseJWT(accessToken);
    let factor: string = 'email';
    switch (authMethod.authMethodType) {
      case 10:
        factor = 'email';
        break;
      case 11:
        factor = 'sms';
        break;
      case 12:
        factor = 'whatsApp';
        break;
      case 13:
        factor = 'totp';
        break;
      default:
        throw new Error('Unsupport stytch auth type');
    }
    const factorParser = _resolveAuthFactor(factor).parser;
    try {
      resolve(factorParser(parsedToken, 'https://stytch.com/session'));
    } catch (e) {
      reject(e);
    }
  });
}

async function getGoogleJwtAuthId(authMethod: any): Promise<string> {
  const tokenPayload = jose.decodeJwt(authMethod.accessToken);
  const userId: string = tokenPayload['sub'] as string;
  const audience: string = tokenPayload['aud'] as string;
  const authMethodId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(`${userId}:${audience}`)
  );
  return authMethodId;
}

/**
 *
 * @param jwt token to parse
 * @returns {string}- userId contained within the token message
 */
function _parseJWT(jwt: string): StytchToken {
  const parts = jwt.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token length');
  }
  const body = Buffer.from(parts[1], 'base64');
  const parsedBody: StytchToken = JSON.parse(body.toString('ascii'));
  console.log('JWT body: ', parsedBody);
  return parsedBody;
}

const getAuthFactor = (
  parsedToken: StytchToken,
  provider: string,
  factorKey: string
) => {
  const session = parsedToken[provider];
  const authFactors: any[] = session['authentication_factors'];
  const authFactor = authFactors.find((value) => {
    if (value[factorKey]) return value;
  });

  if (!authFactor) {
    throw new Error('Could not find authentication info in session');
  }

  return authFactor;
};

const getAudience = (parsedToken: StytchToken) => {
  return (parsedToken['aud'] as string[])[0];
};

export const emailOtpAuthFactorParser = (
  parsedToken: StytchToken,
  provider: string
): string => {
  const authFactor = getAuthFactor(parsedToken, provider, 'email_factor');
  const audience = getAudience(parsedToken);
  const userId = authFactor.email_factor.email_address;

  const authMethodId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      `${userId.toLowerCase()}:${audience.toLowerCase()}`
    )
  );

  return authMethodId;
};

export const smsOtpAuthFactorParser = (
  parsedToken: StytchToken,
  provider: string
): string => {
  const authFactor = getAuthFactor(
    parsedToken,
    provider,
    'phone_number_factor'
  );
  const audience = getAudience(parsedToken);
  const userId = authFactor.phone_number_factor.phone_number;
  const authMethodId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      `${userId.toLowerCase()}:${audience.toLowerCase()}`
    )
  );

  return authMethodId;
};

export const whatsAppOtpAuthFactorParser = (
  parsedToken: StytchToken,
  provider: string
): string => {
  const authFactor = getAuthFactor(
    parsedToken,
    provider,
    'phone_number_factor'
  );
  const audience = getAudience(parsedToken);
  const userId = authFactor.phone_number_factor.phone_number;

  const authMethodId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      `${userId.toLowerCase()}:${audience.toLowerCase()}`
    )
  );

  return authMethodId;
};

export const totpAuthFactorParser = (
  parsedToken: StytchToken,
  provider: string
): string => {
  const authFactor = getAuthFactor(
    parsedToken,
    provider,
    'phone_number_factor'
  );
  const audience = getAudience(parsedToken);
  const userId = authFactor.authenticator_app_factor.totp_id;

  const authMethodId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      `${userId.toLowerCase()}:${audience.toLowerCase()}`
    )
  );

  return authMethodId;
};

function _resolveAuthFactor(factor: string): {
  parser: Function;
  authMethodType: number;
} {
  switch (factor) {
    case 'email':
      return {
        parser: emailOtpAuthFactorParser,
        authMethodType: 10,
      };
    case 'sms':
      return {
        parser: smsOtpAuthFactorParser,
        authMethodType: 11,
      };
    case 'whatsApp':
      return {
        parser: whatsAppOtpAuthFactorParser,
        authMethodType: 12,
      };
    case 'totp':
      return {
        parser: totpAuthFactorParser,
        authMethodType: 13,
      };
  }

  throw new Error(`Error could not find auth with factor ${factor}`);
}
