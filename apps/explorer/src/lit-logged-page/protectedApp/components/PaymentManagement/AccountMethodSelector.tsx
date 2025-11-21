/**
 * AccountMethodSelector.tsx
 *
 * A reusable component for selecting and creating accounts using either:
 * - Private key (viem account)
 * - Connected wallet (wallet client)
 *
 * Default method is connected wallet for better UX.
 */

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useState } from "react";
import { privateKeyToAccount } from "viem/accounts";
import { useWalletClient } from "wagmi";
import { APP_INFO, FEATURES } from "../../../../_config";

// Code snippets for documentation
export const CREATE_ACCOUNT_PRIVATE_KEY_CODE = `
import { privateKeyToAccount } from 'viem/accounts';

const myAccount = privateKeyToAccount(
  process.env.PRIVATE_KEY as \`0x\${string}\`
);`;

export const CREATE_ACCOUNT_WALLET_CLIENT_CODE = `
import { useWalletClient } from 'wagmi';

// Use your connected wallet as the account
const { data: myAccount } = useWalletClient();`;

interface AccountMethodSelectorProps {
  onAccountCreated: (account: any) => void;
  onMethodChange: (method: "privateKey" | "walletClient") => void;
  setStatus: (status: string) => void;
  showError?: (error: string) => void;
  showSuccess?: (actionId: string) => void;
  disabled?: boolean;
  successActionIds?: {
    createAccount?: string;
    getWalletAccount?: string;
  };
  successActions?: Set<string>;
}

