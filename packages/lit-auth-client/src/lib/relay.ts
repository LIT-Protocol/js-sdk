import {
  IRelay,
  IRelayFetchResponse,
  IRelayMintResponse,
  IRelayPollStatusResponse,
  LitRelayConfig,
} from '@lit-protocol/types';

/**
 * Class that communicates with Lit relay server
 */
export class LitRelay implements IRelay {
  /**
   * URL for Lit's relay server
   */
  private readonly relayUrl: string;
  /**
   * API key for Lit's relay server
   */
  private readonly relayApiKey: string;
  /**
   * Route for minting PKP
   */
  private readonly mintRoute = '/mint-next-and-add-auth-methods';
  /**
   * Route for fetching PKPs
   */
  private readonly fetchRoute = '/fetch-pkps-by-auth-method';

  /**
   * Create a Relay instance
   *
   * @param {LitRelayConfig} config
   * @param {string} [config.relayApiKey] - API key for Lit's relay server
   * @param {string} [config.relayUrl] - URL for Lit's relay server
   */
  constructor(config: LitRelayConfig) {
    this.relayUrl =
      config.relayUrl || 'https://relayer-server-staging-cayenne.getlit.dev';
    this.relayApiKey = config.relayApiKey || '';
    console.log("Lit's relay server URL:", this.relayUrl);
  }

  /**
   * Mint a new PKP for the given auth method
   *
   * @param {string} body - Body of the request
   *
   * @returns {Promise<IRelayMintResponse>} Response from the relay server
   */
  public async mintPKP(body: string): Promise<IRelayMintResponse> {
    const response = await fetch(`${this.relayUrl}${this.mintRoute}`, {
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
      throw err;
    } else {
      const resBody = await response.json();
      console.log('Successfully initiated minting PKP with relayer');
      return resBody;
    }
  }

  /**
   * Poll the relay server for status of minting request
   *
   * @param {string} requestId - Request ID to poll, likely the minting transaction hash
   * @param {number} [pollInterval] - Polling interval in milliseconds
   * @param {number} [maxPollCount] - Maximum number of times to poll
   *
   * @returns {Promise<IRelayPollStatusResponse>} Response from the relay server
   */
  public async pollRequestUntilTerminalState(
    requestId: string,
    pollInterval: number = 15000,
    maxPollCount: number = 20
  ): Promise<IRelayPollStatusResponse> {
    for (let i = 0; i < maxPollCount; i++) {
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
        console.log('GOT TRIGGERED!?');

        console.warn(
          'Something wrong with the API call',
          await response.json()
        );
        const err = new Error(
          `Unable to poll the status of this mint PKP transaction: ${requestId}`
        );
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
        throw err;
      } else if (resBody.status === 'Succeeded') {
        // exit loop since success
        console.info('Successfully authed', { ...resBody });
        return resBody;
      }

      // otherwise, sleep then continue polling
      await new Promise((r) => setTimeout(r, pollInterval));
    }

    // at this point, polling ended and still no success, set failure status
    // console.error(`Hmm this is taking longer than expected...`);
    const err = new Error('Polling for mint PKP transaction status timed out');
    throw err;
  }

  /**
   * Fetch PKPs associated with the given auth method
   *
   * @param {string} body - Body of the request
   *
   * @returns {Promise<IRelayFetchResponse>} Response from the relay server
   */
  public async fetchPKPs(body: string): Promise<IRelayFetchResponse> {
    const response = await fetch(`${this.relayUrl}${this.fetchRoute}`, {
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
      throw err;
    } else {
      const resBody = await response.json();
      console.log('Successfully fetched PKPs with relayer');
      return resBody;
    }
  }

  /**
   * Generate options for registering a new credential to pass to the authenticator
   *
   * @param {string} [username] - Optional username to associate with the credential
   *
   * @returns {Promise<any>} Registration options for the browser to pass to the authenticator
   */
  public async generateRegistrationOptions(username?: string): Promise<any> {
    let url = `${this.relayUrl}/auth/webauthn/generate-registration-options`;
    if (username && username !== '') {
      url = `${url}?username=${encodeURIComponent(username)}`;
    }
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'api-key': this.relayApiKey,
      },
    });
    if (response.status < 200 || response.status >= 400) {
      const err = new Error(
        `Unable to generate registration options: ${response}`
      );
      throw err;
    }
    const registrationOptions = await response.json();
    return registrationOptions;
  }
}
