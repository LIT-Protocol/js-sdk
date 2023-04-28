import { AuthMethod, BaseProviderOptions } from '@lit-protocol/types';
import { AuthMethodType } from '@lit-protocol/constants';
import { ethers } from 'ethers';
import {
  PublicKeyCredentialCreationOptionsJSON,
  UserVerificationRequirement,
} from '@simplewebauthn/typescript-types';
import base64url from 'base64url';
import { getRPIdFromOrigin } from '../utils';
import { BaseProvider } from './BaseProvider';

export default class WebAuthnProvider extends BaseProvider {
  constructor(options: BaseProviderOptions) {
    super(options);
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
   *
   * @returns {Promise<string>} - Mint transaction hash
   */
  public async verifyAndMintPKPThroughRelayer(
    options: PublicKeyCredentialCreationOptionsJSON
  ): Promise<string> {
    // Submit registration options to the authenticator
    const { startRegistration } = await import('@simplewebauthn/browser');
    const attResp = await startRegistration(options);

    // Send the credential to the relying party for verification
    const mintRes = await this.relay.mintPKP(
      AuthMethodType.WebAuthn,
      JSON.stringify({ credential: attResp })
    );
    if (!mintRes || !mintRes.requestId) {
      throw new Error('Missing mint response or request ID from relay server');
    }
    // If the credential was verified and registration successful, minting has kicked off
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
    const provider = new ethers.providers.JsonRpcProvider(this.rpcUrl);

    const block = await provider.getBlock('latest');
    const blockHash = block.hash;

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
}
