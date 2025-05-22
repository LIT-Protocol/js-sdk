import {
  PublicKeyCredentialCreationOptionsJSON,
  RegistrationResponseJSON,
  UserVerificationRequirement,
} from '@simplewebauthn/typescript-types';
import base64url from 'base64url';
import { ethers } from 'ethers';

import {
  AUTH_METHOD_TYPE,
  InvalidArgumentException,
  UnknownError,
  WrongParamFormat,
} from '@lit-protocol/constants';
import { AuthMethod, Hex } from '@lit-protocol/types';

import { AuthData } from '@lit-protocol/schemas';
import { getRPIdFromOrigin, parseAuthenticatorData } from '../utils';

import { EthBlockhashInfo } from '@lit-protocol/types';

const fetchBlockchainData = async () => {
  try {
    const resp = await fetch(
      'https://block-indexer.litgateway.com/get_most_recent_valid_block'
    );
    if (!resp.ok) {
      throw new Error(`Primary fetch failed with status: ${resp.status}`); // Or a custom error
    }

    const blockHashBody: EthBlockhashInfo = await resp.json();
    const { blockhash, timestamp } = blockHashBody;

    if (!blockhash || !timestamp) {
      throw new Error('Invalid data from primary blockhash source');
    }

    return blockhash;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error(String(error));
  }
};

interface WebAuthnRegistrationResponse {
  opts: PublicKeyCredentialCreationOptionsJSON;
  webAuthnPublicKey: string;
}

export class WebAuthnAuthenticator {
  /**
   * Generate registration options for WebAuthn authentication
   * @params {string} username - Optional username for the WebAuthn credential
   * @params {string} authServerUrl - The URL of the authentication server
   * @returns {Promise<PublicKeyCredentialCreationOptionsJSON>} - WebAuthn registration options
   */
  public static async getRegistrationOptions(params: {
    username?: string;
    authServerUrl: string;
  }): Promise<PublicKeyCredentialCreationOptionsJSON> {
    let url = `${params.authServerUrl}/auth/webauthn/generate-registration-options`;

    if (params.username && params.username !== '') {
      url = `${url}?username=${encodeURIComponent(params.username)}`;
    }

    const response = await fetch(
      url
      //   {
      //   method: 'GET',
      //   headers: {
      //     'api-key': params.apiKey,
      //   },
      // }
    );
    if (response.status < 200 || response.status >= 400) {
      const err = new Error(
        `Unable to generate registration options: ${response}`
      );
      throw err;
    }

    const registrationOptions = await response.json();
    return registrationOptions;
  }

  /**
   * Register a new WebAuthn credential
   *
   * @param {PublicKeyCredentialCreationOptionsJSON} options - Registration options from the server
   * @returns {Promise<AuthData>} - Auth data containing the WebAuthn credential
   */
  public static async register(params: {
    username?: string;
    authServerUrl: string;
  }): Promise<WebAuthnRegistrationResponse> {
    const opts = await WebAuthnAuthenticator.getRegistrationOptions({
      username: params.username,
      authServerUrl: params.authServerUrl,
    });

    // Submit registration options to the authenticator
    const { startRegistration } = await import('@simplewebauthn/browser');
    const attResp: RegistrationResponseJSON = await startRegistration(opts);

    // Get auth method pub key
    const authMethodPubkey =
      WebAuthnAuthenticator.getPublicKeyFromRegistration(attResp);

    return {
      webAuthnPublicKey: authMethodPubkey,
      opts,
    };
  }

  /**
   * Authenticate with a WebAuthn credential and return the relevant authentication data
   *
   * @param {string} params.authServerUrl - The URL of the authentication server
   * @returns {Promise<AuthData>} - Auth data containing WebAuthn authentication response
   */
  public static async authenticate(params: {
    registrationResponse: WebAuthnRegistrationResponse;
    authServerUrl: string;
  }): Promise<AuthData> {
    // Turn into byte array
    const latestBlockhash = await fetchBlockchainData();
    const blockHashBytes = ethers.utils.arrayify(latestBlockhash);

    // Construct authentication options
    const rpId = getRPIdFromOrigin(params.authServerUrl);

    const authenticationOptions = {
      challenge: base64url(Buffer.from(blockHashBytes)),
      timeout: 60000,
      userVerification: 'required' as UserVerificationRequirement,
      rpId,
    };

    // Authenticate with WebAuthn
    const { startAuthentication } = await import('@simplewebauthn/browser');
    const authenticationResponse = await startAuthentication(
      authenticationOptions
    );

    const actualAuthenticationResponse = JSON.parse(
      JSON.stringify(authenticationResponse)
    );

    // Make sure userHandle is base64url encoded if it exists
    const userHandle = authenticationResponse.response?.userHandle;
    if (userHandle) {
      actualAuthenticationResponse.response.userHandle =
        base64url.encode(userHandle);
    }

    const authMethod = {
      authMethodType: AUTH_METHOD_TYPE.WebAuthn,
      accessToken: JSON.stringify(actualAuthenticationResponse),
    };

    // Get auth method id (using default rpName 'lit')
    const authMethodId = await WebAuthnAuthenticator.authMethodId(authMethod);

    // It's incorrect to try and get the registration public key from an authentication response.
    // The public key is obtained during the registration process (from attestationObject).
    // If the public key is needed after authentication, it should be retrieved from where it was stored
    // after the initial registration, not re-extracted from the authentication response here.

    return {
      ...authMethod,
      authMethodId,
      webAuthnPublicKey: params.registrationResponse.webAuthnPublicKey,
    };
  }

