import type { ReactNode } from 'react';

import type { SupportedNetworkName } from '../types';

export interface AuthSettingsPanelProps {
  onClose: () => void;

  supportedNetworks: SupportedNetworkName[];
  currentNetworkName: SupportedNetworkName;
  onSelectNetwork: (networkName: SupportedNetworkName) => void;

  loginServiceBaseUrl: string;
  setLoginServiceBaseUrl: (url: string) => void;
  defaultLoginServiceBaseUrl?: string;

  discordClientId: string;
  setDiscordClientId: (clientId: string) => void;
  defaultDiscordClientId?: string;

  authServiceBaseUrl: string;
  setAuthServiceBaseUrl: (url: string) => void;
  defaultAuthServiceBaseUrl?: string;
}

export function AuthSettingsPanel({
  onClose,
  supportedNetworks,
  currentNetworkName,
  onSelectNetwork,
  loginServiceBaseUrl,
  setLoginServiceBaseUrl,
  defaultLoginServiceBaseUrl,
  discordClientId,
  setDiscordClientId,
  defaultDiscordClientId,
  authServiceBaseUrl,
  setAuthServiceBaseUrl,
  defaultAuthServiceBaseUrl,
}: AuthSettingsPanelProps): ReactNode {
  return (
    <div className="lit-login-modal__section">
      <div className="lit-login-modal__row" style={{ justifyContent: 'space-between' }}>
        <h3 className="lit-login-modal__h3">Settings</h3>
        <button type="button" onClick={onClose} className="lit-login-modal__btn lit-login-modal__btn--ghost">
          ← Back
        </button>
      </div>

      <div className="lit-login-modal__panel">
        <div className="lit-login-modal__field">
          <span className="lit-login-modal__label">Login Service URL</span>
          <div className="lit-login-modal__muted">
            Global setting – applies to all networks.
          </div>
          <input
            type="url"
            value={loginServiceBaseUrl}
            onChange={(e) => setLoginServiceBaseUrl(e.target.value)}
            placeholder={defaultLoginServiceBaseUrl || 'https://…'}
            className="lit-login-modal__input lit-login-modal__mono"
          />
          {defaultLoginServiceBaseUrl ? (
            <div>
              <button
                type="button"
                className="lit-login-modal__btn lit-login-modal__btn--secondary"
                onClick={() => setLoginServiceBaseUrl(defaultLoginServiceBaseUrl)}
              >
                Reset to default
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="lit-login-modal__panel">
        <div className="lit-login-modal__field">
          <span className="lit-login-modal__label">Discord Client ID</span>
          <div className="lit-login-modal__muted">
            Global setting – used for Discord authentication.
          </div>
          <input
            type="text"
            value={discordClientId}
            onChange={(e) => setDiscordClientId(e.target.value)}
            placeholder={defaultDiscordClientId || '…'}
            className="lit-login-modal__input lit-login-modal__mono"
          />
          {defaultDiscordClientId ? (
            <div>
              <button
                type="button"
                className="lit-login-modal__btn lit-login-modal__btn--secondary"
                onClick={() => setDiscordClientId(defaultDiscordClientId)}
              >
                Reset to default
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="lit-login-modal__panel">
        <div className="lit-login-modal__field">
          <span className="lit-login-modal__label">Network</span>
          <div className="lit-login-modal__tabs">
            {supportedNetworks.map((networkName) => {
              const isActive = networkName === currentNetworkName;
              return (
                <button
                  key={networkName}
                  type="button"
                  className={`lit-login-modal__tab ${isActive ? 'lit-login-modal__tab--active' : ''}`}
                  onClick={() => onSelectNetwork(networkName)}
                >
                  {networkName}
                </button>
              );
            })}
          </div>
          <div className="lit-login-modal__muted">
            Auth Service URL applies only to the selected network.
          </div>
        </div>
      </div>

      <div className="lit-login-modal__panel">
        <div className="lit-login-modal__field">
          <span className="lit-login-modal__label">Auth Service URL</span>
          <div className="lit-login-modal__muted">
            This is saved per network. Changing network switches to that
            network&apos;s saved URL.
          </div>
          <input
            type="url"
            value={authServiceBaseUrl}
            onChange={(e) => setAuthServiceBaseUrl(e.target.value)}
            placeholder={defaultAuthServiceBaseUrl || 'https://…'}
            className="lit-login-modal__input lit-login-modal__mono"
          />
          {defaultAuthServiceBaseUrl ? (
            <div>
              <button
                type="button"
                className="lit-login-modal__btn lit-login-modal__btn--secondary"
                onClick={() => setAuthServiceBaseUrl(defaultAuthServiceBaseUrl)}
              >
                Use network default
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

