/**
 * PKPInfoCard Component
 *
 * Displays PKP wallet information including balance and addresses
 */

import React, { useEffect, useRef, useState } from "react";
import { UIPKP, BalanceInfo } from "../../types";
import { formatPublicKey, copyToClipboard } from "../../utils";
import copyIcon from "../../../../assets/copy.svg";
import googleIcon from "../../../../assets/google.png";
import discordIcon from "../../../../assets/discord.png";
import web3WalletIcon from "../../../../assets/web3-wallet.svg";
import passkeyIcon from "../../../../assets/passkey.svg";
import emailIcon from "../../../../assets/email.svg";
import phoneIcon from "../../../../assets/phone.svg";
import whatsappIcon from "../../../../assets/whatsapp.svg";
import tfaIcon from "../../../../assets/2fa.svg";
import { getAddress } from "viem";
import { ChainSelector } from "../layout";
import { Settings } from "lucide-react";
import { useOptionalLitAuth } from "../../../../lit-login-modal/LitAuthProvider";
import { privateKeyToAccount } from "viem/accounts";
import { setCurrentBalance, useLedgerRefresh } from "../../utils/ledgerRefresh";
import { isTestnetNetwork } from "@/domain/lit/networkDefaults";
// Replaced hover behaviour with a click-triggered menu
const account = privateKeyToAccount(
  "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
);

const AUTH_ICON_BY_METHOD: Record<string, string> = {
  google: googleIcon,
  discord: discordIcon,
  eoa: web3WalletIcon,
  webauthn: passkeyIcon,
  "stytch-email": emailIcon,
  "stytch-sms": phoneIcon,
  "stytch-whatsapp": whatsappIcon,
  "stytch-totp": tfaIcon,
  custom: passkeyIcon,
};

interface PKPInfoCardProps {
  selectedPkp: UIPKP | null;
  balance: BalanceInfo | null;
  isLoadingBalance: boolean;
  onShowPkpModal: () => void;
  userMethod: string;
  selectedChain: string;
  onChainChange: (chain: string) => void;
}

