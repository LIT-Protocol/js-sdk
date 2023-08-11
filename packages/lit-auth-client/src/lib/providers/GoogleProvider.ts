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
  parseJWT,
  clearParamsFromURL,
} from '../utils';
import { utils } from 'ethers';

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

  public getAuthMethodStorageUID(token: any): string {

    if (!token) {
      throw new Error('Token is required to generate auth method storage UID');
    }

    const UID = JSON.parse(atob(token.split('.')[1])).email;

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
    // Check if it exists in cache
    let storageItem = this.storageProvider.getExpirableItem('lit-google-token');

    // default to caching
    if (options && options.cache === null) {
      options.cache = true;
    }

    if (storageItem) {
      clearParamsFromURL();
      return JSON.parse(storageItem);
    }

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

    if (options?.cache) {
      const storageUID = this.getAuthMethodStorageUID(idToken);

      this.storageProvider.setExpirableItem(
        storageUID,
        JSON.stringify(authMethod),
        options.expirationLength ?? 24,
        options.expirationUnit ?? 'hours'
      );

      // const litResource = new LitAccessControlConditionResource('*');
      // const litAbility = LitAbility.PKPSigning;

      // const pkps = await this.fetchPKPsThroughRelayer(authMethod);

      // console.log('Getting session sigs');
      // const sessionSigs = await this.getSessionSigs({
      //   pkpPublicKey: pkps[0].publicKey,
      //   authMethod,
      //   sessionSigsParams: {
      //     chain: 'ethereum',
      //     resourceAbilityRequests: [
      //       {
      //         resource: litResource,
      //         ability: litAbility,
      //       },
      //     ],
      //   },
      // });

      // console.log('sessionSigs:', sessionSigs);
    }

    return authMethod;
  }

  /**
   * Derive unique identifier from authentication material produced by auth providers
   *
   * @returns {Promise<string>} - Auth method id that can be used for look-up and as an argument when
   * interacting directly with Lit contracts
   */
  public async getAuthMethodId(): Promise<string> {
    if (!this.#idToken) {
      throw new Error('Id token is not defined. Call authenticate first.');
    }
    const tokenPayload = this.#parseIdToken(this.#idToken);
    const userId: string = tokenPayload['sub'] as string;
    const audience: string = tokenPayload['aud'] as string;
    const authMethodId = utils.keccak256(
      utils.toUtf8Bytes(`${userId}:${audience}`)
    );
    return authMethodId;
  }

  /**
   * Parse Google ID token
   *
   * @param {string} idToken - Google ID token
   *
   * @returns {Record<string, unknown>} - Google information
   */
  #parseIdToken(idToken: string): Record<string, unknown> {
    return parseJWT(idToken);
  }
}
