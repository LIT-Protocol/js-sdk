import { useCallback, useEffect, useState } from "react";
import type { LitServices } from "@/hooks/useLitServiceSetup";

interface UsePaymentManagerInstanceOptions {
  account: any;
  services: LitServices | null;
  onBeforeInit?: () => void;
  onError?: (message: string) => void;
}

export const usePaymentManagerInstance = ({
  account,
  services,
  onBeforeInit,
  onError,
}: UsePaymentManagerInstanceOptions) => {
  const [paymentManager, setPaymentManager] = useState<any>(null);
  type DelayResponse = {
    delaySeconds: string;
    delayHours?: string;
    raw: bigint;
  };

  const [withdrawDelay, setWithdrawDelay] = useState<{
    delaySeconds: string;
    delayHours: string;
    raw: bigint;
  } | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const initializePaymentManager = useCallback(async () => {
    const accountAddress = account?.address || account?.account?.address;
    if (!account || !accountAddress || !services?.litClient) {
      setPaymentManager(null);
      return;
    }

    try {
      onBeforeInit?.();
      setIsInitializing(true);
      const pm = await services.litClient.getPaymentManager({ account });
      setPaymentManager(pm);

      try {
        const delay = (await pm.getWithdrawDelay()) as DelayResponse | null;
        if (delay) {
          const normalized =
            typeof delay.delayHours === "string"
              ? (delay as Required<DelayResponse>)
              : {
                  ...delay,
                  delayHours: (
                    Number(delay.delaySeconds ?? 0) / 3600
                  ).toFixed(2),
                };
          setWithdrawDelay(normalized);
        }
      } catch (err) {
        console.error("Failed to get withdrawal delay:", err);
      }
    } catch (error: any) {
      console.error("Failed to initialize PaymentManager:", error);
      onError?.(
        `Failed to initialize PaymentManager: ${error?.message || error}`
      );
      setPaymentManager(null);
    } finally {
      setIsInitializing(false);
    }
  }, [account, services?.litClient, onBeforeInit, onError]);

  useEffect(() => {
    initializePaymentManager();
  }, [initializePaymentManager]);

  return {
    paymentManager,
    withdrawDelay,
    isInitializingPaymentManager: isInitializing,
    refreshPaymentManager: initializePaymentManager,
  };
};
