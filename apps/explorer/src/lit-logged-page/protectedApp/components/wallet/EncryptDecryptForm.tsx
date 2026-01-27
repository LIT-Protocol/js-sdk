/**
 * EncryptDecryptForm Component
 * 
 * Form for encrypting and decrypting data with PKP
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, type FC } from "react";

import { useLitAuth } from "../../../../lit-login-modal/LitAuthProvider";
import { UIPKP } from "../../types";
import { LoadingSpinner } from "../ui/LoadingSpinner";

import type { EncryptResponse } from "@lit-protocol/types";

// Default message constant
const DEFAULT_ENCRYPT_MESSAGE = "This is my secret message! 🤫";

interface EncryptDecryptFormProps {
  selectedPkp: UIPKP | null;
  disabled?: boolean;
}

type ExtendedEncryptResponse = EncryptResponse & {
  originalMessage: string;
  pkpAddress: string;
  timestamp: string;
};

export const EncryptDecryptForm: FC<EncryptDecryptFormProps> = ({
  selectedPkp,
  disabled = false,
}) => {
  const { user, services } = useLitAuth();
  const [messageToEncrypt, setMessageToEncrypt] = useState(DEFAULT_ENCRYPT_MESSAGE);
  const [encryptedData, setEncryptedData] = useState<ExtendedEncryptResponse | null>(null);
  const [decryptedMessage, setDecryptedMessage] = useState<string>("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [status, setStatus] = useState<string>("");

  const encryptData = async () => {
    if (
      !services?.litClient ||
      !messageToEncrypt.trim() ||
      !user?.authContext
    ) {
      setStatus("No Lit client, message to encrypt, or auth context");
      return;
    }

    setIsEncrypting(true);
    setStatus("Encrypting data...");
    try {
      const { createAccBuilder } = await import(
        "@lit-protocol/access-control-conditions"
      );

      // Get the actual PKP address from the viem account
      const chainConfig = services.litClient.getChainConfig().viemConfig;
      const pkpViemAccount = await services.litClient.getPkpViemAccount({
        pkpPublicKey: selectedPkp?.pubkey || user?.pkpInfo?.pubkey,
        authContext: user.authContext,
        chainConfig: chainConfig,
      });

      // Create access control conditions using the basic pattern
      const builder = createAccBuilder();
      const accs = builder
        .requireWalletOwnership(pkpViemAccount.address)
        .on("ethereum")
        .build();

      const encrypted = await services.litClient.encrypt({
        dataToEncrypt: messageToEncrypt,
        unifiedAccessControlConditions: accs,
        chain: "ethereum",
      });

      setEncryptedData({
        ...encrypted,
        originalMessage: messageToEncrypt,
        pkpAddress: pkpViemAccount.address,
        timestamp: new Date().toISOString(),
      });
      setStatus("Data encrypted successfully!");
    } catch (error: any) {
      console.error("Failed to encrypt data:", error);
      setStatus(`Failed to encrypt data: ${error.message || error}`);
    } finally {
      setIsEncrypting(false);
    }
  };

  const decryptData = async () => {
    if (!user?.authData || !encryptedData || !services?.litClient) {
      setStatus("No auth data, encrypted data, or Lit client");
      return;
    }

    setIsDecrypting(true);
    setStatus("Creating auth context for decryption...");
    try {
      const { createAccBuilder } = await import(
        "@lit-protocol/access-control-conditions"
      );

      // Use the same PKP address that was used for encryption
      const pkpAddress = encryptedData.pkpAddress || selectedPkp?.ethAddress;
      if (!pkpAddress) {
        throw new Error("Cannot determine PKP address for decryption");
      }

      // Create the same access control conditions as used in encryption
      const builder = createAccBuilder();
      const accs = builder
        .requireWalletOwnership(pkpAddress)
        .on("ethereum")
        .build();

      // Create a new authContext specifically for decryption with proper capabilities
      setStatus("Creating auth context with decryption capabilities...");
      const decryptionAuthContext =
        await services.authManager.createPkpAuthContext({
          authData: user.authData,
          pkpPublicKey: selectedPkp?.pubkey || user?.pkpInfo?.pubkey,
          authConfig: {
            capabilityAuthSigs: [],
            expiration: new Date(
              Date.now() + 1000 * 60 * 60 * 24
            ).toISOString(),
            statement: "",
            domain: "",
            resources: [
              ["pkp-signing", "*"],
              ["lit-action-execution", "*"],
              ["access-control-condition-decryption", "*"],
            ],
          },
          litClient: services.litClient,
        });

      setStatus("Decrypting data...");
      const decrypted = await services.litClient.decrypt({
        data: encryptedData,
        unifiedAccessControlConditions: accs,
        authContext: decryptionAuthContext,
        chain: "ethereum",
      });

      let decryptedText: string;
      if (typeof decrypted.convertedData === "string") {
        decryptedText = decrypted.convertedData;
      } else if (decrypted.convertedData) {
        try {
          decryptedText = JSON.stringify(decrypted.convertedData);
        } catch {
          decryptedText = String(decrypted.convertedData);
        }
      } else {
        decryptedText = new TextDecoder().decode(decrypted.decryptedData);
      }
      setDecryptedMessage(decryptedText);
      setStatus("Data decrypted successfully!");
    } catch (error: any) {
      console.error("Failed to decrypt data:", error);
      setStatus(`Failed to decrypt data: ${error.message || error}`);
    } finally {
      setIsDecrypting(false);
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
        marginBottom: "20px",
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", color: "#1f2937" }}>
        🔐 Encrypt & Decrypt
      </h3>
      <p
        style={{
          margin: "0 0 16px 0",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        Encrypt data that only your PKP can decrypt.
      </p>

      <textarea
        value={messageToEncrypt}
        onChange={(e) => setMessageToEncrypt(e.target.value)}
        placeholder="Enter message to encrypt..."
        disabled={disabled || isEncrypting}
        style={{
          width: "100%",
          height: "80px",
          padding: "12px",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          fontSize: "14px",
          marginBottom: "12px",
          resize: "vertical",
          color: "#374151",
          backgroundColor: disabled ? "#f3f4f6" : "#ffffff",
        }}
      />

      <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
        <button
          onClick={encryptData}
          disabled={disabled || isEncrypting || !messageToEncrypt.trim()}
          style={{
            flex: 1,
            padding: "12px",
            backgroundColor: 
              disabled || isEncrypting || !messageToEncrypt.trim()
                ? "#9ca3af" 
                : "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: 
              disabled || isEncrypting || !messageToEncrypt.trim()
                ? "not-allowed" 
                : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {isEncrypting ? (
            <>
              <LoadingSpinner size={16} />
              Encrypting...
            </>
          ) : (
            "Encrypt"
          )}
        </button>

        <button
          onClick={decryptData}
          disabled={disabled || isDecrypting || !encryptedData}
          style={{
            flex: 1,
            padding: "12px",
            backgroundColor: 
              disabled || isDecrypting || !encryptedData
                ? "#9ca3af" 
                : "#059669",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor:
              disabled || isDecrypting || !encryptedData 
                ? "not-allowed" 
                : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {isDecrypting ? (
            <>
              <LoadingSpinner size={16} />
              Decrypting...
            </>
          ) : (
            "Decrypt"
          )}
        </button>
      </div>

      {/* Status Display */}
      {status && (
        <div
          style={{
            marginBottom: "12px",
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

      {/* Encrypted Data Display */}
      {encryptedData && (
        <div
          style={{
            marginBottom: "12px",
            padding: "12px",
            backgroundColor: "#fef3c7",
            border: "1px solid #fbbf24",
            borderRadius: "8px",
          }}
        >
          <h4
            style={{
              margin: "0 0 8px 0",
              color: "#92400e",
              fontSize: "14px",
            }}
          >
            🔒 Data Encrypted
          </h4>
          <div
            style={{
              fontSize: "12px",
              color: "#92400e",
              marginBottom: "8px",
            }}
          >
            Encrypted at: {new Date(encryptedData.timestamp).toLocaleString()}
          </div>
          <div
            style={{
              fontSize: "11px",
              fontFamily: "monospace",
              color: "#92400e",
              backgroundColor: "#fef8e1",
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #f59e0b",
              wordBreak: "break-all",
              maxHeight: "120px",
              overflow: "auto",
            }}
          >
            <div style={{ marginBottom: "6px" }}>
              <strong>Ciphertext:</strong> {encryptedData.ciphertext || "N/A"}
            </div>
            <div style={{ marginBottom: "6px" }}>
              <strong>Data Hash:</strong> {encryptedData.dataToEncryptHash || "N/A"}
            </div>
            <div style={{ marginBottom: "6px" }}>
              <strong>Original:</strong> "{encryptedData.originalMessage}"
            </div>
            <div>
              <strong>PKP Address:</strong> {encryptedData.pkpAddress}
            </div>
          </div>
        </div>
      )}

      {/* Decrypted Message Display */}
      {decryptedMessage && (
        <div
          style={{
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
            🔓 Decrypted Message
          </h4>
          <div
            style={{
              fontSize: "14px",
              color: "#15803d",
              fontStyle: "italic",
              padding: "8px",
              backgroundColor: "#dcfce7",
              borderRadius: "4px",
              border: "1px solid #bbf7d0",
            }}
          >
            "{decryptedMessage}"
          </div>
        </div>
      )}
    </div>
  );
}; 
