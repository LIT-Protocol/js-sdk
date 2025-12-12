/**
 * ViemAccountForm Component
 *
 * Form for signing messages using PKP as a Viem account
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, type FC } from "react";

import { useLitAuth } from "../../../../lit-login-modal/LitAuthProvider";
import { UIPKP } from "../../types";
import { triggerLedgerRefresh } from "../../utils/ledgerRefresh";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface ViemAccountFormProps {
  selectedPkp: UIPKP | null;
  disabled?: boolean;
}

interface ViemSignatureResult {
  message: string;
  signature: string;
  address: string;
  timestamp: string;
}

export const ViemAccountForm: FC<ViemAccountFormProps> = ({
  selectedPkp,
  disabled = false,
}) => {
  const { user, services } = useLitAuth();
  const [viemAccountMessage, setViemAccountMessage] = useState(
    "Hello from PKP Viem Account!"
  );
  const [viemSignature, setViemSignature] =
    useState<ViemSignatureResult | null>(null);
  const [isSigningViem, setIsSigningViem] = useState(false);
  const [status, setStatus] = useState<string>("");

  const signWithViemAccount = async () => {
    console.log("[signWithViemAccount] Called.");
    if (
      !user?.authContext ||
      !viemAccountMessage.trim() ||
      !services?.litClient
    ) {
      setStatus("No auth context, message to sign, or Lit client");
      return;
    }

    setIsSigningViem(true);
    setStatus("Signing with PKP Viem Account...");
    try {
      // Get chain config from litClient
      const chainConfig = services.litClient.getChainConfig().viemConfig;

      // Get PKP as a viem account
      const pkpViemAccount = await services.litClient.getPkpViemAccount({
        pkpPublicKey: selectedPkp?.pubkey || user?.pkpInfo?.pubkey,
        authContext: user.authContext,
        chainConfig: chainConfig,
      });
      console.log("[signWithViemAccount] pkpViemAccount:", pkpViemAccount);

      // Sign the message
      const signature = await pkpViemAccount.signMessage({
        message: viemAccountMessage,
      });
      console.log("[signWithViemAccount] signature:", signature);

      setViemSignature({
        message: viemAccountMessage,
        signature,
        address: pkpViemAccount.address,
        timestamp: new Date().toISOString(),
      });
      setIsSigningViem(false);
      setStatus("Message signed with PKP Viem Account!");
      try {
        const addr = selectedPkp?.ethAddress || user.pkpInfo?.ethAddress;
        if (addr) await triggerLedgerRefresh(addr);
      } catch {
        // ignore ledger refresh errors
      }
    } catch (error: any) {
      console.error("Failed to sign with viem account:", error);
      setIsSigningViem(false);
      setStatus(`Failed to sign with viem account: ${error.message || error}`);
    }
  };

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
        ✍️ Sign a Message
      </h3>
      <p
        style={{
          margin: "0 0 16px 0",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        Sign messages using PKP as a viem account.
      </p>

      <input
        type="text"
        value={viemAccountMessage}
        onChange={(e) => setViemAccountMessage(e.target.value)}
        placeholder="Enter message to sign..."
        disabled={disabled || isSigningViem}
        style={{
          width: "100%",
          padding: "12px",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          fontSize: "14px",
          marginBottom: "12px",
          color: "#374151",
          backgroundColor: disabled ? "#f3f4f6" : "#ffffff",
        }}
      />

      <button
        onClick={signWithViemAccount}
        disabled={disabled || isSigningViem || !viemAccountMessage.trim()}
        className={`w-full p-3 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border-1 border-gray-200 ${
          disabled || isSigningViem || !viemAccountMessage.trim()
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-[#B7410D] text-white cursor-pointer"
        }`}
      >
        {isSigningViem ? (
          <>
            <LoadingSpinner size={16} />
            Signing...
          </>
        ) : (
          "Sign with Viem Account"
        )}
      </button>

      {/* Status Display */}
      {status && (
        <div
          style={{
            marginTop: "12px",
            padding: "8px 12px",
            backgroundColor: status.includes("signed") ? "#f0fdf4" : "#fef2f2",
            border: `1px solid ${
              status.includes("signed") ? "#bbf7d0" : "#fecaca"
            }`,
            borderRadius: "6px",
            color: status.includes("signed") ? "#15803d" : "#dc2626",
            fontSize: "12px",
          }}
        >
          {status}
        </div>
      )}

      {/* Viem Signature Result */}
      {viemSignature && (
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
            ✅ Viem Signature
          </h4>
          <div style={{ fontSize: "12px", color: "#15803d" }}>
            <div style={{ marginBottom: "4px" }}>
              <strong>Message:</strong> "{viemSignature.message}"
            </div>
            <div style={{ marginBottom: "4px" }}>
              <strong>Address:</strong> {viemSignature.address}
            </div>
            <div style={{ marginBottom: "4px" }}>
              <strong>Timestamp:</strong>{" "}
              {new Date(viemSignature.timestamp).toLocaleString()}
            </div>
            <div
              style={{
                fontFamily: "monospace",
                wordBreak: "break-all",
                backgroundColor: "#dcfce7",
                padding: "4px 6px",
                borderRadius: "4px",
                border: "1px solid #bbf7d0",
              }}
            >
              <strong>Signature:</strong> {viemSignature.signature}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      {/* <div
        style={{
          marginTop: "12px",
          padding: "8px 12px",
          backgroundColor: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "6px",
          fontSize: "12px",
          color: "#1e40af",
        }}
      >
        💡 <strong>Viem Integration:</strong> This component demonstrates how PKPs integrate seamlessly with popular web3 libraries like Viem.
      </div> */}
    </div>
  );
};
