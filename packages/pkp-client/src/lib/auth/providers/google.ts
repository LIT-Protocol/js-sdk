import { Auth } from '../index';
import {
  AuthMethodType,
  GoogleAuthParams,
  PKP,
  SessionSigs,
  AUTH_CLIENT_EVENTS,
} from '../types';
import { getDefaultAuthNeededCallback } from '../utils';

/**
 * Controller class that handles creating, fetching, and authenticating PKPs tied to Google OAuth
 */
export class GoogleProvider {
  private readonly core: Auth;

  constructor(core: Auth) {
    this.core = core;
  }

  /**
   * Create a session for a given authorized Google account to use their PKPs
   *
   * @param {GoogleAuthParams} params
   * @param {string} params.idToken - Google ID token
   * @param {SessionParams} params.sessionParams - Parameters for creating session signatures
   * @param {string} [params.pkpPublicKey] - Public key of PKP to use for creating session signatures
   *
   * @returns {Promise<SessionSigs>} - Session signatures
   */
  public async createSession(params: GoogleAuthParams): Promise<SessionSigs> {
    const idToken = params.idToken;
    if (!idToken) {
      throw new Error('Missing Google ID token');
    }

    let currentPKPPublicKey: string;

    if (params.pkpPublicKey && params.pkpPublicKey.length > 0) {
      currentPKPPublicKey = params.pkpPublicKey;
    } else {
      // If no PKP public key is provided, mint a new PKP
      const newPKP = await this.mintAndPollPKP(idToken);
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
        authMethodType: AuthMethodType.GoogleJwt,
        accessToken: idToken,
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
    this.core.store.setAuthInfo({ provider: 'google', idToken: idToken });
    this.core.store.setPKPPublicKey(currentPKPPublicKey);
    this.core.store.setSessionSigs(sessionSigs);
    this.core.store.setSessionExpiration(expiration);

    // Return session signatures
    return sessionSigs;
  }

  /**
   * Mint a PKP for the given Google account through the relay server
   *
   * @param {string} idToken - Google ID token
   *
   * @returns newly minted PKP
   */
  public async mintAndPollPKP(idToken: string): Promise<PKP> {
    // Mint a new PKP via relay server
    const body = JSON.stringify({
      idToken: idToken,
    });
    const mintRes = await this.core.relayer.mintPKP(
      AuthMethodType.GoogleJwt,
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
