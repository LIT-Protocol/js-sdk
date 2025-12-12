/**
 * SendTransactionForm Component
 * 
 * Form for sending transactions using PKP wallet via Viem
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type FC } from "react";

import { getAllChains } from "@/domain/lit/chains";

import { useLitAuth } from '../../../../lit-login-modal/LitAuthProvider';
import { UIPKP, TransactionResult } from '../../types';
import { triggerLedgerRefresh } from '../../utils/ledgerRefresh';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface SendTransactionFormProps {
  selectedPkp: UIPKP | null;
  selectedChain: string;
  disabled?: boolean;
  onTransactionComplete?: (result: TransactionResult) => void;
  initialRecipient?: string;
  initialAmount?: string;
}

export const SendTransactionForm: FC<SendTransactionFormProps> = ({ 
  selectedPkp,
  selectedChain,
  disabled = false,
  onTransactionComplete,
  initialRecipient = "",
  initialAmount = "0.001",
}) => {
  const { user, services } = useLitAuth();
  const [recipientAddress, setRecipientAddress] = useState(initialRecipient);
  const [sendAmount, setSendAmount] = useState(initialAmount);
  const [transactionResult, setTransactionResult] = useState<TransactionResult | null>(null);
  const [isSendingTransaction, setIsSendingTransaction] = useState(false);
  const [status, setStatus] = useState<string>("");

  // Set default recipient address to PKP's own address
  useEffect(() => {
    if (selectedPkp?.ethAddress && selectedPkp.ethAddress !== "N/A" && !initialRecipient) {
      setRecipientAddress(selectedPkp.ethAddress);
    }
  }, [selectedPkp?.ethAddress, initialRecipient]);

  // Update form when initial values change
  useEffect(() => {
    if (initialRecipient) {
      setRecipientAddress(initialRecipient);
    }
  }, [initialRecipient]);

  useEffect(() => {
    if (initialAmount) {
      setSendAmount(initialAmount);
    }
  }, [initialAmount]);

  const sendTransaction = async () => {
    if (
      !user?.authContext ||
      !recipientAddress ||
      !sendAmount ||
      !services?.litClient
    ) {
      setStatus("Missing auth context, recipient address, amount, or Lit client");
      return;
    }

    setIsSendingTransaction(true);
    setStatus("Preparing and sending transaction...");
    try {
      // Get the selected chain configuration (supports custom chains)
      const allChains = getAllChains();
      const chainInfo = allChains[selectedChain as keyof typeof allChains];
      if (!chainInfo) {
        setStatus(`Unknown chain: ${selectedChain}`);
        setIsSendingTransaction(false);
        return;
      }

      // Create a custom chain config for viem
      const chainConfig = {
        id: chainInfo.id,
        name: chainInfo.name,
        network: chainInfo.litIdentifier,
        nativeCurrency: {
          name: chainInfo.name,
          symbol: chainInfo.symbol,
          decimals: 18,
        },
        rpcUrls: {
          default: {
            http: [chainInfo.rpcUrl],
          },
          public: {
            http: [chainInfo.rpcUrl],
          },
        },
        blockExplorers: {
          default: {
            name: `${chainInfo.name} Explorer`,
            url: chainInfo.explorerUrl,
          },
        },
      };

      // Get PKP as a viem account
      const pkpViemAccount = await services.litClient.getPkpViemAccount({
        pkpPublicKey: selectedPkp?.pubkey || user?.pkpInfo?.pubkey,
        authContext: user.authContext,
        chainConfig: chainConfig,
      });

      // Create wallet client with PKP account
      const { createWalletClient, http, parseEther } = await import("viem");

      const walletClient = createWalletClient({
        account: pkpViemAccount,
        chain: chainConfig,
        transport: http(chainInfo.rpcUrl),
      });

      // Send the transaction
      const hash = await walletClient.sendTransaction({
        account: pkpViemAccount,
        chain: chainConfig,
        to: recipientAddress as `0x${string}`,
        value: parseEther(sendAmount),
      });

      const result: TransactionResult = {
        hash,
        to: recipientAddress,
        value: sendAmount,
        from: pkpViemAccount.address,
        timestamp: new Date().toISOString(),
        chainId: chainInfo.id,
        chainName: chainInfo.name,
        explorerUrl: chainInfo.explorerUrl,
      };

      setTransactionResult(result);
      setIsSendingTransaction(false);
      setStatus("Transaction sent successfully!");
      try {
        const addr = selectedPkp?.ethAddress || user.pkpInfo?.ethAddress;
        if (addr) await triggerLedgerRefresh(addr);
      } catch {
        // ignore ledger refresh errors
      }

      // Invoke callback if provided
      if (onTransactionComplete) onTransactionComplete(result);
    } catch (error: any) {
      console.error("Failed to send transaction:", error);
      setIsSendingTransaction(false);
      setStatus(`Failed to send transaction: ${error.message || error}`);
    } finally {
      setIsSendingTransaction(false);
    }
  };

  const chainInfo = (() => {
    const allChains = getAllChains();
    return allChains[selectedChain as keyof typeof allChains];
  })();

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        boxShadow: "",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "12px",
          right: "12px",
          padding: "4px 8px",
          backgroundColor: "#f59e0b",
          color: "white",
          borderRadius: "12px",
          fontSize: "10px",
          fontWeight: "600",
          textTransform: "uppercase",
        }}
      >
        Viem Integration
      </div>
      
      <h3 style={{ margin: "0 0 16px 0", color: "#1f2937" }}>
        💸 Send Transaction
      </h3>
      <p
        style={{
          margin: "0 0 16px 0",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        Send {chainInfo?.symbol || "ETH"} using your PKP Viem Account.
      </p>

      {/* Chain Information */}
      <div
        style={{
          marginBottom: "16px",
          padding: "8px 12px",
          backgroundColor: "#f3f4f6",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#374151",
        }}
      >
        <strong>Network:</strong> {chainInfo?.name} ({chainInfo?.symbol})
        {chainInfo?.testnet && (
          <span style={{ color: "#f59e0b", marginLeft: "8px" }}>
            • This is a testnet
          </span>
        )}
      </div>

      <input
        type="text"
        value={recipientAddress}
        onChange={(e) => setRecipientAddress(e.target.value)}
        placeholder="Recipient address (0x...)"
        disabled={disabled || isSendingTransaction}
        style={{
          width: "100%",
          padding: "12px",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          fontSize: "14px",
          fontFamily: "monospace",
          marginBottom: "12px",
          color: "#374151",
          backgroundColor: disabled ? "#f3f4f6" : "#ffffff",
        }}
      />

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <input
          type="number"
          value={sendAmount}
          onChange={(e) => setSendAmount(e.target.value)}
          placeholder={`Amount in ${chainInfo?.symbol || "ETH"}`}
          step="0.001"
          min="0"
          disabled={disabled || isSendingTransaction}
          style={{
            flex: 1,
            padding: "12px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            color: "#374151",
            backgroundColor: disabled ? "#f3f4f6" : "#ffffff",
          }}
        />
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "#f3f4f6",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            color: "#6b7280",
            display: "flex",
            alignItems: "center",
          }}
        >
          {chainInfo?.symbol || "ETH"}
        </div>
      </div>

      <button
        onClick={sendTransaction}
        disabled={
          disabled ||
          isSendingTransaction ||
          !recipientAddress ||
          !sendAmount ||
          parseFloat(sendAmount) <= 0
        }
        className={`w-full p-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border-1 border-gray-200 ${
          disabled ||
          isSendingTransaction ||
          !recipientAddress ||
          !sendAmount ||
          parseFloat(sendAmount) <= 0
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-[#B7410D] text-white cursor-pointer"
        }`}
      >
        {isSendingTransaction ? (
          <>
            <LoadingSpinner size={16} />
            Sending...
          </>
        ) : (
          "Send Transaction"
        )}
      </button>

      {/* Status Display */}
      {status && (
        <div
          style={{
            marginTop: "12px",
            padding: "8px 12px",
            backgroundColor: status.includes("successfully") ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${status.includes("successfully") ? "#bbf7d0" : "#fecaca"}`,
            borderRadius: "6px",
            color: status.includes("successfully") ? "#15803d" : "#dc2626",
            fontSize: "12px",
          }}
        >
          {status}
        </div>
      )}

      {/* Transaction Result */}
      {transactionResult && (
        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: "8px",
          }}
        >
          <h4
            style={{
              margin: "0 0 8px 0",
              color: "#15803d",
              fontSize: "14px",
            }}
          >
            ✅ Transaction Sent
          </h4>
          <div
            style={{
              fontSize: "11px",
              fontFamily: "monospace",
              wordBreak: "break-all",
              color: "#15803d",
            }}
          >
            <div style={{ marginBottom: "4px" }}>
              <strong>Hash:</strong>{" "}
              <a
                href={`${
                  transactionResult.explorerUrl ||
                  "https://yellowstone-explorer.litprotocol.com"
                }/tx/${transactionResult.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#1d4ed8",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#1d4ed8";
                }}
              >
                {transactionResult.hash}
              </a>
            </div>
            <div style={{ marginBottom: "4px" }}>
              <strong>Network:</strong> {transactionResult.chainName || "Unknown"}
              {transactionResult.chainId && ` (ID: ${transactionResult.chainId})`}
            </div>
            <div style={{ marginBottom: "4px" }}>
              <strong>To:</strong> {transactionResult.to}
            </div>
            <div style={{ marginBottom: "4px" }}>
              <strong>From:</strong> {transactionResult.from}
            </div>
            <div>
              <strong>Value:</strong> {transactionResult.value} {chainInfo?.symbol || "ETH"}
            </div>
          </div>
        </div>
      )}

      {/* Faucet Information for testnets */}
      {/* {chainInfo?.testnet && (
        <div
          style={{
            marginTop: "12px",
            padding: "8px 12px",
            backgroundColor: "#e0f2fe",
            border: "1px solid #0284c7",
            borderRadius: "6px",
            fontSize: "12px",
            color: "#0284c7",
          }}
        >
          💰 <strong>Need test tokens?</strong> Visit the{" "}
          <a
            href="https://chronicle-yellowstone-faucet.getlit.dev/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#0284c7",
              textDecoration: "underline",
              fontWeight: "500",
            }}
          >
            Chronicle Yellowstone Faucet
          </a>{" "}
          to request free test tokens.
        </div>
      )} */}
    </div>
  );
}; 
