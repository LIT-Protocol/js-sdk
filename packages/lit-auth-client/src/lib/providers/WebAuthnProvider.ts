import {
  AuthMethod,
  BaseProviderOptions,
  MintRequestBody,
  WebAuthnProviderOptions,
} from '@lit-protocol/types';
import { AuthMethodType } from '@lit-protocol/constants';
import { ethers } from 'ethers';
import {
  PublicKeyCredentialCreationOptionsJSON,
  UserVerificationRequirement,
} from '@simplewebauthn/typescript-types';
import base64url from 'base64url';
import { getRPIdFromOrigin, parseAuthenticatorData } from '../utils';
import { BaseProvider } from './BaseProvider';
import { RegistrationResponseJSON } from '@simplewebauthn/typescript-types';

export default class WebAuthnProvider extends BaseProvider {
  /**
   * Name of relying party. Defaults to "lit"
   */
  private rpName?: string;

  constructor(options: BaseProviderOptions & WebAuthnProviderOptions) {
    super(options);
    this.rpName = options.rpName || 'lit';
  }

  /**
   * Generate registration options for the browser to pass to a supported authenticator
   *
   * @param {string} username - Username to register credential with
   *
   * @returns {Promise<PublicKeyCredentialCreationOptionsJSON>} - Options to pass to the authenticator
   */
  public async register(
    username?: string
  ): Promise<PublicKeyCredentialCreationOptionsJSON> {
    return await this.relay.generateRegistrationOptions(username);
  }

  /**
   * Mint PKP with verified registration data
   *
   * @param {PublicKeyCredentialCreationOptionsJSON} options - Registration options to pass to the authenticator
   * @param {MintRequestBody} [customArgs] - Extra data to overwrite default params
   *
   * @returns {Promise<string>} - Mint transaction hash
   */
  public async verifyAndMintPKPThroughRelayer(
    options: PublicKeyCredentialCreationOptionsJSON,
    customArgs?: MintRequestBody
  ): Promise<string> {
    // Submit registration options to the authenticator
    const { startRegistration } = await import('@simplewebauthn/browser');
    const attResp: RegistrationResponseJSON = await startRegistration(options);

    // Get auth method id
    const authMethodId = await this.getAuthMethodId({
      authMethodType: AuthMethodType.WebAuthn,
      accessToken: JSON.stringify(attResp),
    });

    // Get auth method pub key
    const authMethodPubkey =
      WebAuthnProvider.getPublicKeyFromRegistration(attResp);

    // Format args for relay server
    const defaultArgs = {
      keyType: 2,
      permittedAuthMethodTypes: [AuthMethodType.WebAuthn],
      permittedAuthMethodIds: [authMethodId],
      permittedAuthMethodPubkeys: [authMethodPubkey],
      permittedAuthMethodScopes: [[ethers.BigNumber.from('1')]],
      addPkpEthAddressAsPermittedAddress: true,
      sendPkpToItself: true,
    };

    const args = {
      ...defaultArgs,
      ...customArgs,
    };

    const body = JSON.stringify(args);

    // Mint PKP
    const mintRes = await this.relay.mintPKP(body);
    if (!mintRes || !mintRes.requestId) {
      throw new Error('Missing mint response or request ID from relay server');
    }

    return mintRes.requestId;
  }

  /**
   * @override
   * This method is not applicable for WebAuthnProvider and should not be used.
   * Use verifyAndMintPKPThroughRelayer instead to mint a PKP for a WebAuthn credential.
   *
   * @throws {Error} - Throws an error when called for WebAuthnProvider.
   */
  public override async mintPKPThroughRelayer(): Promise<string> {
    throw new Error(
      'Use verifyAndMintPKPThroughRelayer for WebAuthnProvider instead.'
    );
  }

  /**
   * Authenticate with a WebAuthn credential and return the relevant authentication data
   *
   * @returns {Promise<AuthMethod>} - Auth method object containing WebAuthn authentication data
   */
  public async authenticate(): Promise<AuthMethod> {
    const blockHash = await this.litNodeClient.getLatestBlockhash();
    // Turn into byte array
    const blockHashBytes = ethers.utils.arrayify(blockHash);

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
      authMethodType: AuthMethodType.WebAuthn,
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
    return WebAuthnProvider.authMethodId(authMethod, this.rpName);
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
      throw new Error(
        `Error when parsing auth method to generate auth method ID for WebAuthn: ${err}`
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
      const authenticationResponse: any =
        parseAuthenticatorData(attestationBuffer);

      // Public key in cose format to register the auth method
      const publicKeyCoseBuffer: Buffer = authenticationResponse
        .attestedCredentialData.credentialPublicKey as Buffer;

      // Encode the public key for contract storage
      publicKey = ethers.utils.hexlify(
        ethers.utils.arrayify(publicKeyCoseBuffer)
      );
    } catch (e) {
      throw new Error(
        `Error while decoding WebAuthn registration response for public key retrieval. Attestation response not encoded as expected: ${e}`
      );
    }

    return publicKey;
  }
}
