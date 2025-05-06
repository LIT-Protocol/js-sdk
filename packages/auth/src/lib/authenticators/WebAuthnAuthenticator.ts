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
import {
  AuthMethod,
  BaseProviderOptions,
  IRelay,
  MintRequestBody,
  WebAuthnProviderOptions,
} from '@lit-protocol/types';

import { BaseAuthenticateConfig, BaseAuthenticator } from './BaseAuthenticator';
import { getRPIdFromOrigin, parseAuthenticatorData } from './utils';
import { AuthMethodTypeStringMap } from '../types';
import { z } from 'zod';
import { HexPrefixedSchema } from '@lit-protocol/schemas';

export type WebAuthnConfig = {
  pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
  method: 'register' | 'authenticate';

  // register config
  relay: IRelay;
  username?: string;
  rpName?: string;
  customArgs?: MintRequestBody;
};

export class WebAuthnAuthenticator {
  public static id = AuthMethodTypeStringMap.WebAuthn;

  /**
   * Name of relying party. Defaults to "lit"
   */
  public rpName?: string;

  constructor(public options: WebAuthnConfig) {
    // super(options);
    this.rpName = options.rpName || 'lit';
  }

  /**
   * Mint PKP with verified registration data
   *
   * @param {PublicKeyCredentialCreationOptionsJSON} options - Registration options to pass to the authenticator
   * @param {MintRequestBody} [customArgs] - Extra data to overwrite default params
   *
   * @returns {Promise<string>} - Mint transaction hash
   */
  // username?: string,
  // customArgs?: MintRequestBody
  public static async register(params: WebAuthnConfig): Promise<string> {
    const _rpName = params.rpName || 'lit';

    const pubKeyCredOpts: PublicKeyCredentialCreationOptionsJSON =
      await params.relay.generateRegistrationOptions(params.username);

    // Submit registration options to the authenticator
    const { startRegistration } = await import('@simplewebauthn/browser');
    const attResp: RegistrationResponseJSON = await startRegistration(
      pubKeyCredOpts
    );

    // Create auth method
    const authMethod = {
      authMethodType: AUTH_METHOD_TYPE.WebAuthn,
      accessToken: JSON.stringify(attResp),
    };

    // Get auth method id
    const authMethodId = await WebAuthnAuthenticator.authMethodId(
      authMethod,
      _rpName
    );

    // Get auth method pub key
    const authMethodPubkey =
      WebAuthnAuthenticator.getPublicKeyFromRegistration(attResp);

    // Format args for relay server
    const defaultArgs = {
      keyType: 2,
      permittedAuthMethodTypes: [AUTH_METHOD_TYPE.WebAuthn],
      permittedAuthMethodIds: [authMethodId],
      permittedAuthMethodPubkeys: [authMethodPubkey],
      permittedAuthMethodScopes: [[ethers.BigNumber.from('1')]],
      addPkpEthAddressAsPermittedAddress: true,
      sendPkpToItself: true,
    };

    const args = {
      ...defaultArgs,
      ...params.customArgs,
    };

    const body = JSON.stringify(args);

    // Mint PKP
    const mintRes = await params.relay.mintPKP(body);
    if (!mintRes || !mintRes.requestId) {
      throw new UnknownError(
        {
          info: {
            mintRes,
          },
        },
        'Missing mint response or request ID from relay server'
      );
    }

    return mintRes.requestId;
  }

  /**
   * Authenticate with a WebAuthn credential and return the relevant authentication data
   *
   * @param {any} [options] - Optional configuration (not used by WebAuthn directly, but allows consistent calling)
   * @returns {Promise<AuthMethod>} - Auth method object containing WebAuthn authentication data
   */
  public static async authenticate(
    params: WebAuthnConfig & { nonce: string }
  ): Promise<AuthMethod> {
    const nonce = params.nonce;

    // Turn into byte array
    const blockHashBytes = ethers.utils.arrayify(nonce);

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

    return authMethod;
  }

  /**
   * Get auth method id that can be used to look up and interact with
   * PKPs associated with the given auth method
   *
   * @param {AuthMethod} authMethod - Auth method object
   *
   * @returns {Promise<string>} - Auth method id
   */
  public async getAuthMethodId(authMethod: AuthMethod): Promise<string> {
    return WebAuthnAuthenticator.authMethodId(authMethod, this.rpName);
  }

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
      // Buffer is COSE formatted, utilities decode the buffer into json, and extract the public key information
      const authenticationResponse = parseAuthenticatorData(attestationBuffer);
      assertAuthenticationResponse(authenticationResponse);

      // Public key in cose format to register the auth method
      const publicKeyCoseBuffer: Buffer = authenticationResponse
        .attestedCredentialData.credentialPublicKey as Buffer;

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

function assertAuthenticationResponse(
  authenticationResponse: unknown
): asserts authenticationResponse is {
  attestedCredentialData: {
    credentialPublicKey: Buffer;
  };
} {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  if (
    typeof authenticationResponse !== 'object' ||
    authenticationResponse === null ||
    !('attestedCredentialData' in authenticationResponse) ||
    typeof (authenticationResponse as any).attestedCredentialData !==
      'object' ||
    (authenticationResponse as any).attestedCredentialData === null ||
    !(
      'credentialPublicKey' in
      (authenticationResponse as any).attestedCredentialData
    ) ||
    !(
      (authenticationResponse as any).attestedCredentialData
        .credentialPublicKey instanceof Buffer
    )
  ) {
    throw new InvalidArgumentException(
      {
        info: {
          authenticationResponse,
        },
      },
      'authenticationResponse does not match the expected structure: { attestedCredentialData: { credentialPublicKey: Buffer } }'
    );
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */
}
