import { useCallback, useEffect, useState } from "react";
import type { LedgerBalanceInfo } from "../types";

interface UseLedgerBalanceOptions {
  paymentManager: any;
  userAddress?: string | null;
  autoRefresh?: boolean;
  onBalanceChange?: (balance: LedgerBalanceInfo | null) => void;
  onError?: (message: string) => void;
}

export const useLedgerBalance = ({
  paymentManager,
  userAddress,
  autoRefresh = true,
  onBalanceChange,
  onError,
}: UseLedgerBalanceOptions) => {
  const [balanceInfo, setBalanceInfo] = useState<LedgerBalanceInfo | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const loadBalance = useCallback(async () => {
    if (!paymentManager || !userAddress) return;

    try {
      setIsLoadingBalance(true);
      const balance = await paymentManager.getBalance({
        userAddress,
      });
      setBalanceInfo(balance);
      onBalanceChange?.(balance);
    } catch (error: any) {
      console.error("Balance check failed:", error);
      onError?.(`Balance check failed: ${error?.message || error}`);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [paymentManager, userAddress, onBalanceChange, onError]);

  useEffect(() => {
    if (!autoRefresh) return;
    if (!paymentManager || !userAddress) return;
    loadBalance();
    const interval = window.setInterval(loadBalance, 30000);
    return () => window.clearInterval(interval);
  }, [autoRefresh, paymentManager, userAddress, loadBalance]);

  return {
    balanceInfo,
    isLoadingBalance,
    loadBalance,
  };
};
