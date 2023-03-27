import {
  AuthOptions,
  SignOutOptions,
  RelayPollStatusResponse,
  RelayPollingEvent,
  AuthState,
  AUTH_CLIENT_EVENTS,
  HandleSignInRedirectParams,
  SessionSigs,
  AuthMethodType,
  PKP,
  FetchPKPByAuthMethodParams,
  WalletAuthParams,
} from './types';
import { Relayer } from './relayer';
import { Store } from './store';
import { EventEmitter } from 'events';
import {
  decode,
  getStateParam,
  isOAuthProviderSupported,
  removeStateParam,
  parseLoginParams,
  prepareLoginUrl,
} from './utils';

import { GoogleProvider } from './providers/google';
import { DiscordProvider } from './providers/discord';
import { WalletProvider } from './providers/wallet';

import { LitNodeClient } from '@lit-protocol/lit-node-client';
import {
  checkAndSignAuthMessage,
  ethConnect,
} from '@lit-protocol/auth-browser';

/**
 * Class that handles authentication and session key creation for Lit PKPs
 */
export class Auth {
  /**
   * Your application's domain
   */
  public readonly domain: string;
  /**
   * The redirect URI that Lit's auth server should send the user back to
   */
  public readonly redirectUri: string;
  /**
   * Client to connect to Lit nodes
   */
  public litNodeClient: LitNodeClient;
  /**
   * Relayer to facilitate and subsidize minting of PKPs
   */
  public relayer: Relayer;
  /**
   * State manager to store, update, and retrieve auth state
   */
  public store: Store;
  /**
   * Event emitter to subscribe and publish events
   */
  public events: EventEmitter = new EventEmitter();
  /**
   * Provider that handles Google login
   */
  private googleProvider: GoogleProvider;
  /**
   * Provider that handles Discord login
   */
  private discordProvider: DiscordProvider;
  /**
   * Provider that handles Discord login
   */
  private walletProvider: WalletProvider;

  constructor(options: AuthOptions) {
    if (!options.litNodeClient) {
      throw new Error('LitNodeClient is required');
    }

    this.domain = options.domain;
    this.redirectUri = options.redirectUri;

    this.litNodeClient = options.litNodeClient;
    this.relayer = new Relayer(options.relayConfig);
    this.store = new Store();

    this.googleProvider = new GoogleProvider(this);
    this.discordProvider = new DiscordProvider(this);
    this.walletProvider = new WalletProvider(this);

    this._connectLitNodeClient();
    this._registerEventListeners();
  }

  /**
   * Create session signatures for a given authorized Eth Wallet
   *
   * @param {WalletAuthParams} params
   * @param {AuthSig} params.authSig - Signature of authorized wallet
   * @param {SessionParams} params.sessionParams - Parameters for creating session signatures
   * @param {string} [params.pkpPublicKey] - Public key of PKP to use for creating session signatures
   *
   * @returns {Promise<SessionSigs>} - Session signatures
   */
  public async signInWithEthWallet(
    params: WalletAuthParams
  ): Promise<SessionSigs> {
    try {
      let authSig = params.authSig;
      if (!authSig) {
        authSig = await checkAndSignAuthMessage({ chain: 'ethereum' });
      }
      const sessionSigs = await this.walletProvider.createSession(params);
      return sessionSigs;
    } catch (err) {
      return this._emitAndThrowError(err);
    }
  }

  /**
   * Redirect user to the given social login provider's authorization page
   *
   * @param {string} provider - Social login provider to use
   */
  public signInWithSocial(provider: string): void {
    // Check if provider is supported
    if (!isOAuthProviderSupported(provider)) {
      return this._emitAndThrowError(
        new Error(
          `Invalid OAuth provider: ${provider}. Please ensure that the given provider is either 'google' and 'discord'.`
        )
      );
    }
    try {
      // Get login url
      const loginUrl = prepareLoginUrl(provider, this.redirectUri);
      // Redirect to login url
      window.location.assign(loginUrl);
    } catch (err) {
      return this._emitAndThrowError(err);
    }
  }

