import { Auth } from '../index';
import {
  AuthMethodType,
  PKP,
  DiscordAuthParams,
  AUTH_CLIENT_EVENTS,
  SessionSigs,
} from '../types';
import { getDefaultAuthNeededCallback } from '../utils';

/**
 * Controller class that handles creating, fetching, and authenticating PKPs tied to Discord OAuth
 */
export class DiscordProvider {
  private readonly core: Auth;

  constructor(core: Auth) {
    this.core = core;
  }

  /**
   * Create a session for a given authorized Discord account to use their PKPs
   *
   * @param {DiscordAuthParams} params
   * @param {string} params.accessToken - Discord access token
   * @param {SessionParams} params.sessionParams - Parameters for creating session signatures
   * @param {string} [params.pkpPublicKey] - Public key of PKP to use for creating session signatures
   *
   * @returns {Promise<SessionSigs>} - Session signatures
   */
  public async createSession(params: DiscordAuthParams): Promise<SessionSigs> {
    const accessToken = params.accessToken;
    if (!accessToken) {
      throw new Error('Missing Discord access token');
    }

    let currentPKPPublicKey: string;

    if (params.pkpPublicKey && params.pkpPublicKey.length > 0) {
      currentPKPPublicKey = params.pkpPublicKey;
    } else {
      // If no PKP public key is provided, mint a new PKP
      const newPKP = await this.mintAndPollPKP(accessToken);
      currentPKPPublicKey = newPKP.publicKey;
    }

    this.core.events.emit(AUTH_CLIENT_EVENTS.CREATING_SESSION);

    // Keep track of session expiration
    const expiration =
      params.sessionParams.expiration ||
      new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(); // default is 24 hours

    // Check if authNeededCallback was passed in, otherwise use default callback
    const authMethods = [
      {
        authMethodType: AuthMethodType.Discord,
        accessToken: accessToken,
      },
    ];
    const authNeededCallback =
      params.sessionParams.authNeededCallback ||
      getDefaultAuthNeededCallback(authMethods, currentPKPPublicKey);

    // Get session signatures
    const sessionSigs = await this.core.litNodeClient.getSessionSigs({
      ...params.sessionParams,
      authNeededCallback: authNeededCallback,
    });

    this.core.events.emit(AUTH_CLIENT_EVENTS.SESSION_CREATED);

    // Store user info in auth state
    this.core.store.setAuthInfo({
      provider: 'discord',
      accessToken: accessToken,
    });
    this.core.store.setPKPPublicKey(currentPKPPublicKey);
    this.core.store.setSessionSigs(sessionSigs);
    this.core.store.setSessionExpiration(expiration);

    // Return session signatures
    return sessionSigs;
  }

  /**
   * Mint a PKP for the given Discord account through the relay server
   *
   * @param {string} accessToken - Discord access token
   *
   * @returns newly minted PKP
   */
  public async mintAndPollPKP(accessToken: string): Promise<PKP> {
    // Mint a new PKP via relay server
    const body = JSON.stringify({
      accessToken: accessToken,
    });
    const mintRes = await this.core.relayer.mintPKP(
      AuthMethodType.Discord,
      body
    );
    const { requestId } = mintRes;
    if (!requestId) {
      throw new Error('Unable to mint PKP through relay server');
    }

    // Poll for status of minting PKP
    const pollRes = await this.core.relayer.pollRequestUntilTerminalState(
      requestId
    );
    if (
      !pollRes.pkpTokenId ||
      !pollRes.pkpEthAddress ||
      !pollRes.pkpPublicKey
    ) {
      throw new Error('Unable to mint PKP through relay server');
    }
    const newPKP: PKP = {
      tokenId: pollRes.pkpTokenId,
      ethAddress: pollRes.pkpEthAddress,
      publicKey: pollRes.pkpPublicKey,
    };

    return newPKP;
  }
}
