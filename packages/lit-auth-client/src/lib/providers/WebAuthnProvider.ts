import { AuthMethod, BaseProviderOptions, IRelay } from '@lit-protocol/types';
import { AuthMethodType } from '@lit-protocol/constants';
import { ethers } from 'ethers';
import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
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
  public override async mintPKPThroughRelayer(
    authMethod: AuthMethod
  ): Promise<string> {
    throw new Error(
      'Use verifyAndMintPKPThroughRelayer for WebAuthnProvider instead.'
    );
  }

  /**
   * Authenticate with WebAuthn
   *
   * @param {string} [rpcUrl] - RPC URL to use for getting latest block hash
   *
   * @returns {Promise<AuthMethod>} - Auth method object containing WebAuthn auth data
   */
  public async authenticate(): Promise<AuthMethod> {
    const provider = new ethers.providers.JsonRpcProvider(this.rpcUrl);

    const block = await provider.getBlock('latest');
    const blockHash = block.hash;

    // Turn into byte array.
    const blockHashBytes = ethers.utils.arrayify(blockHash);

    // Construct authentication options.
    const rpId = getRPIdFromOrigin(window.location.origin);

    const authenticationOptions = {
      challenge: base64url(Buffer.from(blockHashBytes)),
      timeout: 60000,
      userVerification: 'required' as UserVerificationRequirement,
      rpId,
    };

    // Authenticate with WebAuthn
    const authenticationResponse = await startAuthentication(
      authenticationOptions
    );

    // BUG: We need to make sure userHandle is base64url encoded. Deep copy the authentication response.
    const actualAuthenticationResponse = JSON.parse(
      JSON.stringify(authenticationResponse)
    );
    actualAuthenticationResponse.response.userHandle = base64url.encode(
      // @ts-ignore
      authenticationResponse.response.userHandle
    );

    const authMethod = {
      authMethodType: AuthMethodType.WebAuthn,
      accessToken: JSON.stringify(actualAuthenticationResponse),
    };

    return authMethod;
  }
}
