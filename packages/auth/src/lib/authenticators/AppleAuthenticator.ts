import { ethers } from 'ethers';
import * as jose from 'jose';

import {
  AUTH_METHOD_TYPE,
  UnauthorizedException,
  UnknownError,
} from '@lit-protocol/constants';
import {
  AuthMethod,
  BaseProviderOptions,
  OAuthProviderOptions,
} from '@lit-protocol/types';

import { BaseAuthenticator } from './BaseAuthenticator';
import {
  prepareLoginUrl,
  parseLoginParams,
  getStateParam,
  decode,
} from './utils';

export class AppleAuthenticator extends BaseAuthenticator {
  /**
   * The redirect URI that Lit's login server should send the user back to
   */
  public redirectUri: string;

  constructor(options: BaseProviderOptions & OAuthProviderOptions) {
    super(options);
    this.redirectUri = options.redirectUri || window.location.origin;
  }

  /**
   * Redirect user to the Lit's Apple login page
   *
   * @returns {Promise<void>} - Redirects user to Lit login page
   */
  public async signIn(): Promise<void> {
    // Get login url
    const loginUrl = await prepareLoginUrl('apple', this.redirectUri);
    // Redirect to login url
    window.location.assign(loginUrl);
  }

  /**
   * Validate the URL parameters returned from Lit's login server and return the authentication data
   *
   * @returns {Promise<AuthMethod>} - Auth method object that contains OAuth token
   */
  public async authenticate(): Promise<AuthMethod> {
    // Check if current url matches redirect uri
    if (!window.location.href.startsWith(this.redirectUri)) {
      throw new UnauthorizedException(
        {
          info: {
            url: window.location.href,
            redirectUri: this.redirectUri,
          },
        },
        `Current url does not match provided redirect uri`
      );
    }

    // Check url for params
    const { provider, idToken, state, error } = parseLoginParams(
      window.location.search
    );

    // Check if there's an error
    if (error) {
      throw new UnknownError(
        {
          info: {
            error,
          },
          cause: new Error(error),
        },
        error ?? 'Received error from discord authentication'
      );
    }

    // Check if provider is Apple
    if (!provider || provider !== 'apple') {
      throw new UnauthorizedException(
        {
          info: {
            provider,
            redirectUri: this.redirectUri,
          },
        },
        'OAuth provider does not match "apple"'
      );
    }

    // Check if state param matches
    if (!state || decode(decodeURIComponent(state)) !== getStateParam()) {
      throw new UnauthorizedException(
        {
          info: {
            state,
            redirectUri: this.redirectUri,
          },
        },
        'Invalid state parameter in callback URL'
      );
    }

    // Clear params from url
    window.history.replaceState(
      null,
      window.document.title,
      window.location.pathname
    );

    // Check if id token is present in url
    if (!idToken) {
      throw new UnauthorizedException(
        {
          info: {
            idToken,
            redirectUri: this.redirectUri,
          },
        },
        `Missing ID token in callback URL`
      );
    }

    const authMethod = {
      authMethodType: AUTH_METHOD_TYPE.AppleJwt,
      accessToken: idToken,
    };
    return authMethod;
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
    return AppleAuthenticator.authMethodId(authMethod);
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
