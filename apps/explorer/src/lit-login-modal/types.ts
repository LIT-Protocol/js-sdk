/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LitServices } from "../hooks/useLitServiceSetup";
import type { PKPData } from "@lit-protocol/schemas";
import type { ReactNode } from "react";

export type SupportedNetworkName =
  | "naga-dev"
  | "naga-test"
  | "naga-proto"
  | "naga";

export type AuthMethod =
  | "google"
  | "discord"
  | "eoa"
  | "webauthn"
  | "stytch-email"
  | "stytch-sms"
  | "stytch-whatsapp"
  | "stytch-totp"
  | "custom";

export interface AuthUser {
  authContext: any;
  pkpInfo: PKPData;
  method: AuthMethod;
  timestamp: number;
  authData?: any;
}

export interface LitAuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  logout: () => void;
  isAuthenticating: boolean;
  services: LitServices | null;
  isServicesReady: boolean;
  showAuthModal: () => void;
  hideAuthModal: () => void;
  initiateAuthentication: () => void;
  isInitializingServices: boolean;
  showPkpSelectionModal: () => void;
  updateUserWithPkp: (pkpInfo: any, authContext?: any) => void;
  currentNetworkName: string;
  shouldDisplayNetworkMessage: boolean;
  authServiceBaseUrl: string;
  setAuthServiceBaseUrl: (url: string) => void;
  loginServiceBaseUrl: string;
  setLoginServiceBaseUrl: (url: string) => void;
  forceNetworkSelection: (networkName: SupportedNetworkName) => Promise<void>;
  autoLoginWithDefaultKey: (options?: {
    forceNetwork?: SupportedNetworkName;
  }) => Promise<boolean>;
  isAutoLoggingIn: boolean;
  autoLoginStatus: string | null;
}

export interface LitAuthProviderProps {
  children: ReactNode;
  appName?: string;
  networkName?: string;
  autoSetup?: boolean;
  storageKey?: string;
  persistUser?: boolean;
  closeOnBackdropClick?: boolean;
  networkModule?: any;
  supportedNetworks?: SupportedNetworkName[];
  defaultNetwork?: SupportedNetworkName;
  showSettingsButton?: boolean;
  showNetworkMessage?: boolean;
  supportedAuthMethods?: AuthMethod[];
  showSignUpPage?: boolean;
  authServiceBaseUrl?: string;
}
