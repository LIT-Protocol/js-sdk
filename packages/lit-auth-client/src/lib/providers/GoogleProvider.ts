import {
  AuthMethod,
  AuthenticateOptions,
  BaseProviderOptions,
  OAuthProviderOptions,
} from '@lit-protocol/types';
import { AuthMethodType } from '@lit-protocol/constants';
import {
  prepareLoginUrl,
  parseLoginParams,
  getStateParam,
  decode,
} from '../utils';
import { BaseProvider } from './BaseProvider';
import { ethers } from 'ethers';
import * as jose from 'jose';

export default class GoogleProvider extends BaseProvider {
  /**
   * The redirect URI that Lit's login server should send the user back to
   */
  public redirectUri: string;

  /**
   * The actual AuthMethodType for GoogleProvider.  This can be either Google or GoogleJwt.
   */
  public authMethodType: AuthMethodType;

  constructor(options: BaseProviderOptions & OAuthProviderOptions) {
    super(options);
    this.redirectUri = options.redirectUri || window.location.origin;
    this.authMethodType = options.authMethodType || AuthMethodType.GoogleJwt;
  }

  /**
   * Redirect user to the Lit's Google login page
   *
   * @param {Function} [callback] - Optional callback to handle login URL
   * @returns {Promise<void>} - Redirects user to Lit login page
   */
  public async signIn(callback?: (url: string) => void): Promise<void> {
    // Get login url
    const loginUrl = await prepareLoginUrl('google', this.redirectUri);

    // If callback is provided, use it. Otherwise, redirect to login url
    if (callback) {
      callback(loginUrl);
    } else {
      window.location.assign(loginUrl);
    }
  }

  /**
   * Validate the URL parameters returned from Lit's login server and return the authentication data
   *
   * @returns {Promise<AuthMethod>} - Auth method object that contains OAuth token
   */
  public async authenticate<T extends AuthenticateOptions>(
    _?: T,
    urlCheckCallback?: (currentUrl: string, redirectUri: string) => boolean
  ): Promise<AuthMethod> {
    // Check if current url matches redirect uri using the callback if provided
    const isUrlValid = urlCheckCallback
      ? urlCheckCallback(window.location.href, this.redirectUri)
      : window.location.href.startsWith(this.redirectUri);

    if (!isUrlValid) {
      throw new Error(
        `Current url "${window.location.href}" does not match provided redirect uri "${this.redirectUri}"`
      );
    }

    // Check url for params
    const { provider, idToken, state, error, accessToken } = parseLoginParams(
      window.location.search
    );

    // Check if there's an error
    if (error) {
      throw new Error(error);
    }

    // Check if provider is Google
    if (!provider || provider !== 'google') {
      throw new Error(
        `OAuth provider "${provider}" passed in redirect callback URL does not match "google"`
      );
    }

    // Check if state param matches
    if (!state || decode(decodeURIComponent(state)) !== getStateParam()) {
      throw new Error(
        `Invalid state parameter "${state}" passed in redirect callback URL`
      );
    }

    // Clear params from url
    window.history.replaceState(
      null,
      window.document.title,
      window.location.pathname
    );

    if (this.authMethodType === AuthMethodType.Google) {
      // Check if access token is present in url
      if (!accessToken) {
        throw new Error(
          `Missing ID token in redirect callback URL for Google OAuth"`
        );
      }
      const authMethod = {
        authMethodType: AuthMethodType.Google,
        accessToken: accessToken,
      };
      return authMethod;
    } else {
      // Check if id token is present in url
      if (!idToken) {
        throw new Error(
          `Missing ID token in redirect callback URL for Google OAuth"`
        );
      }
      const authMethod = {
        authMethodType: AuthMethodType.GoogleJwt,
        accessToken: idToken,
      };
      return authMethod;
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
    return GoogleProvider.authMethodId(authMethod);
  }

  public static async authMethodId(authMethod: AuthMethod): Promise<string> {
    if (authMethod.authMethodType === AuthMethodType.Google) {
      // hit the google API to get the user id
      const url = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${authMethod.accessToken}`;
      const response = await fetch(url, {
        headers: {
          Accept: `application/json`,
        },
      });
      const userInfo = await response.json();
      const audience: string = userInfo['issued_to'] as string;
      const userId: string = userInfo['user_id'] as string;
      const authMethodId = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(`${userId}:${audience}`)
      );
      return authMethodId;
    } else {
      // decode the JWT and get the user id
      const tokenPayload = jose.decodeJwt(authMethod.accessToken);
      const userId: string = tokenPayload['sub'] as string;
      const audience: string = tokenPayload['aud'] as string;
      const authMethodId = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(`${userId}:${audience}`)
      );
      return authMethodId;
    }
  }
}
