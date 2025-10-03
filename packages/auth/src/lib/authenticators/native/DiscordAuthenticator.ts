import { ethers } from 'ethers';

import { AUTH_METHOD_TYPE, UnknownError } from '@lit-protocol/constants';
import { AuthMethod, Hex } from '@lit-protocol/types';

import { AuthData } from '@lit-protocol/schemas';
import { LIT_LOGIN_GATEWAY, prepareLoginUrl } from '../helper/utils';

// IMPORTANT: this default client id only matches the public login server.
// When integrating with your own Discord OAuth app, always pass the actual
// client id to `authenticate`/`authMethodId`, otherwise the hashed authMethodId
// will differ from what Lit nodes calculate and PKP auth lookups will fail.
const DEFAULT_CLIENT_ID = '1052874239658692668';

export class DiscordAuthenticator {
  /**
   * Authenticate using a popup window
   *
   * You could use `https://login.litgateway.com` as a baseUrl.
   * It's highly recommended to use your own auth server for production.
   * However, If you are just testing/developing, you could use `https://login.litgateway.com` as a baseUrl.
   *
   * @example
   * https://login.litgateway.com
   *
   * @example
   * http://localhost:3300
   */
  /**
   * @param baseURL The login server URL (e.g. https://login.litgateway.com)
   * @param options Optional overrides.
   * @param options.clientId Discord OAuth client id to pair with the returned access token.
   *                         Must be provided when using a custom login server, otherwise the
   *                         derived authMethodId will not match what Lit nodes expect.
   */
  public static async authenticate(
    baseURL: string,
    options?: { clientId?: string }
  ): Promise<AuthData> {
    /**
     * If you are using the Lit Login Server or a clone from that, the redirectUri is the same as the baseUri. That's
     * because the app.js is loaded in the index.html file.
     */
    const redirectUri = baseURL;

    if (baseURL && baseURL !== LIT_LOGIN_GATEWAY && !options?.clientId) {
      throw new UnknownError(
        {},
        'Discord client id is required when using a custom login server.'
      );
    }

    const resolvedClientId = options?.clientId ?? DEFAULT_CLIENT_ID;

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

    const authMethod = await new Promise<AuthMethod>((resolve, reject) => {
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

    const authMethodWithMetadata = authMethod as AuthMethod & {
      metadata?: Record<string, unknown>;
    };
    authMethodWithMetadata.metadata = {
      ...authMethodWithMetadata.metadata,
      clientId: resolvedClientId,
    };

    return {
      ...authMethodWithMetadata,
      authMethodId: await DiscordAuthenticator.authMethodId(
        authMethodWithMetadata,
        resolvedClientId
      ),
      metadata: {
        ...(authMethodWithMetadata.metadata || {}),
        clientId: resolvedClientId,
      },
    };
  }

  /**
   * Get auth method id that can be used to look up and interact with
   * PKPs associated with the given auth method
   *
   * @param {AuthMethod} authMethod - Auth method object
   * @param {string} clientId - Optional Discord client ID, defaults to Lit's client ID
   *
   * @returns {Promise<Hex>} - Auth method id
   */
  public static async authMethodId(
    authMethod: AuthMethod,
    clientId?: string
  ): Promise<Hex> {
    const _clientId =
      clientId ||
      (authMethod as { metadata?: { clientId?: string } }).metadata?.clientId ||
      DEFAULT_CLIENT_ID;
    const userId = await DiscordAuthenticator._fetchDiscordUser(
      authMethod.accessToken
    );

    const authMethodId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(`${userId}:${_clientId}`)
    );

    return authMethodId as Hex;
  }

  /**
   * Fetch Discord user ID
   *
   * @param {string} accessToken - Discord access token
   *
   * @returns {Promise<string>} - Discord user ID
   */
  private static async _fetchDiscordUser(accessToken: string): Promise<string> {
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