export const PKPInfoCard: React.FC<PKPInfoCardProps> = ({
  selectedPkp,
  balance,
  isLoadingBalance,
  onShowPkpModal,
  userMethod,
  selectedChain,
  onChainChange,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isChainMenuOpen, setIsChainMenuOpen] = useState<boolean>(false);
  const chainTriggerRef = useRef<HTMLButtonElement | null>(null);
  const chainMenuRef = useRef<HTMLDivElement | null>(null);
  const optionalAuth = useOptionalLitAuth();
  const services = optionalAuth?.services;
  const currentNetworkName = (optionalAuth as any)?.currentNetworkName as
    | string
    | undefined;
  const isTestnet = isTestnetNetwork(currentNetworkName);
  const ledgerUnit = isTestnet ? "tstLPX" : "LITKEY";

  // PKP Lit Ledger balance state
  const [ledgerError, setLedgerError] = useState<string>("");
  const [ledgerBalance, setLedgerBalance] = useState<{
    total: string;
    available: string;
  } | null>(null);
  
  // Balance change log
  type BalanceChangeLog = {
    timestamp: string;
    before: string;
    after: string;
    delta: string;
    type: 'increase' | 'decrease';
  };
  const [balanceChangeLogs, setBalanceChangeLogs] = useState<BalanceChangeLog[]>([]);
  const [showLogs, setShowLogs] = useState<boolean>(false);
  const lastBalanceRef = useRef<string | null>(null);

  // Ref to track background polling interval
  const backgroundPollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        isChainMenuOpen &&
        chainMenuRef.current &&
        !chainMenuRef.current.contains(target) &&
        chainTriggerRef.current &&
        !chainTriggerRef.current.contains(target)
      ) {
        setIsChainMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsChainMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isChainMenuOpen]);

  // Helper to fetch ledger balance
  const fetchLedgerBalance = async () => {
    if (!selectedPkp?.ethAddress || !services?.litClient) return null;
    try {
      const pm = await services.litClient.getPaymentManager({
        account: account,
      });
      const bal = await pm.getBalance({
        userAddress: selectedPkp.ethAddress,
      });
      return {
        total: bal.totalBalance,
        available: bal.availableBalance,
      };
    } catch (e: any) {
      throw e;
    }
  };

  // Event-driven polling: only polls after actions
  const startActionTriggeredPolling = () => {
    // Clear any existing interval
    if (backgroundPollingRef.current) {
      clearInterval(backgroundPollingRef.current);
    }
    
    // Poll every 1 second for a limited time after an action
    let pollCount = 0;
    const maxPolls = 10; // Poll for 10 seconds after action
    
    backgroundPollingRef.current = setInterval(async () => {
      if (!selectedPkp?.ethAddress || !services?.litClient) {
        stopPolling();
        return;
      }
      
      pollCount++;
      if (pollCount > maxPolls) {
        stopPolling();
        return;
      }
      
      try {
        const bal = await fetchLedgerBalance();
        if (bal) {
          // Log balance change if different from last balance
          if (lastBalanceRef.current && lastBalanceRef.current !== bal.available) {
            const before = Number(lastBalanceRef.current);
            const after = Number(bal.available);
            const delta = after - before;
            
            if (Math.abs(delta) > 0.000001) {
              const newLog: BalanceChangeLog = {
                timestamp: new Date().toISOString(),
                before: lastBalanceRef.current,
                after: bal.available,
                delta: delta.toFixed(6),
                type: delta > 0 ? 'increase' : 'decrease'
              };
              
              setBalanceChangeLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
              console.log('[Balance Change]', {
                time: new Date().toLocaleTimeString(),
                delta: `${delta > 0 ? '+' : ''}${delta.toFixed(6)} ${ledgerUnit}`,
                before: lastBalanceRef.current,
                after: bal.available
              });
              
              // Stop polling early if we detected a change
              stopPolling();
            }
          }
          
          lastBalanceRef.current = bal.available;
          setLedgerBalance(bal);
          
          // Update global balance store
          if (selectedPkp?.ethAddress && bal.available) {
            setCurrentBalance(selectedPkp.ethAddress, bal.available);
          }
        }
      } catch (e) {
        // Silent fail for polling
      }
    }, 1000);
  };

  const stopPolling = () => {
    if (backgroundPollingRef.current) {
      clearInterval(backgroundPollingRef.current);
      backgroundPollingRef.current = null;
    }
  };

  // Load PKP Lit Ledger balance when PKP changes (initial load only, no continuous polling)
  useEffect(() => {
    const loadLedgerBalance = async () => {
      if (!selectedPkp?.ethAddress || !services?.litClient) {
        setLedgerBalance(null);
        stopPolling();
        return;
      }
      try {
        setLedgerError("");
        
        const bal = await fetchLedgerBalance();
        if (!bal) {
          return;
        }
        
        // Initialize last balance ref
        lastBalanceRef.current = bal.available;
        setLedgerBalance(bal);
        
        // Update global balance store
        if (selectedPkp?.ethAddress && bal.available) {
          setCurrentBalance(selectedPkp.ethAddress, bal.available);
        }
        
        // Start polling after initial login (first load is an action)
        startActionTriggeredPolling();
      } catch (e: any) {
        setLedgerError(e?.message || String(e));
        setLedgerBalance(null);
      }
    };
    loadLedgerBalance();

    // Cleanup on unmount or PKP change
    return () => {
      stopPolling();
    };
  }, [selectedPkp, services?.litClient]);
  
  // Subscribe to ledger refresh events (triggered by actions)
  useLedgerRefresh(({ address }) => {
    if (!selectedPkp?.ethAddress) return;
    
    // Only refresh if it's for this PKP
    if ((address || "").toLowerCase() === (selectedPkp.ethAddress || "").toLowerCase()) {
      // Start polling after action
      startActionTriggeredPolling();
    }
  });

  const refreshLedgerBalance = async () => {
    if (!selectedPkp?.ethAddress || !services?.litClient) return;
    
    try {
      const bal = await fetchLedgerBalance();
      if (!bal) return;
      
      setLedgerBalance(bal);
      
      // Update global balance store
      if (selectedPkp?.ethAddress && bal.available) {
        setCurrentBalance(selectedPkp.ethAddress, bal.available);
      }
      
      // Start polling after manual refresh (it's an action)
      startActionTriggeredPolling();
    } catch (e: any) {
      setLedgerError(e?.message || String(e));
    }
  };

  const handleCopy = async (text: string, fieldName: string) => {
    await copyToClipboard(text, setCopiedField, fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!selectedPkp) {
    return (
      <div className="p-4 bg-yellow-100 border border-yellow-200 rounded-md mb-4">
        <div className="text-yellow-800 text-sm">
          No PKP selected. Click below to select a PKP wallet.
        </div>
      </div>
    );
  }

  return (
    <div id="pkp-info-card">
      {/* Header row: avatar | title | actions (chain + settings) */}
      <div className="mb-3 grid grid-cols-[24px_1fr_auto] items-center gap-2">
        {/* Avatar (circular) */}
        <div className="h-6 w-6 rounded-full overflow-hidden bg-white border border-sky-200 flex items-center justify-center">
          <img
            src={AUTH_ICON_BY_METHOD[userMethod] || web3WalletIcon}
            alt={`${userMethod} logo`}
            className="h-4 w-4 object-contain"
          />
        </div>

        {/* Title only */}
        <div className="min-w-0">
          <div className="capitalized text-sm font-medium leading-none">
            PKP Wallet
          </div>
        </div>

        {/* Actions: Chain selector + Settings */}
        <div className="flex items-center gap-1 relative">
          <ChainSelector
            selectedChain={selectedChain}
            onChainChange={(slug) => {
              onChainChange(slug);
            }}
            iconTrigger
            triggerAriaLabel="Select chain"
          />

          <button
            type="button"
            onClick={onShowPkpModal}
            className="group h-6 w-6 inline-flex items-center justify-center rounded hover:bg-sky-100 text-sky-700 cursor-pointer"
            aria-label="Change PKP"
            title="Click to change PKP"
          >
            <Settings
              aria-hidden="true"
              className="h-4 w-4 opacity-80 transition-transform group-hover:opacity-100 group-hover:rotate-6"
            />
          </button>
        </div>
      </div>

      {/* Balance shown outside of the info container, directly under the auth label */}
      <div className="mb-4">
        {isLoadingBalance ? (
          <div className="text-gray-500 text-xs">Loading balance...</div>
        ) : (
          balance && (
            <div>
              <span className="font-mono text-green-700 text-lg">
                {balance.balance} {balance.symbol}
              </span>
              <span className="text-gray-500 ml-2 text-xs">
                (Chain ID: {balance.chainId})
              </span>
            </div>
          )
        )}
        {/* PKP Lit Ledger Balance */}
        <div className="mt-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">
              PKP Lit Ledger Balance
            </span>
            <button
              onClick={() => refreshLedgerBalance()}
              className="px-1.5 py-0.5 border border-gray-300 rounded text-[11px] cursor-pointer hover:bg-gray-100"
            >
              Refresh
            </button>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="px-1.5 py-0.5 border border-gray-300 rounded text-[11px] cursor-pointer hover:bg-gray-100 flex items-center gap-1"
            >
              📊 Logs {balanceChangeLogs.length > 0 && `(${balanceChangeLogs.length})`}
            </button>
          </div>
          {ledgerError ? (
            <div className="text-red-600 mt-1">{ledgerError}</div>
          ) : ledgerBalance ? (
            <div className="mt-1 text-gray-800">
              <div>
                <span className="font-mono text-green-700 text-lg">
                  {ledgerBalance.available} {ledgerUnit}
                </span>
                <span className="text-gray-500 ml-2 text-xs">
                  (total {ledgerBalance.total} {ledgerUnit})
                </span>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 mt-1">No ledger data</div>
          )}
          
          {/* Balance Change Logs */}
          {showLogs && (
            <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded max-h-60 overflow-y-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700 text-xs">Balance Change History</span>
                {balanceChangeLogs.length > 0 && (
                  <button
                    onClick={() => setBalanceChangeLogs([])}
                    className="text-[10px] text-red-600 hover:text-red-800"
                  >
                    Clear
                  </button>
                )}
              </div>
              {balanceChangeLogs.length === 0 ? (
                <div className="text-gray-500 text-[11px] text-center py-2">
                  No balance changes recorded yet
                </div>
              ) : (
                <div className="space-y-1">
                  {balanceChangeLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] font-mono p-1.5 bg-white border border-gray-200 rounded"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                        <span
                          className={`font-semibold ${
                            log.type === 'increase' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {log.type === 'increase' ? '+' : ''}{log.delta} {ledgerUnit}
                        </span>
                      </div>
                      <div className="text-gray-500 text-[10px] mt-0.5">
                        {log.before} → {log.after}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-white rounded-md border border-gray-300">
        <div className="text-black grid gap-2 text-xs">
          <div className="grid [grid-template-columns:90px_1fr] gap-2 items-center">
            <strong>Token ID:</strong>
            <span
              className={`group font-mono cursor-pointer px-1.5 py-0.5 rounded border transition block w-full min-w-0 flex items-center justify-between gap-1 ${
                copiedField === "tokenId"
                  ? "bg-green-100 border-green-200"
                  : "bg-gray-50 border-gray-200"
              }`}
              onClick={() =>
                handleCopy(selectedPkp.tokenId?.toString() || "", "tokenId")
              }
              title="Click to copy Token ID"
            >
              <span className="truncate">
                {copiedField === "tokenId"
                  ? `✅ ${selectedPkp.tokenId?.toString()}`
                  : selectedPkp.tokenId?.toString() || "N/A"}
              </span>
              <img
                src={copyIcon}
                alt="Copy"
                className="shrink-0 h-3 w-3 opacity-70 group-hover:opacity-100"
              />
            </span>
          </div>

          <div className="grid [grid-template-columns:90px_1fr] gap-2 items-center">
            <strong>ETH Address:</strong>
            <span
              className={`group font-mono cursor-pointer px-1.5 py-0.5 rounded border transition block w-full min-w-0 flex items-center justify-between gap-1 ${
                copiedField === "ethAddress"
                  ? "bg-green-100 border-green-200"
                  : "bg-gray-50 border-gray-200"
              }`}
              onClick={() =>
                handleCopy(
                  getAddress(selectedPkp.ethAddress) || "",
                  "ethAddress"
                )
              }
              title="Click to copy ETH Address"
            >
              <span className="truncate">
                {copiedField === "ethAddress"
                  ? `✅ ${getAddress(selectedPkp.ethAddress)}`
                  : getAddress(selectedPkp.ethAddress) || "N/A"}
              </span>
              <img
                src={copyIcon}
                alt="Copy"
                className="shrink-0 h-3 w-3 opacity-70 group-hover:opacity-100"
              />
            </span>
          </div>

          <div className="grid [grid-template-columns:90px_1fr] gap-2 items-center">
            <strong>Public Key:</strong>
            <span
              className={`group font-mono cursor-pointer px-1.5 py-0.5 rounded border transition block w-full min-w-0 flex items-center justify-between gap-1 ${
                copiedField === "publicKey"
                  ? "bg-green-100 border-green-200"
                  : "bg-gray-50 border-gray-200"
              }`}
              onClick={() => handleCopy(selectedPkp.pubkey || "", "publicKey")}
              title="Click to copy Public Key (full value)"
            >
              <span className="truncate">
                {copiedField === "publicKey"
                  ? `✅ ${selectedPkp.pubkey}`
                  : formatPublicKey(selectedPkp.pubkey || "")}
              </span>
              <img
                src={copyIcon}
                alt="Copy"
                className="shrink-0 h-3 w-3 opacity-70 group-hover:opacity-100"
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
