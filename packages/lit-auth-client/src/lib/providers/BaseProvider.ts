import { ALL_LIT_CHAINS, AuthMethodType } from '@lit-protocol/constants';
import { LitNodeClient } from '@lit-protocol/lit-node-client';
import { LitStorage } from '@lit-protocol/lit-storage';
import {
  AuthCallbackParams,
  AuthMethod,
  AuthSig,
  AuthenticateOptions,
  BaseProviderOptions,
  BaseProviderSessionSigsParams,
  IRelay,
  IRelayPKP,
  IRelayRequestData,
  SessionSigs,
  SignSessionKeyResponse,
} from '@lit-protocol/types';
import { ethers } from 'ethers';

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

  public storageProvider: LitStorage;

  /**
   * Handle both V2 and V3 versions of the access token, using different storage keys for each:
   * - V2: `lit-auth-signature`
   * - V3: `lit-ethwallet-token-<address>`
   * By default, @getlit/sdk would go for V3, but the primitive would stay with V2.
   */
  public version?: 'V2' | 'V3';

  constructor(options: BaseProviderOptions) {
    this.rpcUrl = options.rpcUrl;
    this.relay = options.relay;
    this.litNodeClient = options.litNodeClient;
    this.storageProvider = options.storageProvider;
    this.version = options.version ?? 'V2';
  }

  /**
   * (Sync Operation) Derive UID for storage from authentication material produced by auth providers
   *
   * @returns { string } - storage UID
   * @param accessToken
   */
  abstract getAuthMethodStorageUID(accessToken?: string | AuthSig): string;

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
   * Get auth method id that can be used to look up and interact with
   * PKPs associated with the given auth method
   *
   * @param {AuthMethod} authMethod - Auth method object
   * @param {any} [options] - Optional parameters that vary based on the provider
   *
   * @returns {Promise<string>} - Auth method id
   */
  abstract getAuthMethodId(
    authMethod: AuthMethod,
    options?: any
  ): Promise<string>;

  /**
   * Mint a new PKP for the given auth method through the relay server
   *
   * @param {AuthMethod} authMethod - Auth method object
   *
   * @returns {Promise<string>} - Mint transaction hash
   */
  public async mintPKPThroughRelayer(authMethod: AuthMethod): Promise<string> {
    const data = await this.prepareRelayRequestData(authMethod);
    const body = this.prepareMintBody(data);
    const mintRes = await this.relay.mintPKP(body);
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
    const data = await this.prepareRelayRequestData(authMethod);
    const body = this.prepareFetchBody(data);
    const fetchRes = await this.relay.fetchPKPs(body);
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
            statement: authCallbackParams.statement,
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
            statement: authCallbackParams.statement,
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
   * Generate request data for minting and fetching PKPs via relay server
   *
   * @param {AuthMethod} authMethod - Auth method obejct
   *
   * @returns {Promise<IRelayRequestData>} - Relay request data
   */
  protected async prepareRelayRequestData(
    authMethod: AuthMethod
  ): Promise<IRelayRequestData> {
    const authMethodType = authMethod.authMethodType;
    const authMethodId = await this.getAuthMethodId(authMethod);
    const data = {
      authMethodType,
      authMethodId,
    };
    return data;
  }

  /**
   * Generate request body for minting PKP using auth methods via relay server
   *
   * @param {IRelayRequestData} data - Data for minting PKP
   * @param {number} data.authMethodType - Type of auth method
   * @param {string} data.authMethodId - ID of auth method
   * @param {string} [data.authMethodPubKey] - Public key associated with the auth method (used only in WebAuthn)
   *
   * @returns {string} - Relay request body for minting PKP
   */
  protected prepareMintBody(data: IRelayRequestData): string {
    const pubkey = data.authMethodPubKey || '0x';
    const args = {
      keyType: 2,
      permittedAuthMethodTypes: [data.authMethodType],
      permittedAuthMethodIds: [data.authMethodId],
      permittedAuthMethodPubkeys: [pubkey],
      permittedAuthMethodScopes: [[ethers.BigNumber.from('0')]],
      addPkpEthAddressAsPermittedAddress: true,
      sendPkpToItself: true,
    };
    const body = JSON.stringify(args);
    return body;
  }

  /**
   * Generate request body to fetch PKPs using auth method info via relay server
   *
   * @param {IRelayRequestData} data - Data for fetching PKP
   * @param {string} data.authMethodType - Type of auth method
   * @param {string} data.authMethodId - ID of auth method
   * @param {string} [data.authMethodPubKey] - Public key associated with the auth method (used only in WebAuthn)
   *
   * @returns {string} - Relay request body to fetch PKPs
   */
  protected prepareFetchBody(data: IRelayRequestData): string {
    const args = {
      authMethodId: data.authMethodId,
      authMethodType: data.authMethodType,
      authMethodPubKey: data.authMethodPubKey,
    };
    const body = JSON.stringify(args);
    return body;
  }
}
