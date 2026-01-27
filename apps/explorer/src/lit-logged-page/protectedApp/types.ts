import { AUTH_METHOD_TYPE } from "@lit-protocol/constants";
import { SCOPE_VALUES, type PKPData } from "@lit-protocol/schemas";

import type { LitChainConfig } from "@/domain/lit/chains";

export { SCOPE_VALUES, AUTH_METHOD_TYPE };

export interface BalanceInfo {
  balance: string;
  symbol: string;
  chainId: number;
}

export interface LedgerBalanceInfo {
  totalBalance: string;
  availableBalance: string;
  raw: {
    totalBalance: bigint;
    availableBalance: bigint;
  };
}

export type UIPKP = PKPData & {
  // UI-augmented fields for balances and loading states
  balance?: string;
  balanceSymbol?: string;
  isLoadingBalance?: boolean;
  // Some parts of the UI reference publicKey; map from pubkey when needed
  publicKey?: string;
};

export interface TransactionResult {
  hash: string;
  to: string;
  value: string;
  from: string;
  timestamp: string;
  chainId?: number;
  chainName?: string;
  explorerUrl?: string;
}

export interface TransactionToast {
  id: string;
  message: string;
  txHash: string;
  type: "success" | "error";
  timestamp: number;
}

export type ChainConfig = LitChainConfig;

// Permission-related types
export interface PermissionCheckResults {
  actionPermitted: boolean | null;
  addressPermitted: boolean | null;
  actionIpfsId: string;
  address: string;
  timestamp: string;
}

export type ScopeValue = (typeof SCOPE_VALUES)[number];

// Available scope configurations
export interface ScopeConfig {
  id: string;
  label: string;
  description: string;
}

export const AVAILABLE_SCOPES: ScopeConfig[] = [
  {
    id: "sign-anything",
    label: "Sign Anything",
    description: "Allow signing any message or transaction",
  },
  {
    id: "personal-sign",
    label: "Personal Sign",
    description: "Allow personal message signing only",
  },
];

export interface WithdrawInfo {
  amount: string;
  timestamp: string;
  isPending: boolean;
}

export interface CanExecuteInfo {
  canExecute: boolean;
  timeRemaining: string;
}
