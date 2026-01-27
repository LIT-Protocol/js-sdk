/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";

import type { CanExecuteInfo, WithdrawInfo } from "../types";

interface UseWithdrawStatusOptions {
  paymentManager: any;
  userAddress?: string | null;
  onError?: (message: string) => void;
}

export const useWithdrawStatus = ({
  paymentManager,
  userAddress,
  onError,
}: UseWithdrawStatusOptions) => {
  const [withdrawInfo, setWithdrawInfo] = useState<WithdrawInfo | null>(null);
  const [canExecuteInfo, setCanExecuteInfo] = useState<CanExecuteInfo | null>(
    null
  );
  const [isCheckingWithdraw, setIsCheckingWithdraw] = useState(false);

  const loadWithdrawalStatus = useCallback(async () => {
    if (!paymentManager || !userAddress) return;

    try {
      setIsCheckingWithdraw(true);
      const withdraw = await paymentManager.getWithdrawRequest({
        userAddress,
      });
      setWithdrawInfo(withdraw);

      if (withdraw?.isPending) {
        const canExecute = await paymentManager.canExecuteWithdraw({
          userAddress,
        });
        setCanExecuteInfo(canExecute);
      } else {
        setCanExecuteInfo(null);
      }
    } catch (error: any) {
      console.error("Withdrawal status check failed:", error);
      onError?.(`Withdrawal status check failed: ${error?.message || error}`);
    } finally {
      setIsCheckingWithdraw(false);
    }
  }, [paymentManager, userAddress, onError]);

  useEffect(() => {
    if (paymentManager && userAddress) {
      loadWithdrawalStatus();
    }
  }, [paymentManager, userAddress, loadWithdrawalStatus]);

  return {
    withdrawInfo,
    canExecuteInfo,
    isCheckingWithdraw,
    loadWithdrawalStatus,
    setWithdrawInfo,
    setCanExecuteInfo,
  };
};
