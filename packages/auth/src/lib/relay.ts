import { ethers } from 'ethers';
import { pino } from 'pino';

import {
  AUTH_METHOD_TYPE,
  LIT_NETWORK_VALUES,
  LIT_NETWORK,
  RELAYER_URL_BY_NETWORK,
  WrongNetworkException,
  InvalidParamType,
  NetworkError,
} from '@lit-protocol/constants';
import {
  AuthMethod,
  MintRequestBody,
  IRelay,
  IRelayFetchResponse,
  IRelayMintResponse,
  IRelayPollStatusResponse,
  LitRelayConfig,
} from '@lit-protocol/types';

import { getAuthIdByAuthMethod } from './authenticators/utils';
import { WebAuthnAuthenticator } from './authenticators/WebAuthnAuthenticator';

/**
 * Class that communicates with Lit relay server
 */
export class LitRelay implements IRelay {
  #logger = pino({
    name: 'LitRelay',
  });
  /** URL for Lit's relay server */
  static getRelayUrl(litNetwork: LIT_NETWORK_VALUES): string {
    const relayerUrl = RELAYER_URL_BY_NETWORK[litNetwork];
    if (!relayerUrl) {
      throw new WrongNetworkException(
        {
          info: {
            litNetwork,
          },
        },
        `Relay URL not found for network ${litNetwork}`
      );
    }

    return relayerUrl;
  }

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
   * @param {string} [config.relayUrl] - URL for Lit's relay server. If not provided, will default to the last dev relay server.
   */
  constructor(config: LitRelayConfig) {
    this.relayUrl =
      config.relayUrl || LitRelay.getRelayUrl(LIT_NETWORK.NagaDev);
    this.relayApiKey = config.relayApiKey || '';
    this.#logger.info({
      msg: "Lit's relay server URL",
      relayUrl: this.relayUrl,
    });
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
      this.#logger.info(
        'Something wrong with the API call',
        await response.json()
      );
      throw new Error('Unable to mint PKP through relay server');
    } else {
      const resBody = await response.json();
      this.#logger.info('Successfully initiated minting PKP with relayer');
      return resBody;
    }
  }

  /**
   * Mints a new pkp with all AuthMethods provided. Allows for permissions and flags to be set separately.
   * If no permissions are provided then each auth method will be assigned `1` for sign anything
   * If no flags are provided then `sendPkpToitself` will be false, and `addPkpEthAddressAsPermittedAddress` will be true
   * It is then up to the implementor to transfer the pkp nft to the pkp address.
   * **note** When adding permissions, each permission should be added in the same order the auth methods are ordered
   *
   * @throws {Error} - Throws an error if no AuthMethods are given
   * @param {AuthMethod[]} authMethods - AuthMethods authentication methods to be added to the pkp
   * @param {{ pkpPermissionScopes?: number[][]; sendPkpToitself?: boolean; addPkpEthAddressAsPermittedAddress?: boolean;}} options
   *
   * @returns {Promise<{pkpTokenId?: string; pkpEthAddress?: string; pkpPublicKey?: string}>} pkp information
   */
  public async mintPKPWithAuthMethods(
    authMethods: AuthMethod[],
    options: {
      pkpPermissionScopes?: number[][];
      sendPkpToitself?: boolean;
      addPkpEthAddressAsPermittedAddress?: boolean;
    }
  ): Promise<{
    pkpTokenId?: string;
    pkpEthAddress?: string;
    pkpPublicKey?: string;
  }> {
    if (authMethods.length < 1) {
      throw new InvalidParamType(
        {
          info: {
            authMethods,
            options,
          },
        },
        'Must provide at least one auth method'
      );
    }

    if (
      !options.pkpPermissionScopes ||
      options.pkpPermissionScopes.length < 1
    ) {
      options.pkpPermissionScopes = [];
      for (let i = 0; i < authMethods.length; i++) {
        options.pkpPermissionScopes.push([
          ethers.BigNumber.from('1').toNumber(),
        ]);
      }
    }

    const reqBody: MintRequestBody = {
      keyType: 2,
      permittedAuthMethodTypes: authMethods.map((value) => {
        return value.authMethodType;
      }),
      permittedAuthMethodScopes: options.pkpPermissionScopes,
      addPkpEthAddressAsPermittedAddress:
        options.addPkpEthAddressAsPermittedAddress ?? true,
      sendPkpToItself: options.sendPkpToitself ?? false,
    };

    const permittedAuthMethodIds = [];
    const permittedAuthMethodPubkeys = [];
    for (const authMethod of authMethods) {
      const id = await getAuthIdByAuthMethod(authMethod);
      permittedAuthMethodIds.push(id);
      if (authMethod.authMethodType === AUTH_METHOD_TYPE.WebAuthn) {
        permittedAuthMethodPubkeys.push(
          WebAuthnAuthenticator.getPublicKeyFromRegistration(
            JSON.parse(authMethod.accessToken)
          )
        );
      } else {
        // only webauthn has a `authMethodPubkey`
        permittedAuthMethodPubkeys.push('0x');
      }
    }

    reqBody.permittedAuthMethodIds = permittedAuthMethodIds;
    reqBody.permittedAuthMethodPubkeys = permittedAuthMethodPubkeys;

    const mintRes = await this.mintPKP(JSON.stringify(reqBody));
    if (!mintRes || !mintRes.requestId) {
      throw new NetworkError(
        {
          info: {
            mintRes,
          },
        },
        `Missing mint response or request ID from mint response ${mintRes.error}`
      );
    }

    const pollerResult = await this.pollRequestUntilTerminalState(
      mintRes.requestId
    );

    return {
      pkpTokenId: pollerResult.pkpTokenId,
      pkpPublicKey: pollerResult.pkpPublicKey,
      pkpEthAddress: pollerResult.pkpEthAddress,
    };
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
        this.#logger.info(
          'Something wrong with the API call',
          await response.json()
        );
        throw new Error(
          `Unable to poll the status of this mint PKP transaction: ${requestId}`
        );
      }

      const resBody = await response.json();
      this.#logger.info({ msg: 'Response OK', resBody });

      if (resBody.error) {
        // exit loop since error
        this.#logger.info({
          msg: 'Something wrong with the API call',
          error: resBody.error,
        });
        throw new Error(resBody.error);
      } else if (resBody.status === 'Succeeded') {
        // exit loop since success
        this.#logger.info({ msg: 'Successfully authed', resBody });
        return resBody;
      }

      // otherwise, sleep then continue polling
      await new Promise((r) => setTimeout(r, pollInterval));
    }

    // at this point, polling ended and still no success, set failure status
    throw new Error('Polling for mint PKP transaction status timed out');
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
      this.#logger.warn(
        'Something wrong with the API call',
        await response.json()
      );
      throw new Error('Unable to fetch PKPs through relay server');
    } else {
      const resBody = await response.json();
      this.#logger.info('Successfully fetched PKPs with relayer');
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
      throw new Error(`Unable to generate registration options: ${response}`);
    }
    const registrationOptions = await response.json();
    return registrationOptions;
  }

  /**
   * returns the relayUrl
   */
  public getUrl(): string {
    return this.relayUrl;
  }
}