export default function AccountMethodSelector({
  onAccountCreated,
  onMethodChange,
  setStatus,
  showError,
  showSuccess,
  disabled = false,
  successActionIds = {
    createAccount: "create-account",
    getWalletAccount: "get-wallet-account",
  },
  successActions = new Set(),
}: AccountMethodSelectorProps) {
  const { data: walletClient } = useWalletClient();

  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [accountMethod, setAccountMethod] = useState<
    "privateKey" | "walletClient"
  >("walletClient"); // Default to wallet client
  const [privateKey, setPrivateKey] = useState<string>(APP_INFO.defaultPrivateKey);

  // Utility function to format error messages properly
  const formatErrorMessage = (prefix: string, error: any): string => {
    let errorMessage = prefix;
    if (error?.message) {
      errorMessage += error.message;
    } else if (typeof error === "object") {
      errorMessage += JSON.stringify(error, null, 2);
    } else {
      errorMessage += String(error);
    }
    return errorMessage;
  };

  const createAccountFromPrivateKey = async () => {
    try {
      setIsCreatingAccount(true);
      setStatus("Creating viem account from private key...");

      if (!privateKey.startsWith("0x") || privateKey.length !== 66) {
        throw new Error(
          "Invalid private key format. Must be a hex string starting with 0x and 66 characters long."
        );
      }

      const myAccount = privateKeyToAccount(privateKey as `0x${string}`);
      onAccountCreated(myAccount);
      setStatus(`Successfully created account: ${myAccount.address}`);
      showSuccess?.(successActionIds.createAccount!);
    } catch (error: any) {
      console.error("Error creating account:", error);
      const errorMessage = formatErrorMessage(
        "Failed to create account: ",
        error
      );
      setStatus(errorMessage);
      showError?.(errorMessage);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const createAccountFromWalletClient = async () => {
    try {
      setIsCreatingAccount(true);
      setStatus("Getting account from connected wallet...");

      if (!walletClient || !walletClient.account) {
        throw new Error(
          "No wallet connected. Please connect your wallet first."
        );
      }

      onAccountCreated(walletClient);
      setStatus(
        `Successfully got account from wallet: ${walletClient.account.address}`
      );
      showSuccess?.(successActionIds.getWalletAccount!);
    } catch (error: any) {
      console.error("Error getting wallet account:", error);
      const errorMessage = formatErrorMessage(
        "Failed to get wallet account: ",
        error
      );
      setStatus(errorMessage);
      showError?.(errorMessage);
    } finally {
      setIsCreatingAccount(false);
    }
  };

  const createAccount = async () => {
    if (accountMethod === "privateKey") {
      return createAccountFromPrivateKey();
    } else {
      return createAccountFromWalletClient();
    }
  };

  const handleMethodChange = (method: "privateKey" | "walletClient") => {
    setAccountMethod(method);
    onMethodChange(method);
  };
  const successKey =
    accountMethod === "privateKey"
      ? successActionIds.createAccount
      : successActionIds.getWalletAccount;
  const hasCompletedAction = successKey
    ? Boolean(successActions?.has(successKey))
    : false;

  return (
    <div style={{ marginBottom: "10px" }}>
      {/* Account Method Selector */}
      <div style={{ marginBottom: "15px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "8px",
            fontWeight: "500",
            color: "#000",
          }}
        >
          Choose Account Method:
        </label>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <button
            onClick={() => handleMethodChange("walletClient")}
            disabled={disabled}
            style={{
              padding: "8px 15px",
              backgroundColor:
                accountMethod === "walletClient" ? "#4285F4" : "#f0f0f0",
              color: accountMethod === "walletClient" ? "white" : "#333",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: disabled ? "not-allowed" : "pointer",
              fontSize: "14px",
              opacity: disabled ? 0.6 : 1,
            }}
          >
            Connected Wallet
          </button>
          <button
            onClick={() => handleMethodChange("privateKey")}
            disabled={disabled}
            style={{
              padding: "8px 15px",
              backgroundColor:
                accountMethod === "privateKey" ? "#4285F4" : "#f0f0f0",
              color: accountMethod === "privateKey" ? "white" : "#333",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: disabled ? "not-allowed" : "pointer",
              fontSize: "14px",
              opacity: disabled ? 0.6 : 1,
            }}
          >
            Private Key
          </button>
        </div>
      </div>

      {/* Private Key Input (only show when private key method is selected) */}
      {accountMethod === "privateKey" && (
        <div style={{ marginBottom: "10px", color: "#000" }}>
          <label
            htmlFor="privateKey"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "500",
              color: "#000",
            }}
          >
            Private Key:
          </label>
          <input
            id="privateKey"
            type="password"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="0x..."
            disabled={disabled}
            className="placeholder-black/70 text-black"
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontFamily: "monospace",
              fontSize: "14px",
              opacity: disabled ? 0.6 : 1,
              color: "#000",
            }}
          />
          <small style={{ color: "#666", fontSize: "12px" }}>
            Default test private key is provided. Replace with your own for
            production use.
          </small>
        </div>
      )}

      {/* Wallet Client Info (only show when wallet client method is selected) */}
      {accountMethod === "walletClient" && (
        <div
          style={{
            marginBottom: "10px",
            padding: "10px",
            backgroundColor: "#f8f9fa",
            borderRadius: "4px",
            border: "1px solid #e9ecef",
          }}
        >
          <p style={{ margin: "0 0 8px 0", fontSize: "14px", color: "#000" }}>
            <strong style={{ color: "#000" }}>Using Connected Wallet:</strong>{" "}
            This will use your currently connected wallet account (e.g.,
            MetaMask).
          </p>
          <p style={{ margin: "0", fontSize: "12px", color: "#000" }}>
            Make sure your wallet is connected and you have test tokens. Need
            tokens? Visit the{" "}
            <a
              href={`${APP_INFO.faucetUrl}?action=combined&ledgerPercent=80`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#4285F4", textDecoration: "underline" }}
            >
              Chronicle Yellowstone Faucet
            </a>
            <div style={{ marginTop: "10px" }}>
              <ConnectButton showBalance={FEATURES.showWalletBalance} />
            </div>
          </p>
        </div>
      )}

      <button
        onClick={createAccount}
        disabled={isCreatingAccount || disabled}
        style={{
          padding: "10px 15px",
          backgroundColor:
            isCreatingAccount || disabled ? "#cccccc" : "#4285F4",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: isCreatingAccount || disabled ? "not-allowed" : "pointer",
          fontWeight: "500",
        }}
      >
        {isCreatingAccount
          ? "Creating..."
          : hasCompletedAction
          ? "✅ Account Ready"
          : accountMethod === "privateKey"
          ? "Create Account from Private Key"
          : "Use Connected Wallet Account"}
      </button>
      {hasCompletedAction && (
        <p
          style={{
            marginTop: "6px",
            fontSize: "12px",
            color: "#16a34a",
          }}
        >
          Account linked successfully.
        </p>
      )}
    </div>
  );
}

// Export the account method type for consumers
export type AccountMethod = "privateKey" | "walletClient";
