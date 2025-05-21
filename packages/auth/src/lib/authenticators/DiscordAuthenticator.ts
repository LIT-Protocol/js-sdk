import { ethers } from 'ethers';

import { AUTH_METHOD_TYPE, UnknownError } from '@lit-protocol/constants';
import { AuthMethod, OAuthProviderOptions } from '@lit-protocol/types';

import { HexPrefixedSchema } from '@lit-protocol/schemas';
import { z } from 'zod';
import { AuthMethodTypeStringMap } from '../types';
import { pollResponse } from './helper/pollResponse';
import { JobStatusResponse } from './types';
import { LIT_LOGIN_GATEWAY, prepareLoginUrl } from './utils';

const DEFAULT_CLIENT_ID = '1052874239658692668';

type DiscordConfig = OAuthProviderOptions & {
  pkpPublicKey: z.infer<typeof HexPrefixedSchema>;
  clientId?: string;
};

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
  public static async authenticate(
    baseURL: string,
    /**
     * If you are using the Lit Login Server or a clone from that, the redirectUri is the same as the baseUri. That's
     * because the app.js is loaded in the index.html file.
     */
    redirectUri: string
  ): Promise<AuthMethod> {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const url = await prepareLoginUrl('discord', redirectUri, baseURL);
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
        if (event.origin !== (baseURL || LIT_LOGIN_GATEWAY)) {
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

  public static async mintPkp({
    loginServerBaseUrl,
    authServerBaseUrl,
  }: {
    loginServerBaseUrl: string;
    authServerBaseUrl: string;
  }): Promise<{
    _raw: JobStatusResponse;
    txHash: z.infer<typeof HexPrefixedSchema>;
    pkpInfo: {
      tokenId: string;
      publicKey: z.infer<typeof HexPrefixedSchema>;
      ethAddress: z.infer<typeof HexPrefixedSchema>;
    };
  }> {
    const authMethod = await DiscordAuthenticator.authenticate(
      loginServerBaseUrl,
      loginServerBaseUrl
    );

    const authMethodType = authMethod.authMethodType;
    const authMethodId = await DiscordAuthenticator.authMethodId(authMethod);

    const url = `${authServerBaseUrl}/pkp/mint`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ authMethodType, authMethodId }),
    });

    if (res.status === 202) {
      const { jobId, message } = await res.json();
      console.log('[Server Response] message:', message);

      const statusUrl = `${authServerBaseUrl}/status/${jobId}`;

      try {
        const completedJobStatus = await pollResponse<JobStatusResponse>({
          url: statusUrl,
          isCompleteCondition: (response) => response.state === 'completed',
          isErrorCondition: (response) =>
            response.state === 'failed' || response.state === 'error',
          intervalMs: 3000,
          maxRetries: 10,
          errorMessageContext: `PKP Minting Job ${jobId}`,
        });

        return {
          _raw: completedJobStatus,
          txHash: completedJobStatus.returnValue.hash,
          pkpInfo: completedJobStatus.returnValue.data,
        };
      } catch (error: any) {
        console.error('Error during PKP minting polling:', error);
        const errMsg = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to mint PKP after polling: ${errMsg}`);
      }
    } else {
      const errorBody = await res.text();
      throw new Error(
        `Failed to initiate PKP minting. Status: ${res.status}, Body: ${errorBody}`
      );
    }
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