  /**
   * Get auth method id that can be used to look up and interact with
   * PKPs associated with the given auth method
   *
   * @param {AuthMethod} authMethod - Auth method object
   * @param {string} rpName - Optional relying party name, defaults to "lit"
   *
   * @returns {Promise<Hex>} - Auth method id
   */
  public static async authMethodId(
    authMethod: AuthMethod,
    rpName?: string
  ): Promise<string> {
    let credentialId: string;

    const rpNameToUse = rpName || 'lit';

    try {
      credentialId = JSON.parse(authMethod.accessToken).rawId;
    } catch (err) {
      throw new WrongParamFormat(
        {
          info: {
            authMethod,
          },
          cause: err,
        },
        'Error when parsing auth method to generate auth method ID for Eth wallet'
      );
    }

    const authMethodId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(`${credentialId}:${rpNameToUse}`)
    );
    return authMethodId;
  }

  /**
   * Parse the WebAuthn registration response to get the WebAuthn credential public key
   *
   * @param {RegistrationResponseJSON} attResp - WebAuthn registration response
   *
   * @returns {string} - WebAuthn credential public key in hex format
   */
  public static getPublicKeyFromRegistration(
    attResp: RegistrationResponseJSON
  ): string {
    let publicKey: string;

    try {
      // Create a buffer object from the base64 encoded content
      const attestationBuffer = Buffer.from(
        attResp.response.attestationObject,
        'base64'
      );

      // Parse the buffer to reconstruct the object
      let authenticationResponse = parseAuthenticatorData(attestationBuffer);

      // Normalize the authenticationResponse. If it (or its parts) has a .toJSON() method,
      // JSON.stringify will use that. JSON.parse will then create a plain object.
      try {
        authenticationResponse = JSON.parse(
          JSON.stringify(authenticationResponse)
        );
      } catch (stringifyParseError) {
        // If this fails, we might proceed with a complex object, and existing errors might persist.
        // Consider re-throwing or more robust error handling if this step is critical.
        // For now, we'll let it proceed and the assertion might catch it.
        console.error(
          '[WebAuthnAuthenticator] Error during JSON.parse(JSON.stringify(authenticationResponse)) - proceeding with original object:',
          stringifyParseError
        );
      }

      assertAuthenticationResponse(authenticationResponse);

      // Public key in cose format to register the auth method
      const publicKeyCoseBuffer: Buffer = Buffer.from(
        authenticationResponse.attestedCredentialData.credentialPublicKey.data
      );

      // Encode the public key for contract storage
      publicKey = ethers.utils.hexlify(
        ethers.utils.arrayify(publicKeyCoseBuffer)
      );
    } catch (e) {
      throw new UnknownError(
        {
          cause: e,
        },
        'Error while decoding WebAuthn registration response for public key retrieval. Attestation response not encoded as expected'
      );
    }

    return publicKey;
  }
}

interface ParsedBufferRepresentation {
  type: 'Buffer';
  data: number[];
}

interface AttestedCredentialDataWithParsedPublicKey {
  credentialPublicKey: ParsedBufferRepresentation;
  [key: string]: any;
}

interface AuthenticationResponseWithParsedData {
  attestedCredentialData: AttestedCredentialDataWithParsedPublicKey;
  [key: string]: any;
}

function assertAuthenticationResponse(
  authenticationResponse: unknown
): asserts authenticationResponse is AuthenticationResponseWithParsedData {
  if (
    typeof authenticationResponse !== 'object' ||
    authenticationResponse === null
  ) {
    throw new InvalidArgumentException(
      { info: { authenticationResponse } },
      'authenticationResponse must be an object and not null'
    );
  }

  const ar = authenticationResponse as any;
  if (
    !('attestedCredentialData' in ar) ||
    typeof ar.attestedCredentialData !== 'object' ||
    ar.attestedCredentialData === null
  ) {
    throw new InvalidArgumentException(
      { info: { authenticationResponse } },
      'attestedCredentialData is missing, not an object, or null'
    );
  }

  const acd = ar.attestedCredentialData;
  if (
    !('credentialPublicKey' in acd) ||
    typeof acd.credentialPublicKey !== 'object' ||
    acd.credentialPublicKey === null
  ) {
    throw new InvalidArgumentException(
      { info: { authenticationResponse } },
      'credentialPublicKey is missing, not an object, or null'
    );
  }

  const cpk = acd.credentialPublicKey;

  let dataElementsAreNumbers = false;
  if (Array.isArray(cpk.data)) {
    dataElementsAreNumbers = cpk.data.every((n: any) => typeof n === 'number');
  }

  /* eslint-disable @typescript-eslint/no-explicit-any */
  if (
    cpk.type !== 'Buffer' ||
    !Array.isArray(cpk.data) ||
    !dataElementsAreNumbers
  ) {
    throw new InvalidArgumentException(
      {
        info: {
          authenticationResponse,
          cpk_type: cpk.type,
          cpk_data_isArray: Array.isArray(cpk.data),
          cpk_data_elements_are_numbers: dataElementsAreNumbers,
        },
      },
      'authenticationResponse does not match the expected structure: { attestedCredentialData: { credentialPublicKey: { type: "Buffer", data: number[] } } }'
    );
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
