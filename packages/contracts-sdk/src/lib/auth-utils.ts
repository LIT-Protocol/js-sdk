import { SessionSig } from '@lit-protocol/types';
import { ethers } from 'ethers';
import * as jose from 'jose';
/**
 * Code here is ported from `packages/lit-auth-client` due to circular dep errors
 */
export async function getAuthIdByAuthMethod(authMethod: any): Promise<string> {
  let authId;
  switch (authMethod.authMethodType) {
    case 1:
      authId = getEthAuthMethodId(authMethod);
      break;
    case 4:
      authId = await getDiscordAuthId(authMethod);
      break;
    case 3:
      authId = await getWebauthnAuthId(authMethod);
      break;
    case 6:
      authId = await getGoogleJwtAuthId(authMethod);
      break;
    case 9:
      authId = await getGoogleJwtAuthId(authMethod);
      break;
    default:
      throw new Error(
        `Unsupported auth method type: ${authMethod.authMethodType}`
      );
  }

  return authId;
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

async function getGoogleJwtAuthId(authMethod: any): Promise<string> {
  const tokenPayload = jose.decodeJwt(authMethod.accessToken);
  const userId: string = tokenPayload['sub'] as string;
  const audience: string = tokenPayload['aud'] as string;
  const authMethodId = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(`${userId}:${audience}`)
  );
  return authMethodId;
}
