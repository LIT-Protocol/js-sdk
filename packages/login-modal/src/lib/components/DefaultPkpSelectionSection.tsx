/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthData, PKPData } from '@lit-protocol/schemas';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

import type { PkpSelectionSectionProps } from '../types';

type LitClientPkp = {
  tokenId: bigint;
  publicKey?: string;
  pubkey?: string;
  ethAddress?: string;
};

function getPkpPubkey(pkp: LitClientPkp): string {
  return pkp.publicKey ?? pkp.pubkey ?? '';
}

function toPkpData(pkp: LitClientPkp): PKPData {
  return {
    tokenId: pkp.tokenId,
    pubkey: getPkpPubkey(pkp),
    ethAddress: pkp.ethAddress ?? '',
  };
}

export function DefaultPkpSelectionSection({
  authData,
  authMethod,
  onPkpSelected,
  authMethodName,
  services,
  disabled = false,
  authServiceBaseUrl,
  authServiceApiKey,
  getEoaMintAccount,
}: PkpSelectionSectionProps): ReactNode {
  const [pkps, setPkps] = useState<PKPData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState(false);
  const [useAuthServiceMintForEoa, setUseAuthServiceMintForEoa] =
    useState(false);

  const isEoa = useMemo(
    () => authMethod === 'eoa' || Number(authData.authMethodType) === 1,
    [authData.authMethodType, authMethod]
  );

  const authLookup = useMemo(
    () => ({
      authMethodType: authData.authMethodType,
      authMethodId: authData.authMethodId,
    }),
    [authData]
  );

  const refresh = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res: any = await services.litClient.viewPKPsByAuthData({
        authData: authLookup,
        pagination: { limit: 20, offset: 0 },
      });
      const next = ((res?.pkps ?? []) as LitClientPkp[]).map(toPkpData);
      setPkps(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const mint = async () => {
    setIsMinting(true);
    setError(null);
    try {
      const scopes = ['sign-anything'];

      if (!isEoa) {
        await services.litClient.authService.mintWithAuth({
          authData,
          scopes,
          authServiceBaseUrl,
          apiKey: authServiceApiKey,
        });
      } else if (useAuthServiceMintForEoa) {
        if (!authServiceBaseUrl) {
          throw new Error(
            'Auth Service URL is not configured. Set `services.authServiceUrls` (or enable settings) to mint via the Auth Service.'
          );
        }
        await services.litClient.authService.mintWithAuth({
          authData,
          scopes,
          authServiceBaseUrl,
          apiKey: authServiceApiKey,
        });
      } else {
        if (!getEoaMintAccount) {
          throw new Error('EOA mint requires a wallet account to be provided.');
        }
        const account = await getEoaMintAccount();
        await services.litClient.mintWithAuth({
          account,
          authData,
          scopes,
        } as any);
      }
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsMinting(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="lit-login-modal__section">
      <div>
        <div className="lit-login-modal__h3">Select a PKP</div>
        <div className="lit-login-modal__muted">
          Auth method: {authMethodName}
        </div>
      </div>

      {error ? (
        <div className="lit-login-modal__alert lit-login-modal__alert--error">
          {error}
        </div>
      ) : null}

      <div className="lit-login-modal__row">
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={disabled || isLoading || isMinting}
          className="lit-login-modal__btn lit-login-modal__btn--secondary"
        >
          Refresh
        </button>
        <button
          type="button"
          onClick={() => void mint()}
          disabled={disabled || isLoading || isMinting}
          title={
            isEoa
              ? useAuthServiceMintForEoa
                ? 'Mints via the Auth Service (sponsored)'
                : 'Mints on chain using your connected wallet'
              : 'Requires an auth service'
          }
          className="lit-login-modal__btn lit-login-modal__btn--primary"
        >
          Mint new PKP
        </button>
        {isLoading ? (
          <span className="lit-login-modal__muted">Loading…</span>
        ) : null}
      </div>

      {isEoa && authServiceBaseUrl ? (
        <label className="lit-login-modal__row" style={{ gap: 10 }}>
          <input
            type="checkbox"
            checked={useAuthServiceMintForEoa}
            onChange={(e) => setUseAuthServiceMintForEoa(e.target.checked)}
            disabled={disabled || isLoading || isMinting}
          />
          <span className="lit-login-modal__muted">
            Sponsor mint via Auth Service (no gas needed)
          </span>
        </label>
      ) : null}

      {pkps.length === 0 && !isLoading ? (
        <div className="lit-login-modal__muted">
          No PKPs found for this auth method.
        </div>
      ) : null}

      <ul className="lit-login-modal__list">
        {pkps.map((pkp) => (
          <li key={`${pkp.tokenId}`} className="lit-login-modal__listItem">
            <div style={{ fontSize: 12, color: '#374151' }}>
              <div>
                <strong>Token ID:</strong> {String(pkp.tokenId)}
              </div>
              <div>
                <strong>Address:</strong>{' '}
                <span className="lit-login-modal__mono">{pkp.ethAddress}</span>
              </div>
            </div>
            <div style={{ marginTop: 10 }}>
              <button
                type="button"
                onClick={() => onPkpSelected(pkp)}
                disabled={disabled || isLoading || isMinting}
                className="lit-login-modal__btn lit-login-modal__btn--primary"
              >
                Use this PKP
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
