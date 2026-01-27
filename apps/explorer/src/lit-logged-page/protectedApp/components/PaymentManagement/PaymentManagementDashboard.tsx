/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion */
import { useEffect, useState, type FC } from "react";

import { getAllChains } from "@/domain/lit/chains";

import AccountMethodSelector from "./AccountMethodSelector";
import { useOptionalLitAuth } from "../../../../lit-login-modal/LitAuthProvider";
import { useLedgerBalance } from "../../hooks/useLedgerBalance";
import { usePaymentManagerInstance } from "../../hooks/usePaymentManagerInstance";
import { useWithdrawStatus } from "../../hooks/useWithdrawStatus";
import { UIPKP, TransactionResult, LedgerBalanceInfo } from "../../types";
import { triggerLedgerRefresh } from "../../utils/ledgerRefresh";


interface PaymentManagementDashboardProps {
  selectedPkp: UIPKP | null;
  selectedChain: string;
  disabled?: boolean;
  onTransactionComplete?: (result: TransactionResult) => void;
  services?: any;
  initialSource?: "pkp" | "eoa";
  presetRecipientAddress?: string;
  onBalanceChange?: (balance: LedgerBalanceInfo | null) => void;
  // When true, disables using PKP as the account source (EOA-only)
  disablePkpOption?: boolean;
  // Show only deposit-for-PKP and show balance for the PKP address
  fundPkOnly?: boolean;
  // Override user address for balance and deposit-for-user (use PKP address)
  targetUserAddress?: string;
  // Hide the account selection section and show as streamlined steps
  hideAccountSelection?: boolean;
}

export const PaymentManagementDashboard: FC<
  PaymentManagementDashboardProps