  /**
   * Create session signatures for the given parameters returned from Lit's login server
   *
   * @param {HandleSignInRedirectParams} params
   * @param {SessionParams} params.sessionParams - Parameters for creating session signatures
   * @param {string} [params.pkpPublicKey] - Public key of PKP to use for creating session signatures
   *
   * @returns {Promise<SessionSigs>} - Session signatures
   */
  public async handleSignInRedirect(
    params: HandleSignInRedirectParams
  ): Promise<SessionSigs> {
    // Check if current url matches redirect uri
    if (!window.location.href.startsWith(this.redirectUri)) {
      return this._emitAndThrowError(
        new Error(
          `Current url "${window.location.href}" does not match provided redirect uri "${this.redirectUri}"`
        )
      );
    }

    // Check url for params
    const { provider, accessToken, idToken, state, error } = parseLoginParams(
      window.document.location.search
    );

    // Check if there's an error
    if (error) {
      return this._emitAndThrowError(new Error(error));
    }

    // Check if provider exists and is supported
    if (!provider || !isOAuthProviderSupported(provider)) {
      return this._emitAndThrowError(
        new Error(
          `Invalid OAuth provider "${provider}" passed in redirect callback URL`
        )
      );
    }

    // Check if state param matches
    if (!state || decode(decodeURIComponent(state)) !== getStateParam()) {
      return this._emitAndThrowError(
        new Error(
          `Invalid state parameter "${state}" passed in redirect callback URL`
        )
      );
    }
    removeStateParam();

    // Clear params from url
    window.history.replaceState({}, document.title, this.redirectUri);

    // Handle provider-specific logic
    try {
      switch (provider) {
        case 'discord':
          return await this.discordProvider.createSession({
            ...params,
            accessToken,
          });
        case 'google':
          return await this.googleProvider.createSession({
            ...params,
            idToken,
          });
        default:
          return this._emitAndThrowError(
            new Error(
              `Invalid OAuth provider "${provider}" passed in redirect callback URL`
            )
          );
      }
    } catch (err) {
      return this._emitAndThrowError(err);
    }
  }

  /**
   * Check if current url is redirect uri to determine if app was redirected back from external login page
   *
   * @returns {boolean} - True if current url is redirect uri
   */
  public isSignInRedirect(): boolean {
    // Check if current url matches redirect uri
    const isRedirectUri = window.location.href.startsWith(this.redirectUri);
    if (!isRedirectUri) {
      return false;
    }
    // Check url for redirect params
    const { provider, accessToken, idToken, state, error } = parseLoginParams(
      window.document.location.search
    );
    // Check if current url is redirect uri and has redirect params
    if (
      isRedirectUri &&
      (provider || accessToken || idToken || state || error)
    ) {
      return true;
    }
    return false;
  }

  /**
   * Clear session and redirect to given url if provided
   *
   * @param {SignOutOptions} options - Logout options
   * @param {string} [params.redirectTo] - Url to redirect to after logout
   */
  public signOut(options: SignOutOptions = {}): void {
    // Clear existing auth state
    this.store.clear();
    // Remove auth sigs from local storage
    try {
      ethConnect.disconnectWeb3();
    } catch {
      // do nothing
    }
    this.events.emit(AUTH_CLIENT_EVENTS.SIGNED_OUT);
    // Redirect to given url
    if (options.redirectTo) {
      window.location.assign(options.redirectTo);
    }
  }

  /**
   * Check if session signatures exist and if they are still valid. If they have expired, sign out and return null.
   *
   * @returns {SessionSigs} - Session signatures
   */
  public checkSession(): SessionSigs | null {
    const sessionExpiration = this.store.getSessionExpiration();
    if (sessionExpiration) {
      const now = new Date();
      const expiration = new Date(sessionExpiration);
      if (now < expiration) {
        // Session signatures are still valid
        return this.store.getSessionSigs();
      } else {
        // Session signatures have expired so sign out
        this.signOut();
        return null;
      }
    } else {
      return null;
    }
  }

  /**
   * Get information about the authenticated user
   *
   * @returns {AuthState} - Authenticated user info
   */
  public getAuthState(): AuthState {
    return this.store.getAuthState();
  }

