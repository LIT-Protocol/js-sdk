import { ALL_LIT_CHAINS, AuthMethodType } from '@lit-protocol/constants';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  AuthCallbackParams,
  AuthMethod,
  AuthSig,
  AuthenticateOptions,
  BaseProviderOptions,
  BaseProviderSessionSigsParams,
  IRelay,
  IRelayPKP,
  SessionSigs,
  SignSessionKeyResponse,
} from '@lit-protocol/types';

export abstract class BaseProvider {
  /**
   * Endpoint to interact with a blockchain network. Defaults to the Lit Chronicle.
   */
  public rpcUrl: string;
  /**
   * Relay server to subsidize minting of PKPs
   */
  public relay: IRelay;
  /**
   * Client to connect to Lit nodes
   */
  public litNodeClient: LitNodeClient;

  constructor(options: BaseProviderOptions) {
    this.rpcUrl = options.rpcUrl;
    this.relay = options.relay;
    this.litNodeClient = options.litNodeClient;
  }

  /**
   * Authenticate the user based on the provider-specific implementation and return the relevant authentication data
   *
   * @template T - Type representing the specific options for the authenticate method
   * @param {T} [options] - Optional parameters that vary based on the provider
   * @returns {Promise<AuthMethod>} - Auth method object that contains authentication data
   */
  abstract authenticate<T extends AuthenticateOptions>(
    options?: T
  ): Promise<AuthMethod>;

  /**
   * Mint a new PKP for the given auth method through the relay server
   *
   * @param {AuthMethod} authMethod
   * @param {AuthMethodType} authMethod.authMethodType - Auth method type
   * @param {string} authMethod.accessToken - Auth method access token
   *
   * @returns {Promise<string>} - Mint transaction hash
   */
  public async mintPKPThroughRelayer(authMethod: AuthMethod): Promise<string> {
    const mintParams = this.prepareRelayBody(authMethod);
    const mintRes = await this.relay.mintPKP(
      authMethod.authMethodType,
      mintParams
    );
    if (!mintRes || !mintRes.requestId) {
      throw new Error('Missing mint response or request ID from relay server');
    }
    return mintRes.requestId;
  }

  /**
   * Fetch PKPs associated with given auth method from relay server
   *
   * @param {AuthMethod} authMethod - Auth method object
   *
   * @returns {Promise<IRelayPKP[]>} - Array of PKPs
   */
  public async fetchPKPsThroughRelayer(
    authMethod: AuthMethod
  ): Promise<IRelayPKP[]> {
    const fetchParams = this.prepareRelayBody(authMethod);
    const fetchRes = await this.relay.fetchPKPs(
      authMethod.authMethodType,
      fetchParams
    );
    if (!fetchRes || !fetchRes.pkps) {
      throw new Error('Missing PKPs in fetch response from relay server');
    }
    return fetchRes.pkps;
  }

  /**
   * Generate session sigs for given auth method and PKP
   *
   * @param {BaseProviderSessionSigsParams} params
   * @param {string} params.pkpPublicKey - Public key of PKP to auth with
   * @param {AuthMethod} params.authMethod - Auth method verifying ownership of PKP
   * @param {GetSessionSigsProps} params.sessionSigsParams - Params for getSessionSigs function
   * @param {LitNodeClient} [params.litNodeClient] - Lit Node Client to use. If not provided, will use an existing Lit Node Client or create a new one
   *
   * @returns {Promise<SessionSigs>} - Session sigs
   */
  public async getSessionSigs(
    params: BaseProviderSessionSigsParams
  ): Promise<SessionSigs> {
    // Use provided LitNodeClient or create a new one
    if (params.litNodeClient && params.litNodeClient instanceof LitNodeClient) {
      this.litNodeClient = params.litNodeClient;
    }
    // Connect to LitNodeClient if not already connected
    if (!this.litNodeClient.ready) {
      await this.litNodeClient.connect();
    }

    let authNeededCallback = params.sessionSigsParams.authNeededCallback;

    // If no authNeededCallback is provided, create one that uses the provided PKP and auth method
    // to sign a session key and return an auth sig
    if (!authNeededCallback) {
      const nodeClient = this.litNodeClient;

      authNeededCallback = async (
        authCallbackParams: AuthCallbackParams
      ): Promise<AuthSig> => {
        let chainId = 1;
        try {
          const chainInfo = ALL_LIT_CHAINS[authCallbackParams.chain];
          // @ts-expect-error - chainId is not defined on the type
          chainId = chainInfo.chainId;
        } catch {
          // Do nothing
        }

        let response: SignSessionKeyResponse;

        if (params.authMethod.authMethodType === AuthMethodType.EthWallet) {
          const authSig = JSON.parse(params.authMethod.accessToken);
          response = await nodeClient.signSessionKey({
            sessionKey: params.sessionSigsParams.sessionKey,
            authMethods: [],
            authSig: authSig,
            pkpPublicKey: params.pkpPublicKey,
            expiration: authCallbackParams.expiration,
            resources: authCallbackParams.resources,
            chainId,
          });
        } else {
          response = await nodeClient.signSessionKey({
            sessionKey: params.sessionSigsParams.sessionKey,
            authMethods: [params.authMethod],
            pkpPublicKey: params.pkpPublicKey,
            expiration: authCallbackParams.expiration,
            resources: authCallbackParams.resources,
            chainId,
          });
        }

        return response.authSig;
      };
    }

    // Generate session sigs with the given session params
    const sessionSigs = await this.litNodeClient.getSessionSigs({
      ...params.sessionSigsParams,
      authNeededCallback,
    });

    return sessionSigs;
  }

  /**
   * Prepare auth method body for relay server
   *
   * @param {AuthMethod} authMethod - Auth method object
   *
   * @returns {string} - Auth method body for relay server
   */
  protected prepareRelayBody(authMethod: AuthMethod): string {
    switch (authMethod.authMethodType) {
      case AuthMethodType.Discord:
        return JSON.stringify({ accessToken: authMethod.accessToken });
      case AuthMethodType.GoogleJwt:
        return JSON.stringify({ idToken: authMethod.accessToken });
      case AuthMethodType.EthWallet:
        return authMethod.accessToken; // Auth sig is a JSON string
      case AuthMethodType.WebAuthn:
        return authMethod.accessToken; // Auth data is a JSON string
      case AuthMethodType.OTP:
        return JSON.stringify(authMethod);
      case AuthMethodType.StytchOtp:
        return JSON.stringify(authMethod);
      default:
        throw new Error(
          `Invalid auth method type "${authMethod.authMethodType}" passed`
        );
    }
  }
}
