import { LIT_AUTH_STATE_KEY } from './constants';
import { AuthInfo, AuthState, SessionSigs } from './types';

/**
 * Class for storing, updating, and retrieving user info
 */
export class Store {
  /**
   * Login info including auth method and credential
   */
  private _authInfo: AuthInfo = {};
  /**
   * Public key of the PKP currently being used for signing
   */
  private _pkpPublicKey: string | null = null;
  /**
   * Session signatures for the current PKP
   */
  private _sessionSigs: SessionSigs = {};
  /**
   * When session signatures expire
   */
  private _sessionExpiration: string | null = null;

  constructor() {
    this._restoreFromStorage();
  }

  // --- Getters ---

  public getAuthState(): AuthState {
    return {
      authInfo: this._authInfo,
      pkpPublicKey: this._pkpPublicKey,
      sessionSigs: this._sessionSigs,
      sessionExpiration: this._sessionExpiration,
    };
  }

  public getAuthInfo(): AuthInfo {
    return this._authInfo;
  }

  public getPKPPublicKey(): string | null {
    return this._pkpPublicKey;
  }

  public getSessionSigs(): SessionSigs {
    return this._sessionSigs;
  }

  public getSessionExpiration(): string | null {
    return this._sessionExpiration;
  }

  // --- Setters ---

  public setAuthInfo(authInfo: AuthInfo): void {
    this._authInfo = authInfo;
    this._persistToStorage();
  }

  public setPKPPublicKey(pkpPublicKey: string | null): void {
    this._pkpPublicKey = pkpPublicKey;
    this._persistToStorage();
  }

  public setSessionSigs(sessionSigs: SessionSigs): void {
    this._sessionSigs = sessionSigs;
    this._persistToStorage();
  }

  public setSessionExpiration(sessionExpiration: string | null): void {
    this._sessionExpiration = sessionExpiration;
    this._persistToStorage();
  }

  /**
   * Clears all auth state from memory and local storage
   */
  public clear(): void {
    this._resetState();
    this._removeFromStorage();
  }

  private _resetState(): void {
    this._authInfo = {};
    this._pkpPublicKey = null;
    this._sessionSigs = {};
    this._sessionExpiration = null;
  }

  private _restoreFromStorage(): void {
    const authState = localStorage.getItem(LIT_AUTH_STATE_KEY);
    if (authState) {
      const parsedAuthState = JSON.parse(authState);
      if (parsedAuthState.authInfo) {
        this._authInfo = parsedAuthState.authInfo;
      }
      if (parsedAuthState.pkpPublicKey) {
        this._pkpPublicKey = parsedAuthState.pkpPublicKey;
      }
      if (parsedAuthState.sessionSigs) {
        this._sessionSigs = parsedAuthState.sessionSigs;
      }
      if (parsedAuthState.sessionExpiration) {
        this._sessionExpiration = parsedAuthState.sessionExpiration;
      }
    }
  }

  private _persistToStorage(): void {
    const authState = this.getAuthState();
    localStorage.setItem(LIT_AUTH_STATE_KEY, JSON.stringify(authState));
  }

  private _removeFromStorage(): void {
    localStorage.removeItem(LIT_AUTH_STATE_KEY);
  }
}