  /**
   * Fetch PKPs associated with given auth method type and credential through the relay server
   *
   * @param {FetchPKPByAuthMethodParams} params - Parameters for fetching PKPs
   * @param {AuthMethodType} params.authMethodType - Auth method enum
   * @param {string} [params.accessToken] - Access token
   * @param {string} [params.idToken] - ID token
   * @param {string} [params.authSig] - Wallet signature
   */
  public async fetchPKPsThroughRelayer(
    params: FetchPKPByAuthMethodParams
  ): Promise<PKP[]> {
    let fetchRes;
    try {
      switch (params.authMethodType) {
        case AuthMethodType.Discord:
          if (!params.accessToken) {
            return this._emitAndThrowError(
              new Error('Missing Discord access token for fetching PKPs')
            );
          }
          fetchRes = await this.relayer.fetchPKPs(
            AuthMethodType.Discord,
            JSON.stringify({
              accessToken: params.accessToken,
            })
          );
          break;
        case AuthMethodType.GoogleJwt:
          if (!params.idToken) {
            return this._emitAndThrowError(
              new Error('Missing Google ID token for fetching PKPs')
            );
          }
          fetchRes = await this.relayer.fetchPKPs(
            AuthMethodType.GoogleJwt,
            JSON.stringify({
              idToken: params.idToken,
            })
          );
          break;
        case AuthMethodType.EthWallet:
          if (!params.authSig) {
            return this._emitAndThrowError(
              new Error('Missing wallet signature for fetching PKPs')
            );
          }
          fetchRes = await this.relayer.fetchPKPs(
            AuthMethodType.EthWallet,
            JSON.stringify({
              authSig: params.authSig,
            })
          );
          break;
        default:
          return this._emitAndThrowError(
            new Error('Invalid auth method type: ' + params.authMethodType)
          );
      }
    } catch (err) {
      return this._emitAndThrowError(err);
    }

    const { pkps } = fetchRes;
    if (!pkps) {
      return this._emitAndThrowError(
        new Error('Missing PKPs in fetch PKPs response')
      );
    }
    return pkps;
  }

  /**
   * Emit error event and throw error
   *
   * @param error - Error to emit and throw
   */
  private _emitAndThrowError(error: unknown): never {
    this.events.emit(AUTH_CLIENT_EVENTS.ERROR, error);
    throw error;
  }

  /**
   * Connect to LitNode client
   */
  private async _connectLitNodeClient(): Promise<void> {
    if (!this.litNodeClient.ready) {
      await this.litNodeClient.connect();
    }
  }

  // --- Event listener methods ---
  /**
   * Register an event listener that will be invoked every time the named event is emitted
   *
   * @param {string} event - Event name
   * @param {Function} listener - Callback function
   *
   * @returns {EventEmitter} - EventEmitter instance
   */
  public on(event: string, listener: any): EventEmitter {
    return this.events.on(event, listener);
  }

  /**
   * Register a listener that is called at most once for a particular event
   *
   * @param {string} event - Event name
   * @param {Function} listener - Callback function
   *
   * @returns {EventEmitter} - EventEmitter instance
   */
  public once(event: string, listener: any): EventEmitter {
    return this.events.once(event, listener);
  }

  /**
   * Removes an instance of the specified listener from the listener array for the event
   *
   * @param {string} event - Event name
   * @param {Function} listener - Callback function
   *
   * @returns {EventEmitter} - EventEmitter instance
   */
  public off(event: string, listener: any): EventEmitter {
    return this.events.off(event, listener);
  }

  /**
   * Removes all listeners, or those of the specified event
   *
   * @param {string }event - Event name
   *
   * @returns {EventEmitter} - EventEmitter instance
   */
  public removeAllListeners(event?: string): EventEmitter {
    return this.events.removeAllListeners(event);
  }

  /**
   * Subscribe to relayer events
   */
  private _registerEventListeners(): void {
    // Pass auth method name
    this.relayer.on(AUTH_CLIENT_EVENTS.MINTING, (data: { body: string }) => {
      this.events.emit(AUTH_CLIENT_EVENTS.MINTING, data);
    });

    // Pass transaction hash
    this.relayer.on(AUTH_CLIENT_EVENTS.POLLING, (data: RelayPollingEvent) => {
      this.events.emit(AUTH_CLIENT_EVENTS.POLLING, data);
    });

    // Pass minted PKP data
    this.relayer.on(
      AUTH_CLIENT_EVENTS.MINTED,
      (data: RelayPollStatusResponse) => {
        this.events.emit(AUTH_CLIENT_EVENTS.MINTED, data);
      }
    );

    // Pass error
    this.relayer.on(AUTH_CLIENT_EVENTS.ERROR, (err: unknown) => {
      this.events.emit(AUTH_CLIENT_EVENTS.ERROR, err);
    });
  }
}