> = ({
  selectedPkp,
  selectedChain,
  disabled = false,
  onTransactionComplete,
  services,
  initialSource,
  presetRecipientAddress,
  onBalanceChange,
  disablePkpOption = false,
  fundPkOnly = false,
  targetUserAddress,
  hideAccountSelection = false,
}) => {
  // const { data: walletClient } = useWalletClient();
  const optionalAuth = useOptionalLitAuth();
  const user = optionalAuth?.user;
  const litServices = optionalAuth?.services;
  const currentNetworkName = (optionalAuth as any)?.currentNetworkName as
    | string
    | undefined;
  
  // Determine the correct unit for Lit Ledger balance
  const isTestnet = currentNetworkName === "naga-dev" || currentNetworkName === "naga-test";
  const ledgerUnit = isTestnet ? "tstLPX" : "LITKEY";

  // Account state
  const [account, setAccount] = useState<any>(null);
  const [accountSource, setAccountSource] = useState<"pkp" | "eoa">(
    initialSource || "pkp"
  );
  
  // Step/tab state for hideAccountSelection mode
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [fundingSuccess, setFundingSuccess] = useState(false);
  const [fundingTxHash, setFundingTxHash] = useState<string>("");

  // Enforce EOA-only when PKP option is disabled
  useEffect(() => {
    if (disablePkpOption && accountSource === "pkp") {
      setAccountSource("eoa");
    }
  }, [disablePkpOption, accountSource]);
  
  // Reset funding success state when target address changes (new PKP selected)
  useEffect(() => {
    if (hideAccountSelection && targetUserAddress) {
      setFundingSuccess(false);
      setFundingTxHash("");
      setCurrentStep(1);
    }
  }, [hideAccountSelection, targetUserAddress]);

  // Balance preferences
  const [autoRefreshBalance, setAutoRefreshBalance] = useState(true);

  // Deposit state
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositForUserAddress, setDepositForUserAddress] = useState("");
  const [depositForUserAmount, setDepositForUserAmount] = useState("");
  const [isDepositingForUser, setIsDepositingForUser] = useState(false);

  // Withdrawal state
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isRequestingWithdraw, setIsRequestingWithdraw] = useState(false);
  const [isExecutingWithdraw, setIsExecutingWithdraw] = useState(false);

  // Success feedback
  const [successActions, setSuccessActions] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>("");
  const resolvedAccountAddress =
    targetUserAddress || account?.address || account?.account?.address;
  const allChains = getAllChains();
  const selectedChainInfo = selectedChain
    ? allChains[selectedChain as keyof typeof allChains]
    : undefined;
  const activeChainLabel =
    selectedChainInfo?.name ||
    (selectedChain ? selectedChain.replace(/-/g, " ") : "unknown");

  // Success feedback helper
  const showSuccess = (actionId: string) => {
    setSuccessActions((prev) => new Set([...prev, actionId]));
    setTimeout(() => {
      setSuccessActions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(actionId);
        return newSet;
      });
    }, 3000);
  };

  // Error handling
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(""), 5000);
  };

  const clearError = () => setError("");

  const {
    paymentManager,
    withdrawDelay,
    isInitializingPaymentManager,
  } = usePaymentManagerInstance({
    account,
    services: services || litServices || null,
    onBeforeInit: clearError,
    onError: showError,
  });

  const {
    balanceInfo,
    isLoadingBalance,
    loadBalance: refreshLedgerBalance,
  } = useLedgerBalance({
    paymentManager,
    userAddress: resolvedAccountAddress,
    autoRefresh: autoRefreshBalance,
    onBalanceChange,
    onError: showError,
  });

  const {
    withdrawInfo,
    canExecuteInfo,
    isCheckingWithdraw,
    loadWithdrawalStatus,
    setWithdrawInfo,
    setCanExecuteInfo,
  } = useWithdrawStatus({
    paymentManager,
    userAddress: resolvedAccountAddress,
    onError: showError,
  });

  // Create a PKP viem account when PKP is selected as the source
  useEffect(() => {
    const hasAuthContext = Boolean(user?.authContext);
    const pkpPublicKey = selectedPkp?.pubkey || user?.pkpInfo?.pubkey;
    const targetServices = services || litServices;
    const canUsePkp = Boolean(
      targetServices?.litClient && hasAuthContext && pkpPublicKey
    );

    if (accountSource !== "pkp" || disablePkpOption) {
      return;
    }

    // Reset current account when switching to PKP
    setAccount(null);

    if (!canUsePkp) {
      return;
    }

    let cancelled = false;
    const derivePkpAccount = async () => {
      try {
        clearError();
        const chainConfig =
          targetServices!.litClient.getChainConfig().viemConfig;
        const pkpViemAccount =
          await targetServices!.litClient.getPkpViemAccount({
            pkpPublicKey,
            authContext: user!.authContext,
            chainConfig,
          });
        if (!cancelled) {
          setAccount(pkpViemAccount);
        }
      } catch (e: any) {
        console.error("Failed to create PKP viem account:", e);
        if (!cancelled) {
          showError(`Failed to create PKP viem account: ${e?.message || e}`);
          setAccount(null);
        }
      }
    };
    derivePkpAccount();
    return () => {
      cancelled = true;
    };
  }, [accountSource, services, litServices, user, selectedPkp]);

  useEffect(() => {
    if (presetRecipientAddress) {
      setDepositForUserAddress(presetRecipientAddress);
    }
  }, [presetRecipientAddress]);

  // Format time remaining
  const formatTimeRemaining = (seconds: string) => {
    const secs = parseInt(seconds);
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const remainingSeconds = secs % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  };

  // Deposit handlers
  const handleDeposit = async () => {
    if (!paymentManager || !depositAmount) return;

    try {
      setIsDepositing(true);
      clearError();

      const result = await paymentManager.deposit({
        amountInLitkey: depositAmount,
      });
      showSuccess("deposit");
      onTransactionComplete?.(result);
      setDepositAmount("");

      // Refresh balance after deposit
      setTimeout(refreshLedgerBalance, 2000);
      try {
        if (resolvedAccountAddress) {
          triggerLedgerRefresh(resolvedAccountAddress);
        }
      } catch {
        // ignore ledger refresh errors
      }
    } catch (error: any) {
      console.error("Deposit failed:", error);
      showError(`Deposit failed: ${error.message}`);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleDepositForUser = async () => {
    if (!paymentManager || !depositForUserAmount || !depositForUserAddress)
      return;

    try {
      setIsDepositingForUser(true);
      clearError();

      const result = await paymentManager.depositForUser({
        userAddress: depositForUserAddress,
        amountInLitkey: depositForUserAmount,
      });
      showSuccess("deposit-for-user");
      onTransactionComplete?.(result);
      setDepositForUserAmount("");
      
      // Show success message in hideAccountSelection mode
      if (hideAccountSelection) {
        setFundingSuccess(true);
        // Extract transaction hash from result
        const txHash = result?.transactionHash || result?.hash || "";
        setFundingTxHash(txHash);
      }
      setDepositForUserAddress("");
      try {
        const addr = targetUserAddress || depositForUserAddress;
        if (addr) triggerLedgerRefresh(addr);
      } catch {
        // ignore ledger refresh errors
      }
    } catch (error: any) {
      console.error("Deposit for user failed:", error);
      showError(`Deposit for user failed: ${error.message}`);
    } finally {
      setIsDepositingForUser(false);
    }
  };

  // Withdrawal handlers
  const handleRequestWithdraw = async () => {
    if (!paymentManager || !withdrawAmount) return;

    try {
      setIsRequestingWithdraw(true);
      clearError();

      const result = await paymentManager.requestWithdraw({
        amountInLitkey: withdrawAmount,
      });
      showSuccess("request-withdraw");
      onTransactionComplete?.(result);
      setWithdrawAmount("");

      // Refresh withdrawal status
      setTimeout(loadWithdrawalStatus, 2000);
      try {
        if (resolvedAccountAddress) {
          triggerLedgerRefresh(resolvedAccountAddress);
        }
      } catch {
        // ignore ledger refresh errors
      }
    } catch (error: any) {
      console.error("Withdrawal request failed:", error);
      showError(`Withdrawal request failed: ${error.message}`);
    } finally {
      setIsRequestingWithdraw(false);
    }
  };

  const handleExecuteWithdraw = async () => {
    if (!paymentManager || !withdrawInfo) return;

    try {
      setIsExecutingWithdraw(true);
      clearError();

      const result = await paymentManager.withdraw({
        amountInLitkey: withdrawInfo.amount,
      });
      showSuccess("execute-withdraw");
      onTransactionComplete?.(result);

      // Clear withdrawal info and refresh balance
      setWithdrawInfo(null);
      setCanExecuteInfo(null);
      setTimeout(refreshLedgerBalance, 2000);
      try {
        if (resolvedAccountAddress) {
          triggerLedgerRefresh(resolvedAccountAddress);
        }
      } catch {
        // ignore ledger refresh errors
      }
    } catch (error: any) {
      console.error("Withdrawal execution failed:", error);
      showError(`Withdrawal execution failed: ${error.message}`);
    } finally {
      setIsExecutingWithdraw(false);
    }
  };

  // Quick amount buttons
  const quickAmounts = ["0.001", "0.01", "0.1", "1.0"];

  return (
    <>
      {/* Error Display */}
      {error && (
        <div className="mb-5 px-4 py-3 bg-red-100 border border-red-200 rounded-lg text-red-800 text-sm">
          ⚠️ {error}
        </div>
      )}
      <div className="mb-4 text-xs uppercase tracking-wide text-gray-500">
        Active chain: {activeChainLabel}
      </div>

      {/* Account Setup - Conditional rendering based on hideAccountSelection */}
      {!hideAccountSelection ? (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-gray-900">Select a Payment Manager Account</h3>

          {/* Account source selector: PKP (default) or EOA */}
          <div className="mb-4 flex gap-2.5">
            {!disablePkpOption && (
              <button
                onClick={() => {
                  if (disablePkpOption || disabled) return;
                  setAccountSource("pkp");
                }}
                disabled={disabled || disablePkpOption}
                className={`rounded-md border border-gray-300 px-4 py-2 text-sm font-medium transition ${
                  accountSource === "pkp" && !disablePkpOption
                    ? "bg-[#B7410D] text-white"
                    : "bg-gray-100 text-gray-700"
                } ${disabled || disablePkpOption ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
              >
                Current PKP Wallet
              </button>
            )}
            <button
              onClick={() => {
                setAccountSource("eoa");
                setAccount(null);
              }}
              disabled={disabled}
              className={`rounded-md border border-gray-300 px-4 py-2 text-sm font-medium transition ${
                accountSource === "eoa" ? "bg-[#B7410D] text-white" : "bg-gray-100 text-gray-700"
              } ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
            >
              Externally Owned Account (EOA)
            </button>
          </div>

          {/* EOA account manual selection */}
          {accountSource === "eoa" && (
            <AccountMethodSelector
              onAccountCreated={setAccount}
              onMethodChange={() => undefined}
              setStatus={() => undefined}
              showError={showError}
              showSuccess={() => undefined}
              successActionIds={{
                createAccount: "pm-create-account",
                getWalletAccount: "pm-get-wallet-account",
              }}
              successActions={successActions}
              disabled={disabled}
            />
          )}

          {account && (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <div className="text-sm text-blue-900">
                <strong>Connected Account:</strong>{" "}
                {account.address || account.account?.address}
              </div>
              <div className="mt-1 text-xs text-blue-500">
                PaymentManager:{" "}
                {paymentManager
                  ? "✅ Ready"
                  : isInitializingPaymentManager
                  ? "⏳ Loading..."
                  : "❌ Failed to load"}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Streamlined tab-based flow for funding modal */
        <div className="mb-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setCurrentStep(1)}
              className={`px-4 py-3 text-[14px] font-medium border-b-2 transition ${
                currentStep === 1
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold ${
                  currentStep === 1 ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                }`}>1</span>
                Choose Account
              </span>
            </button>
            <button
              onClick={() => {
                if (account && paymentManager) setCurrentStep(2);
              }}
              disabled={!account || !paymentManager}
              className={`px-4 py-3 text-[14px] font-medium border-b-2 transition ${
                currentStep === 2
                  ? "border-indigo-600 text-indigo-600"
                  : !account || !paymentManager
                  ? "border-transparent text-gray-300 cursor-not-allowed"
                  : "border-transparent text-gray-500 hover:text-gray-700 cursor-pointer"
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold ${
                  currentStep === 2 
                    ? "bg-indigo-600 text-white" 
                    : !account || !paymentManager
                    ? "bg-gray-200 text-gray-400"
                    : "bg-gray-200 text-gray-600"
                }`}>2</span>
                Deposit Funds
              </span>
            </button>
          </div>

          {/* Step 1: Choose Account Method */}
          {currentStep === 1 && (
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-[16px] font-semibold text-gray-900 m-0 mb-2">
                Choose Account Method
              </h3>
              <p className="text-[13px] text-gray-600 mb-4">
                Select how you want to fund the Lit Ledger for this PKP
              </p>
              <AccountMethodSelector
                onAccountCreated={(acc) => {
                  setAccount(acc);
                }}
                onMethodChange={() => undefined}
                setStatus={() => undefined}
                showError={showError}
                showSuccess={() => undefined}
                successActionIds={{
                  createAccount: "pm-create-account",
                  getWalletAccount: "pm-get-wallet-account",
                }}
                successActions={successActions}
                disabled={disabled}
              />
              {account && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-[13px] text-blue-900">
                    <strong>Connected Account:</strong>{" "}
                    {account.address || account.account?.address}
                  </div>
                <div className="text-[12px] text-blue-700 mt-1">
                  PaymentManager:{" "}
                  {paymentManager
                    ? "✅ Ready"
                    : isInitializingPaymentManager
                    ? "⏳ Loading..."
                    : "❌ Failed to load"}
                </div>
                </div>
              )}
              {account && paymentManager && (
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[14px] font-medium transition"
                  >
                    Continue to Deposit →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Deposit for PKP */}
          {currentStep === 2 && account && paymentManager && (
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
              {fundingSuccess ? (
                /* Success Message */
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-[18px] font-semibold text-gray-900 m-0 mb-2">
                    ✅ Funding Successful!
                  </h3>
                  <p className="text-[14px] text-gray-600 mb-4">
                    Your PKP's Lit Ledger has been funded successfully. You can now close this modal and log in to your PKP account.
                  </p>
                  
                  {/* Transaction Hash */}
                  {fundingTxHash && (
                    <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg max-w-md mx-auto">
                      <div className="text-[12px] font-medium text-gray-700 mb-1">Transaction Hash</div>
                      <div className="flex items-center gap-2 justify-center">
                        <code className="text-[12px] text-gray-600 font-mono">
                          {fundingTxHash.slice(0, 10)}...{fundingTxHash.slice(-8)}
                        </code>
                        <a
                          href={`https://yellowstone-explorer.litprotocol.com/tx/${fundingTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded text-[11px] font-medium transition"
                          title="View on Chronicle Yellowstone Explorer"
                        >
                          View on Explorer
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => {
                        setFundingSuccess(false);
                        setFundingTxHash("");
                        setCurrentStep(1);
                        setDepositForUserAmount("");
                      }}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-[14px] font-medium transition"
                    >
                      Fund Another Amount
                    </button>
                  </div>
                </div>
              ) : (
                /* Deposit Form */
                <>
                  <h3 className="text-[16px] font-semibold text-gray-900 m-0 mb-2">
                    Deposit for PKP
                  </h3>
                  <p className="text-[13px] text-gray-600 mb-4">
                    Enter the amount you want to deposit to the PKP's Lit Ledger
                  </p>
                  <div className="mb-3">
                    <label className="block text-[12px] font-medium text-gray-700 mb-1">
                      Recipient PKP Address
                    </label>
                    <input
                      type="text"
                      placeholder="Recipient address (0x...)"
                      value={targetUserAddress || depositForUserAddress}
                      onChange={(e) => setDepositForUserAddress(e.target.value)}
                      disabled
                      className="w-full px-3 py-2 rounded-lg text-sm border bg-gray-50 border-gray-300 text-black"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-[12px] font-medium text-gray-700 mb-1">
                      Amount to Deposit
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder={`Amount in ${ledgerUnit}`}
                      value={depositForUserAmount}
                      onChange={(e) => setDepositForUserAmount(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-sm border bg-white border-gray-300 text-black"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Need test tokens? Visit the{" "}
                      <a
                        href="https://chronicle-yellowstone-faucet.getlit.dev/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        Chronicle Yellowstone Faucet
                      </a>
                    </p>
                  </div>
                  <button
                    onClick={handleDepositForUser}
                    disabled={
                      isDepositingForUser ||
                      !paymentManager ||
                      !depositForUserAmount ||
                      !(targetUserAddress || depositForUserAddress)
                    }
                    className={`w-full px-4 py-2.5 rounded-lg text-[14px] font-medium transition ${
                      isDepositingForUser ||
                      !depositForUserAmount ||
                      !(targetUserAddress || depositForUserAddress)
                        ? "bg-gray-400 cursor-not-allowed text-white"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                    }`}
                  >
                    {isDepositingForUser ? "Processing..." : "💰 Deposit for PKP"}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Balance Section */}
      {paymentManager && !hideAccountSelection && (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-gray-900">PKP Lit Ledger Balance</h3>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={autoRefreshBalance}
                  onChange={(e) => setAutoRefreshBalance(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Auto-refresh
              </label>
              <button
                onClick={refreshLedgerBalance}
                disabled={isLoadingBalance}
                className={`rounded-md px-3 py-2 text-xs font-semibold text-white transition ${
                  isLoadingBalance
                    ? "cursor-not-allowed bg-emerald-300"
                    : "bg-emerald-500 hover:bg-emerald-600"
                }`}
              >
                {isLoadingBalance ? "Refreshing..." : "🔄 Refresh"}
              </button>
            </div>
          </div>

          {balanceInfo ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                  Total Balance
                </div>
                <div className="mt-1 text-2xl font-bold text-blue-900">
                  {balanceInfo.totalBalance} {ledgerUnit}
                </div>
                <div className="font-mono text-[11px] text-gray-500">
                  {balanceInfo.raw.totalBalance.toString()} Wei
                </div>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                  Available Balance
                </div>
                <div className="mt-1 text-2xl font-bold text-emerald-900">
                  {balanceInfo.availableBalance} {ledgerUnit}
                </div>
                <div className="font-mono text-[11px] text-gray-500">
                  {balanceInfo.raw.availableBalance.toString()} Wei
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 p-5 text-center text-sm text-gray-600">
              Click refresh to load your balance
            </div>
          )}
        </div>
      )}

      {/* Operations Grid */}
      {paymentManager && !fundPkOnly && !hideAccountSelection && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deposit Section */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-gray-900">💰 Deposit Funds</h3>

            {/* Quick amounts */}
            <div className="mb-4">
              <div className="mb-2 text-sm text-gray-600">Quick amounts:</div>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setDepositAmount(amount)}
                    className={`rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold ${
                      depositAmount === amount
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {amount} ETH
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <input
                type="number"
                step="0.001"
                min="0"
                placeholder={`Amount in ${ledgerUnit}`}
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={!account}
                className={`w-full px-3 py-2 rounded-lg text-sm border ${
                  !account ? "bg-gray-50" : "bg-white"
                } border-gray-300 text-black`}
              />
            </div>

            <button
              onClick={handleDeposit}
              disabled={
                isDepositing || !paymentManager || !depositAmount || !account
              }
              className={`w-full p-3 rounded-lg text-sm font-medium border-1 border-gray-200 ${
                !account || !paymentManager || isDepositing
                  ? "bg-gray-400 cursor-not-allowed text-white"
                  : "bg-[#B7410D] text-white cursor-pointer"
              }`}
            >
              {isDepositing
                ? "Processing..."
                : successActions.has("deposit")
                ? "✅ Deposited Successfully"
                : "💰 Deposit to My Account"}
            </button>

            {/* Deposit for others */}
            <div className="mt-5 border-t border-gray-200 pt-4">
              <h4 className="mb-2 text-base font-semibold text-gray-700">
                👥 Deposit for Others
              </h4>

              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Recipient address (0x...)"
                  value={depositForUserAddress}
                  onChange={(e) => setDepositForUserAddress(e.target.value)}
                  disabled={!account}
                  className={`w-full px-3 py-2 rounded-lg text-sm border ${
                    !account ? "bg-gray-50" : "bg-white"
                  } border-gray-300 text-black`}
                />
              </div>

              <div className="mb-3">
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder={`Amount in ${ledgerUnit}`}
                  value={depositForUserAmount}
                  onChange={(e) => setDepositForUserAmount(e.target.value)}
                  disabled={!account}
                  className={`w-full px-3 py-2 rounded-lg text-sm border ${
                    !account ? "bg-gray-50" : "bg-white"
                  } border-gray-300 text-black`}
                />
              </div>

              <button
                onClick={handleDepositForUser}
                disabled={
                  isDepositingForUser ||
                  !paymentManager ||
                  !depositForUserAmount ||
                  !depositForUserAddress ||
                  !account
                }
                className={`w-full p-2.5 rounded-lg text-sm font-medium border-1 border-gray-200 ${
                  !account || !paymentManager || isDepositingForUser
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-[#B7410D] text-white cursor-pointer"
                }`}
              >
                {isDepositingForUser
                  ? "Processing..."
                  : successActions.has("deposit-for-user")
                  ? "✅ Deposited for User"
                  : "👥 Deposit for User"}
              </button>
            </div>
          </div>

          {/* Withdrawal Section */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h3 className="mb-4 text-gray-900">🔄 Withdraw Funds</h3>

            {withdrawDelay && (
              <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <strong>Security Delay:</strong> {withdrawDelay.delayHours} hours
                ({withdrawDelay.delaySeconds} seconds)
              </div>
            )}

            {/* Withdrawal Status */}
            {withdrawInfo && withdrawInfo.isPending && (
              <div className="mb-4 rounded-lg border border-amber-300 bg-amber-100 p-4 text-sm text-amber-900">
                <div className="mb-2 text-base font-semibold text-amber-900">
                  <strong>⏳ Pending Withdrawal</strong>
                </div>
                <div className="text-sm text-amber-800">
                  Amount: <strong>{withdrawInfo.amount} ETH</strong>
                </div>
                <div className="text-sm text-amber-800">
                  Requested:{" "}
                  {new Date(
                    Number(withdrawInfo.timestamp) * 1000
                  ).toLocaleString()}
                </div>
                {canExecuteInfo && (
                  <div className="mt-2 text-sm text-amber-800">
                    {canExecuteInfo.canExecute ? (
                      <span className="text-emerald-600">✅ Ready to execute!</span>
                    ) : (
                      <span>
                        ⏱️ Time remaining:{" "}
                        {formatTimeRemaining(canExecuteInfo.timeRemaining)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Request Withdrawal */}
            {(!withdrawInfo || !withdrawInfo.isPending) && (
              <>
                <div className="mb-4">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    placeholder={`Amount in ${ledgerUnit}`}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    disabled={!account}
                    className={`w-full px-3 py-2 rounded-lg text-sm border ${
                      !account ? "bg-gray-50" : "bg-white"
                    } border-gray-300 text-black`}
                  />
                </div>

                <button
                  onClick={handleRequestWithdraw}
                  disabled={
                    isRequestingWithdraw ||
                    !paymentManager ||
                    !withdrawAmount ||
                    !account
                  }
                  className={`w-full p-3 rounded-lg text-sm font-medium border-1 border-gray-200 ${
                    !account || !paymentManager || isRequestingWithdraw
                      ? "bg-gray-400 cursor-not-allowed text-white"
                      : "bg-[#B7410D] text-white cursor-pointer"
                  }`}
                >
                  {isRequestingWithdraw
                    ? "Processing..."
                    : successActions.has("request-withdraw")
                    ? "✅ Withdrawal Requested"
                    : "🔄 Request Withdrawal"}
                </button>
              </>
            )}

            {/* Execute Withdrawal */}
            {withdrawInfo &&
              withdrawInfo.isPending &&
              canExecuteInfo?.canExecute && (
                <button
                  onClick={handleExecuteWithdraw}
                  disabled={isExecutingWithdraw}
                  className={`mt-2 w-full rounded-lg px-4 py-3 text-sm font-semibold text-white transition ${
                    isExecutingWithdraw
                      ? "cursor-not-allowed bg-gray-300"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {isExecutingWithdraw
                    ? "Executing..."
                    : successActions.has("execute-withdraw")
                    ? "✅ Withdrawal Executed"
                    : `💸 Execute Withdrawal (${withdrawInfo.amount} ETH)`}
                </button>
              )}

            {/* Refresh Status Button */}
            <button
              onClick={loadWithdrawalStatus}
              disabled={isCheckingWithdraw}
              className={`mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold ${
                isCheckingWithdraw
                  ? "cursor-not-allowed text-gray-400"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {isCheckingWithdraw ? "🔄 Checking..." : "🔄 Refresh Status"}
            </button>
          </div>
        </div>
      )}

      {/* Fund-PK-only simplified Deposit for PKP */}
      {paymentManager && fundPkOnly && !hideAccountSelection && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-gray-900">💰 Deposit for PKP</h3>
          <div className="mb-3">
            <input
              type="text"
              placeholder="Recipient address (0x...)"
              value={targetUserAddress || depositForUserAddress}
              onChange={(e) => setDepositForUserAddress(e.target.value)}
              disabled
              className={`w-full px-3 py-2 rounded-lg text-sm border bg-gray-50 border-gray-300 text-black`}
            />
          </div>
          <div className="mb-3">
            <input
              type="number"
              step="0.001"
              min="0"
              placeholder={`Amount in ${ledgerUnit}`}
              value={depositForUserAmount}
              onChange={(e) => setDepositForUserAmount(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg text-sm border bg-white border-gray-300 text-black`}
            />
          </div>
          <button
            onClick={handleDepositForUser}
            disabled={
              isDepositingForUser ||
              !paymentManager ||
              !depositForUserAmount ||
              !(targetUserAddress || depositForUserAddress)
            }
            className={`w-full p-2.5 rounded-lg text-sm font-medium border-1 border-gray-200 ${
              isDepositingForUser
                ? "bg-gray-400 cursor-not-allowed text-white"
                : "bg-[#B7410D] text-white cursor-pointer"
            }`}
          >
            {isDepositingForUser ? "Processing..." : "👥 Deposit for PKP"}
          </button>
        </div>
      )}

      {/* No PaymentManager state */}
      {!paymentManager && account && !isInitializingPaymentManager && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
          <h3 className="mb-2 text-lg font-semibold">
            ⚠️ PaymentManager Not Available
          </h3>
          <p className="text-sm">
            Unable to initialize PaymentManager. Please check your account setup
            and try again.
          </p>
        </div>
      )}

      {/* No Account state */}
      {!account && (
        <div className="rounded-2xl border border-gray-200 bg-gray-100 p-8 text-center text-gray-700">
          <h3 className="mb-2 text-lg font-semibold">🔐 Account Required</h3>
          <p className="text-sm">
            Please create or connect an account above to access PaymentManager
            features.
          </p>
        </div>
      )}
    </>
  );
};
