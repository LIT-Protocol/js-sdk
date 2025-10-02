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
import { AuthMethod, AuthServerTx, Hex } from '@lit-protocol/types';

import { AuthData, PKPData, ScopeStringSchema } from '@lit-protocol/schemas';
import { getRPIdFromOrigin, parseAuthenticatorData } from '../helper/utils';

import { getChildLogger } from '@lit-protocol/logger';
import { z } from 'zod';
import { pollResponse } from '../helper/pollResponse';
import { JobStatusResponse } from '../types';
import { fetchBlockchainData } from '../helper/fetchBlockchainData';

const _logger = getChildLogger({
  module: 'WebAuthnAuthenticator',
});

const handleAuthServerRequest = async <T>(params: {
  serverUrl: string;
  path: '/pkp/mint';
  body: any;
  jobName: string;
  headers?: Record<string, string>;
}): Promise<AuthServerTx<T>> => {
  _logger.info('[WebAuthnAuthenticator][handleAuthServerRequest] called');
  const _body = JSON.stringify(params.body);
  const _url = `${params.serverUrl}${params.path}`;

  const res = await fetch(_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(params.headers || {}),
    },
    body: _body,
  });

  if (res.status === 202) {
    _logger.info(
      `[WebAuthnAuthenticator] ${params.jobName} initiated, polling for completion...`
    );

    const { jobId, message } = await res.json();

    _logger.info({ message }, '[WebAuthnAuthenticator] Server response');

    const statusUrl = `${params.serverUrl}/status/${jobId}`;

    try {
      const completedJobStatus = await pollResponse<JobStatusResponse>({
        url: statusUrl,
        isCompleteCondition: (response) =>
          response.state === 'completed' && response.returnValue != null,
        isErrorCondition: (response) =>
          response.state === 'failed' || response.state === 'error',
        intervalMs: 3000,
        maxRetries: 10,
        errorMessageContext: `${params.jobName} Job ${jobId}`,
      });

      const { returnValue } = completedJobStatus;

      if (!returnValue) {
        throw new Error(
          `${params.jobName} job completed without a return value; please retry or check the auth service logs.`
        );
      }

      return {
        _raw: completedJobStatus,
        txHash: returnValue.hash,
        data: returnValue.data,
      };
    } catch (error: any) {
      console.error(`Error during ${params.jobName} polling:`, error);
      const errMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to ${params.jobName} after polling: ${errMsg}`);
    }
  } else {
    const errorBody = await res.text();
    throw new Error(
      `Failed to initiate ${params.jobName}. Status: ${res.status}, Body: ${errorBody}`
    );
  }
};

export class WebAuthnAuthenticator {
  /**
   * Generate registration options for WebAuthn authentication
   * @params {string} username - Optional username for the WebAuthn credential
   * @params {string} authServiceBaseUrl - The URL of the authentication server
   * @returns {Promise<PublicKeyCredentialCreationOptionsJSON>} - WebAuthn registration options
   */
  public static async getRegistrationOptions(params: {
    username?: string;
    authServiceBaseUrl: string;
  }): Promise<PublicKeyCredentialCreationOptionsJSON> {
    let url = `${params.authServiceBaseUrl}/auth/webauthn/generate-registration-options`;

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
   * Register a new WebAuthn credential & mint a new PKP via the auth server
   *
   * @param {PublicKeyCredentialCreationOptionsJSON} options - Registration options from the server
   * @returns {Promise<AuthData>} - Auth data containing the WebAuthn credential
   */
  public static async registerAndMintPKP(params: {
    username?: string;
    authServiceBaseUrl: string;
    apiKey?: string;
    scopes?: z.infer<typeof ScopeStringSchema>[];
  }): Promise<{
    pkpInfo: PKPData;

    // This is returned in case if you want to craft an authData to mint a PKP via the minWithAuth method
    webAuthnPublicKey: string;
  }> {
    const opts = await WebAuthnAuthenticator.getRegistrationOptions({
      username: params.username,
      authServiceBaseUrl: params.authServiceBaseUrl,
    });

    // Submit registration options to the authenticator
    const { startRegistration } = await import('@simplewebauthn/browser');
    const attResp: RegistrationResponseJSON = await startRegistration(opts);

    // Get auth method pub key
    const authMethodPubkey =
      WebAuthnAuthenticator.getPublicKeyFromRegistration(attResp);

    const authMethodId = await WebAuthnAuthenticator.authMethodId({
      authMethodType: AUTH_METHOD_TYPE.WebAuthn,
      accessToken: JSON.stringify(attResp),
    });

    const authData = {
      authMethodType: AUTH_METHOD_TYPE.WebAuthn,
      authMethodId: authMethodId,
      pubkey: authMethodPubkey,
      scopes: params.scopes,
    };

    // Immediate mint a new PKP to associate with the auth method
    const pkpInfo = await handleAuthServerRequest<PKPData>({
      jobName: 'PKP Minting',
      serverUrl: params.authServiceBaseUrl,
      path: '/pkp/mint',
      body: authData,
      headers: params.apiKey ? { 'x-api-key': params.apiKey } : undefined,
    });

    return {
      pkpInfo: pkpInfo.data,
      webAuthnPublicKey: authMethodPubkey,
    };
  }

  /**
   * Authenticate with a WebAuthn credential and return the relevant authentication data
   *
   * @param {string} params.authServiceBaseUrl - The URL of the authentication server
   * @returns {Promise<AuthData>} - Auth data containing WebAuthn authentication response
   */
  public static async authenticate(): Promise<AuthData> {
    // Turn into byte array
    const latestBlockhash = await fetchBlockchainData();
    const blockHashBytes = ethers.utils.arrayify(latestBlockhash);

    // Construct authentication options
    const rpId = getRPIdFromOrigin(window.location.origin);

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

    return {
      ...authMethod,
      authMethodId,
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
