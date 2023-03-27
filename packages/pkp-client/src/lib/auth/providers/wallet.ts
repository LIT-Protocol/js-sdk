import { Auth } from '../index';
import {
  AuthSig,
  AuthMethodType,
  PKP,
  WalletAuthParams,
  SessionSigs,
  AUTH_CLIENT_EVENTS,
} from '../types';
import { ethers } from 'ethers';

/**
 * Controller class that handles creating, fetching, and authenticating PKPs tied to Eth Wallets
 */
export class WalletProvider {
  private readonly core: Auth;

  constructor(core: Auth) {
    this.core = core;
  }

  /**
   * Create a session for a given authorized Eth Wallet to use their PKPs
   *
   * @param {WalletAuthParams} params
   * @param {AuthSig} params.authSig - Signature of authorized wallet
   * @param {SessionParams} params.sessionParams - Session config that will be used to generate session signatures
   * @param {string} [params.pkpPublicKey] - Public key of PKP to use for creating session signatures
   *
   * @returns {Promise<SessionSigs>} - Session signatures
   */
  public async createSession(params: WalletAuthParams): Promise<SessionSigs> {
    const authSig = params.authSig;
    if (!authSig) {
      throw new Error('Missing Eth Wallet auth signature');
    }

    let currentPKPPublicKey: string;

    if (params.pkpPublicKey && params.pkpPublicKey.length > 0) {
      currentPKPPublicKey = params.pkpPublicKey;
    } else {
      // If no PKP public key is provided, mint a new PKP
      const newPKP = await this.mintAndPollPKP(authSig);
      currentPKPPublicKey = newPKP.publicKey;
    }

    this.core.events.emit(AUTH_CLIENT_EVENTS.CREATING_SESSION);

    // Keep track of session expiration
    const expiration =
      params.sessionParams.expiration ||
      new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(); // default is 24 hours

    // Get session signatures
    const sessionSigs = await this.core.litNodeClient.getSessionSigs({
      ...params.sessionParams,
    });

    this.core.events.emit(AUTH_CLIENT_EVENTS.SESSION_CREATED);

    // Store user info in auth state
    this.core.store.setAuthInfo({
      provider: 'ethwallet',
      authSig: authSig,
    });
    this.core.store.setPKPPublicKey(currentPKPPublicKey);
    this.core.store.setSessionSigs(sessionSigs);
    this.core.store.setSessionExpiration(expiration);

    // Return session signatures
    return sessionSigs;
  }

  /**
   * Mint a PKP for the given Eth Wallet through the relay server
   *
   * @param {AuthSig} authSig - signature to prove ownership of Eth Wallet
   *
   * @returns newly minted PKP
   */
  public async mintAndPollPKP(authSig: AuthSig): Promise<PKP> {
    // Mint a new PKP via relay server
    const body = JSON.stringify(authSig);
    const mintRes = await this.core.relayer.mintPKP(
      AuthMethodType.EthWallet,
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
