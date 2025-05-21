import { ethers } from 'ethers';
import * as jose from 'jose';
import { AUTH_METHOD_TYPE, UnknownError } from '@lit-protocol/constants';
import { AuthMethod, OAuthProviderOptions } from '@lit-protocol/types';

import { HexPrefixedSchema } from '@lit-protocol/schemas';
import { z } from 'zod';
import { AuthMethodTypeStringMap } from '../types';
import { LIT_LOGIN_GATEWAY, prepareLoginUrl } from './utils';
import { pollResponse } from './helper/pollResponse';
import { JobStatusResponse } from './types';

type GoogleConfig = OAuthProviderOptions & {
  pkpPublicKey?: z.infer<typeof HexPrefixedSchema>;
};

export class GoogleAuthenticator {
  public static id = AuthMethodTypeStringMap.Google;
  /**
   * The redirect URI that Lit's login server should send the user back to
   */
  public redirectUri: string;

  constructor(params: GoogleConfig) {
    this.redirectUri = params.redirectUri || window.location.origin;
  }

  /**
   * Signup with popup window
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
  public static async authenticate(baseURL: string): Promise<AuthMethod> {
    /**
     * If you are using the Lit Login Server or a clone from that, the redirectUri is the same as the baseUri. That's
     * because the app.js is loaded in the index.html file.
     */
    const redirectUri = baseURL;

    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const url = await prepareLoginUrl('google', redirectUri, baseURL);

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

        if (provider === 'google' && token) {
          clearInterval(interval);
          popup.close();
          resolve({
            authMethodType: AUTH_METHOD_TYPE.GoogleJwt,
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
    return GoogleAuthenticator.authMethodId(authMethod);
  }

  public static async authMethodId(authMethod: AuthMethod): Promise<string> {
    const tokenPayload = jose.decodeJwt(authMethod.accessToken);
    const userId: string = tokenPayload['sub'] as string;
    const audience: string = tokenPayload['aud'] as string;
    const authMethodId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(`${userId}:${audience}`)
    );
    return authMethodId;
  }
}
