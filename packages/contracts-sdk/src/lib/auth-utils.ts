import { StytchToken } from '@lit-protocol/types';
import { ethers } from 'ethers';
import * as jose from 'jose';
/**
 * Code here is ported from `packages/lit-auth-client` due to circular dep errors
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
    let tokenBody = _parseJWT(authMethod.accessToken);
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

export const emailOtpAuthFactorParser = (
  parsedToken: StytchToken,
  provider: string
): string => {
  const session = parsedToken[provider];
  const authFactors: any[] = session['authentication_factors'];
  let authFactor = authFactors.find((value, _index, _obj) => {
    if (value.email_factor) return value;
  });

  if (!authFactor) {
    throw new Error('Could not find email authentication info in session');
  }
  const audience = (parsedToken['aud'] as string[])[0];
  if (!audience) {
    throw new Error(
      'Token does not contain an audience (project identifier), aborting'
    );
  }

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
  const session = parsedToken[provider];
  const authFactors: any[] = session['authentication_factors'];
  let authFactor = authFactors.find((value, _index, _obj) => {
    if (value.phone_number_factor) return value;
  });

  if (!authFactor) {
    throw new Error('Could not find email authentication info in session');
  }
  const audience = (parsedToken['aud'] as string[])[0];
  if (!audience) {
    throw new Error(
      'Token does not contain an audience (project identifier), aborting'
    );
  }

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
  const session = parsedToken[provider];
  const authFactors: any[] = session['authentication_factors'];
  let authFactor = authFactors.find((value, _index, _obj) => {
    if (value.phone_number_factor) return value;
  });

  if (!authFactor) {
    throw new Error('Could not find email authentication info in session');
  }
  const audience = (parsedToken['aud'] as string[])[0];
  if (!audience) {
    throw new Error(
      'Token does not contain an audience (project identifier), aborting'
    );
  }

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
  const session = parsedToken[provider];
  const authFactors: any[] = session['authentication_factors'];
  let authFactor = authFactors.find((value, _index, _obj) => {
    if (value.phone_number_factor) return value;
  });

  if (!authFactor) {
    throw new Error('Could not find email authentication info in session');
  }
  const audience = (parsedToken['aud'] as string[])[0];
  if (!audience) {
    throw new Error(
      'Token does not contain an audience (project identifier), aborting'
    );
  }

  const userId = authFactor.authenticator_app_factor.totp_id;
  const authMethodId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(
      `${userId.toLowerCase()}:${audience.toLowerCase()}`
    )
  );

  return authMethodId;
};

function _resolveAuthFactor(factor: any): {
  parser: Function;
  authMethodType: any;
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

/**
 * TODO: Replace ethers to something else, so we don't rely on ethers
 * Converts a string into a byte array (arrayified value).
 * @param str - The input string to be converted.
 * @returns A Uint8Array representing the arrayified value of the string.
 */
export const stringToArrayify = (str: string): Uint8Array => {
  try {
    return ethers.utils.toUtf8Bytes(str);
  } catch (e) {
    throw new Error(`Error converting string to arrayify: ${e}`);
  }
};
