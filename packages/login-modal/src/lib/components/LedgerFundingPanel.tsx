import type { ReactNode } from 'react';

import type { LedgerFundingPanelProps } from '../types';

export function LedgerFundingPanel({
  pkpAddress,
  networkName,
  faucetUrl,
  children,
}: LedgerFundingPanelProps): ReactNode {
  return (
    <div className="lit-login-modal__section">
      <div className="lit-login-modal__panel">
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
          PKP Address
        </div>
        <div style={{ fontSize: 12 }} className="lit-login-modal__mono">
          {pkpAddress}
        </div>
        <p style={{ fontSize: 12, color: '#4b5563', margin: '8px 0 0' }}>
          Fund this address on <strong>{networkName}</strong> to continue.
        </p>
      </div>

      <div className="lit-login-modal__panel lit-login-modal__panel--warning">
        <p style={{ margin: '0 0 10px' }}>
          On test networks you can use a faucet to top up your Lit Ledger
          balance.
        </p>
        <a
          href={faucetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="lit-login-modal__btn lit-login-modal__btn--primary"
        >
          Open Faucet
        </a>
      </div>

      {children ? (
        <div className="lit-login-modal__divider">{children}</div>
      ) : null}
    </div>
  );
}
