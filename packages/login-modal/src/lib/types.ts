/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AuthData, PKPData } from '@lit-protocol/schemas';
import type { ReactNode } from 'react';
import type { ExpectedAccountOrWalletClient } from '@lit-protocol/networks';

export type SupportedNetworkName = 'naga-dev' | 'naga-test' | 'naga-proto' | 'naga';

export type AuthMethod =
  | 'eoa'
  | 'google'
  | 'discord'
  | 'webauthn'
  | 'stytch-email'
  | 'stytch-sms'
  | 'stytch-whatsapp'
  | 'stytch-totp';

export interface AuthUser {
  authContext: any;
  pkpInfo: PKPData;
  method: AuthMethod;
  timestamp: number;
  authData: AuthData;
}

export interface LitServices {
  litClient: Awaited<
    ReturnType<(typeof import('@lit-protocol/lit-client'))['createLitClient']>
  >;
  authManager: Awaited<
    ReturnType<(typeof import('@lit-protocol/auth'))['createAuthManager']>
  >;
}

export interface LitLoginServicesConfig {
  authServiceUrls?: Partial<Record<SupportedNetworkName, string>>;
  authServiceApiKey?: string;

  loginServerUrl?: string;
  discordClientId?: string;
}

export interface LitLoginModalFeatures {
  funding?: boolean;
  settings?: boolean;
  persistSettings?: boolean;
}

export interface LitEoaWalletProvider {
  /**
   * Return a connected wallet client (e.g. Wagmi's `useWalletClient().data`).
   * The login modal will use this to generate the EOA AuthData (SIWE / AuthSig).
   */
  getWalletClient: () => Promise<unknown>;
  /**
   * Optional UI to render in the EOA step (e.g. a RainbowKit connect button).
   */
  renderConnect?: () => ReactNode;
  /**
   * Show raw private key input in the EOA step (advanced/dev).
   * Defaults to `true` only when no wallet provider is supplied.
   */
  allowPrivateKey?: boolean;
}

export interface PkpSelectionSectionProps {
  authData: AuthData;
  onPkpSelected: (pkpInfo: PKPData) => void;
  authMethod?: AuthMethod;
  authMethodName: string;
  services: LitServices;
  disabled?: boolean;
  authServiceBaseUrl: string;
  authServiceApiKey?: string;
  singlePkpMessaging?: boolean;
  currentNetworkName?: SupportedNetworkName;
  /**
   * Optional helper for EOA-only mint flows (no auth service).
   * The modal provides this when the user authenticated via EOA.
   */
  getEoaMintAccount?: () => Promise<ExpectedAccountOrWalletClient>;
}

export interface LedgerFundingPanelProps {
  pkpAddress: string;
  networkName: SupportedNetworkName;
  faucetUrl: string;
  children?: ReactNode;
}

export interface LitLoginModalComponents {
  PkpSelection?: (props: PkpSelectionSectionProps) => ReactNode;
  FundingPanel?: (props: LedgerFundingPanelProps) => ReactNode;
}

export interface LitAuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  error: string | null;

  services: LitServices | null;
  isServicesReady: boolean;
  isInitializingServices: boolean;

  currentNetworkName: SupportedNetworkName;
  authServiceBaseUrl: string;
  setAuthServiceBaseUrl: (url: string) => void;
  loginServiceBaseUrl: string;
  setLoginServiceBaseUrl: (url: string) => void;
  shouldDisplayNetworkMessage: boolean;

  showAuthModal: () => void;
  hideAuthModal: () => void;
  initiateAuthentication: () => void;
  forceNetworkSelection: (networkName: SupportedNetworkName) => Promise<void>;
  autoLoginWithDefaultKey: (options?: {
    forceNetwork?: SupportedNetworkName;
  }) => Promise<boolean>;
  isAutoLoggingIn: boolean;
  autoLoginStatus: string | null;
  logout: () => void;
}

export interface LitLoginModalProps {
  children?: ReactNode;

  appName: string;

  supportedNetworks?: SupportedNetworkName[];
  defaultNetwork?: SupportedNetworkName;

  enabledAuthMethods?: AuthMethod[];

  services?: LitLoginServicesConfig;

  features?: LitLoginModalFeatures;
  components?: LitLoginModalComponents;

  persistUser?: boolean;
  storageKey?: string;
  closeOnBackdropClick?: boolean;

  faucetUrl?: string;

  showNetworkMessage?: boolean;

  defaultPrivateKey?: string;

  /**
   * Optional external EOA wallet integration (RainbowKit/Wagmi, WalletConnect, etc).
   * When provided, the EOA flow will use `eoa.getWalletClient()` instead of
   * relying on `window.ethereum`.
   */
  eoa?: LitEoaWalletProvider;
}
