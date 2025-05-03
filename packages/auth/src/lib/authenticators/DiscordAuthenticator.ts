import { ethers } from 'ethers';

import { AUTH_METHOD_TYPE, UnknownError } from '@lit-protocol/constants';
import { AuthMethod } from '@lit-protocol/types';

import { DiscordConfig } from '../auth-manager';
import { LIT_LOGIN_GATEWAY, prepareLoginUrl } from './utils';
import { AuthMethodTypeStringMap } from '../types';

const DEFAULT_CLIENT_ID = '1052874239658692668';

export class DiscordAuthenticator {
  public static id = AuthMethodTypeStringMap.Discord;

  /**
   * The redirect URI that Lit's login server should send the user back to
   */
  public redirectUri: string;
  /**
   * OAuth client ID. Defaults to one used by Lit
   */
  private clientId?: string;

  constructor(params: DiscordConfig) {
    this.redirectUri = params.redirectUri || window.location.origin;
    this.clientId = params.clientId || DEFAULT_CLIENT_ID;
  }

  /**
   * Authenticate using a popup window.
   *
   * @param {string} baseURL - The base URL for the Lit Login Gateway.
   * @returns {Promise<AuthMethod>} - Auth method object containing the OAuth token.
   */
  public static async authenticate(params: DiscordConfig): Promise<AuthMethod> {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const url = await prepareLoginUrl(
      'discord',
      params.redirectUri || window.location.origin,
      params.baseUrl
    );
    const popup = window.open(
      `${url}&caller=${window.location.origin}`,
      'popup',
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );

    if (!popup) {
      throw new UnknownError({}, 'Failed to open popup window');
    }

    return new Promise((resolve, reject) => {
      // window does not have a closed event, so we need to poll using a timer
      const interval = setInterval(() => {
        if (popup.closed) {
          clearInterval(interval);
          reject(new Error('User closed popup window'));
        }
      }, 1000);

      window.addEventListener('message', (event) => {
        if (event.origin !== (params.baseUrl || LIT_LOGIN_GATEWAY)) {
          return;
        }

        const { provider, token, error } = event.data;

        if (error) {
          clearInterval(interval);
          reject(new Error(error));
        }

        if (provider === 'discord' && token) {
          clearInterval(interval);
          popup.close();
          resolve({
            authMethodType: AUTH_METHOD_TYPE.Discord,
            accessToken: token,
          });
        }
      });
    });
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
    const userId = await this._fetchDiscordUser(authMethod.accessToken);
    const authMethodId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(`${userId}:${this.clientId}`)
    );
    return authMethodId;
  }

  public static async authMethodId(
    authMethod: AuthMethod,
    clientId?: string
  ): Promise<string> {
    const _clientId = clientId || DEFAULT_CLIENT_ID;

    // -- get user id from access token
    let userId;
    const meResponse = await fetch('https://discord.com/api/users/@me', {
      method: 'GET',
      headers: {
        authorization: `Bearer ${authMethod.accessToken}`,
      },
    });
    if (meResponse.ok) {
      const user = await meResponse.json();
      userId = user.id;
    } else {
      throw new UnknownError({}, 'Unable to verify Discord account');
    }

    // -- get auth method id
    const authMethodId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(`${userId}:${_clientId}`)
    );

    return authMethodId;
  }

  /**
   * Fetch Discord user ID
   *
   * @param {string} accessToken - Discord access token
   *
   * @returns {Promise<string>} - Discord user ID
   */
  private async _fetchDiscordUser(accessToken: string): Promise<string> {
    const meResponse = await fetch('https://discord.com/api/users/@me', {
      method: 'GET',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });
    if (meResponse.ok) {
      const user = await meResponse.json();
      return user.id;
    } else {
      throw new UnknownError({}, 'Unable to verify Discord account');
    }
  }
}
