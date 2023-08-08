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
    const body = await this.prepareMintBody(authMethod);
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
    const body = await this.prepareFetchBody(authMethod);
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
   * Generate body for minting PKP through relay server
   *
   * @returns {Promise<string>} - Request body for minting PKP
   */
  protected async prepareMintBody(authMethod: AuthMethod): Promise<string> {
    const authMethodId = await this.getAuthMethodId(authMethod);
    const args = {
      keyType: 2,
      permittedAuthMethodTypes: [authMethod.authMethodType],
      permittedAuthMethodIds: [authMethodId],
      permittedAuthMethodPubkeys: authMethod?.pubkey
        ? [authMethod?.pubkey]
        : ['0x'],
      permittedAuthMethodScopes: [[ethers.BigNumber.from('0')]],
      addPkpEthAddressAsPermittedAddress: true,
      sendPkpToItself: true,
    };
    const body = JSON.stringify(args);
    return body;
  }

  /**
   * Generate body for fetching PKPs by auth method through relay server
   *
   * @returns {Promise<string>} - Request body for fetching PKPs by auth method
   */
  protected async prepareFetchBody(authMethod: AuthMethod): Promise<string> {
    const authMethodId = await this.getAuthMethodId(authMethod);
    const args = {
      authMethodId,
      authMethodType: authMethod.authMethodType,
      authMethodPubKey: authMethod?.pubkey,
    };
    const body = JSON.stringify(args);
    return body;
  }
}
