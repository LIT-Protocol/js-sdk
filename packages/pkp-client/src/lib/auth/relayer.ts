import {
  RelayerConfig,
  AuthMethodType,
  RelayFetchResponse,
  RelayMintResponse,
  RelayPollStatusResponse,
  AUTH_CLIENT_EVENTS,
} from './types';
import { EventEmitter } from 'events';

/**
 * Class that communicates with a relay server
 */
export class Relayer {
  /**
   * URL for relay server
   */
  public readonly relayUrl: string;
  /**
   * API key for relay server (required when using Lit's relay server)
   */
  private readonly relayApiKey: string;

  public events: EventEmitter = new EventEmitter();

  /**
   * Create a Relayer instance
   *
   * @param {RelayerConfig} config - Configuration object
   * @param {string} config.relayUrl - URL for relay server
   * @param {string} config.relayApiKey - API key for relay server
   */
  constructor(config: RelayerConfig) {
    this.relayUrl = config.relayUrl
      ? config.relayUrl
      : 'https://relay-server-staging.herokuapp.com/';
    this.relayApiKey = config.relayApiKey ? config.relayApiKey : '';
  }

  // -- Relayer methods --

  /**
   * Fetch PKPs associated with the given auth method
   *
   * @param {AuthMethodType} authMethodType - Auth method type
   * @param {string} body - Body of the request
   *
   * @returns Response from the relay server
   */
  public async fetchPKPs(
    authMethodType: AuthMethodType,
    body: string
  ): Promise<RelayFetchResponse> {
    const route = this._getFetchPKPsRoute(authMethodType);
    const response = await fetch(`${this.relayUrl}${route}`, {
      method: 'POST',
      headers: {
        'api-key': this.relayApiKey,
        'Content-Type': 'application/json',
      },
      body: body,
    });

    if (response.status < 200 || response.status >= 400) {
      console.warn('Something wrong with the API call', await response.json());
      // console.log("Uh oh, something's not quite right.");
      const err = new Error('Unable to fetch PKPs through relay server');
      this.events.emit(AUTH_CLIENT_EVENTS.ERROR, err);
      throw err;
    } else {
      const resBody = await response.json();
      console.log('Response OK', { body: resBody });
      console.log('Successfully fetched PKPs with relayer');
      return resBody;
    }
  }

  /**
   * Mint a new PKP for the given auth method
   *
   * @param {AuthMethodType} authMethodType - Auth method type
   * @param {string} body - Body of the request
   *
   * @returns Response from the relay server
   */
  public async mintPKP(
    authMethodType: AuthMethodType,
    body: string
  ): Promise<RelayMintResponse> {
    this.events.emit(AUTH_CLIENT_EVENTS.MINTING, { body });

    const route = this._getMintPKPRoute(authMethodType);
    const response = await fetch(`${this.relayUrl}${route}`, {
      method: 'POST',
      headers: {
        'api-key': this.relayApiKey,
        'Content-Type': 'application/json',
      },
      body: body,
    });

    if (response.status < 200 || response.status >= 400) {
      console.warn('Something wrong with the API call', await response.json());
      const err = new Error('Unable to mint PKP through relay server');
      this.events.emit(AUTH_CLIENT_EVENTS.ERROR, err);
      throw err;
    } else {
      const resBody = await response.json();
      console.log('Response OK', { body: resBody });
      console.log('Successfully initiated minting PKP with relayer');
      return resBody;
    }
  }

  /**
   * Poll the relay server for status of minting request
   *
   * @param {string} requestId - Request ID to poll, likely the minting transaction hash
   *
   * @returns Response from the relay server
   */
  public async pollRequestUntilTerminalState(
    requestId: string
  ): Promise<RelayPollStatusResponse> {
    const maxPollCount = 20;
    for (let i = 0; i < maxPollCount; i++) {
      this.events.emit(AUTH_CLIENT_EVENTS.POLLING, {
        pollCount: i,
        requestId: requestId,
      });

      const response = await fetch(
        `${this.relayUrl}/auth/status/${requestId}`,
        {
          method: 'GET',
          headers: {
            'api-key': this.relayApiKey,
          },
        }
      );

      if (response.status < 200 || response.status >= 400) {
        console.warn(
          'Something wrong with the API call',
          await response.json()
        );
        const err = new Error(
          `Unable to poll the status of this mint PKP transaction: ${requestId}`
        );
        this.events.emit(AUTH_CLIENT_EVENTS.ERROR, err);
        throw err;
      }

      const resBody = await response.json();
      console.log('Response OK', { body: resBody });

      if (resBody.error) {
        // exit loop since error
        console.warn('Something wrong with the API call', {
          error: resBody.error,
        });
        const err = new Error(resBody.error);
        this.events.emit(AUTH_CLIENT_EVENTS.ERROR, err);
        throw err;
      } else if (resBody.status === 'Succeeded') {
        // exit loop since success
        console.info('Successfully authed', { ...resBody });
        this.events.emit(AUTH_CLIENT_EVENTS.MINTED, { ...resBody });
        return resBody;
      }

      // otherwise, sleep then continue polling
      await new Promise((r) => setTimeout(r, 15000));
    }

    // at this point, polling ended and still no success, set failure status
    // console.error(`Hmm this is taking longer than expected...`);
    const err = new Error('Polling for mint PKP transaction status timed out');
    this.events.emit(AUTH_CLIENT_EVENTS.ERROR, err);
    throw err;
  }

  /**
   * Get route for fetching PKPs
   *
   * @param {AuthMethodType} authMethodType - Auth method type
   *
   * @returns route
   */
  private _getFetchPKPsRoute(authMethodType: AuthMethodType): string {
    switch (authMethodType) {
      case AuthMethodType.EthWallet:
        return '/auth/wallet/userinfo';
      case AuthMethodType.Discord:
        return '/auth/discord/userinfo';
      case AuthMethodType.GoogleJwt:
        return '/auth/google/userinfo';
      default:
        throw new Error(
          `Auth method type "${authMethodType}" is not supported. Please refer to the type AuthMethodType to see which enum values are available.`
        );
    }
  }

  /**
   * Get route for minting PKPs
   *
   * @param {AuthMethodType} authMethodType - Auth method type
   *
   * @returns route
   */
  private _getMintPKPRoute(authMethodType: AuthMethodType): string {
    switch (authMethodType) {
      case AuthMethodType.EthWallet:
        return '/auth/wallet';
      case AuthMethodType.Discord:
        return '/auth/discord';
      case AuthMethodType.GoogleJwt:
        return '/auth/google';
      default:
        throw new Error(
          `Auth method type "${authMethodType}" is not supported`
        );
    }
  }

  // --- Event listener methods ---
  /**
   * Register an event listener that will be invoked every time the named event is emitted
   *
   * @param {string} event - Event name
   * @param {Function} listener - Callback function
   */
  public on(event: string, listener: any): void {
    this.events.on(event, listener);
  }
}
