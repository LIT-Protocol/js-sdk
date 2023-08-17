import {
  AuthMethod,
  BaseProviderOptions,
  GoogleAuthenticateOptions,
  OAuthProviderOptions,
} from '@lit-protocol/types';
import { AuthMethodType } from '@lit-protocol/constants';
import {
  prepareLoginUrl,
  parseLoginParams,
  getStateParam,
  decode,
  clearParamsFromURL,
} from '../utils';
import { ethers } from 'ethers';
import * as jose from 'jose';

import { BaseProvider } from './BaseProvider';
// import {
//   LitAbility,
//   LitAccessControlConditionResource,
// } from '@lit-protocol/auth-helpers';
export default class GoogleProvider extends BaseProvider {
  /**
   * The redirect URI that Lit's login server should send the user back to
   */
  public redirectUri: string;

  /**
   * Google ID token
   */
  #idToken: string | undefined;

  constructor(options: BaseProviderOptions & OAuthProviderOptions) {
    super(options);
    this.redirectUri = options.redirectUri || window.location.origin;
  }

  /**
   * Redirect user to the Lit's Google login page
   *
   * @returns {Promise<void>} - Redirects user to Lit login page
   */
  public async signIn(): Promise<void> {
    // Get login url
    const loginUrl = await prepareLoginUrl('google', this.redirectUri);
    // Redirect to login url
    window.location.assign(loginUrl);
  }

  public getAuthMethodStorageUID(token: string): string {
    if (!token) {
      throw new Error('Token is required to generate auth method storage UID');
    }

    const UID = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString('utf-8')
    ).email;

    return `lit-google-token-${UID}`;
  }

  /**
   * Validate the URL parameters returned from Lit's login server and return the authentication data
   *
   * @returns {Promise<AuthMethod>} - Auth method object that contains OAuth token
   */
  public async authenticate<T extends GoogleAuthenticateOptions>(
    options?: T
  ): Promise<AuthMethod> {
    const _options = {
      cache: true,
      ...options,
    };

    // if (storageItem) {
    //   clearParamsFromURL();
    //   return JSON.parse(storageItem);
    // }

    // Check if current url matches redirect uri
    if (!window.location.href.startsWith(this.redirectUri)) {
      throw new Error(
        `Current url "${window.location.href}" does not match provided redirect uri "${this.redirectUri}"`
      );
    }

    // Check url for params
    const { provider, idToken, state, error } = parseLoginParams(
      window.location.search
    );

    // Check if there's an error
    if (error) {
      throw new Error(error);
    }

    // Check if provider is Google
    if (!provider || provider !== 'google') {
      throw new Error(
        `OAuth provider "${provider}" passed in redirect callback URL does not match "google". This usually means that you have not signed in with Google yet. If you have signed in with Google and was redirected to your app, your URL should look something like this: "${this.redirectUri}?provider=google&id_token=abc123&state=xyz123"`
      );
    }

    // Check if state param matches
    if (!state || decode(decodeURIComponent(state)) !== getStateParam()) {
      clearParamsFromURL();

      throw new Error(
        `Invalid state parameter "${state}" passed in redirect callback URL`
      );
    }

    // Clear params from url
    clearParamsFromURL();

    // Check if id token is present in url
    if (!idToken) {
      throw new Error(
        `Missing ID token in redirect callback URL for Google OAuth"`
      );
    }

    this.#idToken = idToken;

    const authMethod = {
      authMethodType: AuthMethodType.GoogleJwt,
      accessToken: idToken,
    };

    if (_options?.cache) {
      const storageUID = this.getAuthMethodStorageUID(idToken);

      if (this.storageProvider.isExpired(storageUID)) {
        this.storageProvider.setExpirableItem(
          storageUID,
          JSON.stringify(authMethod),
          _options.expirationLength ?? 24,
          _options.expirationUnit ?? 'hours'
        );
      }
    }

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
    const tokenPayload = jose.decodeJwt(authMethod.accessToken);
    const userId: string = tokenPayload['sub'] as string;
    const audience: string = tokenPayload['aud'] as string;
    const authMethodId = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes(`${userId}:${audience}`)
    );
    return authMethodId;
  }
}
