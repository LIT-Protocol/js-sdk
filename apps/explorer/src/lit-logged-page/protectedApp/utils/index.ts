/**
 * Utility functions for ProtectedApp components
 * Contains shared helper functions and formatters
 */

import bs58 from "bs58";
import { SCOPE_VALUES } from "../types";

// Formatting utilities
export const formatTxHash = (hash: string): string => {
  if (!hash) return "";
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
};

export const formatAddress = (address: string): string => {
  if (!address) return "N/A";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatPublicKey = (pubKey: string): string => {
  if (!pubKey) return "N/A";
  return `${pubKey.slice(0, 30)}...${pubKey.slice(-30)}`;
};

// Helper function to convert hex to IPFS CID (for LitAction auth methods)
export const hexToIpfsCid = (hex: string): string => {
  try {
    // Remove 0x prefix if present
    const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
    // Convert hex string to bytes array
    const bytes = new Uint8Array(
      cleanHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );
    return bs58.encode(bytes);
  } catch (error) {
    console.error("Error converting hex to IPFS CID:", error);
    return hex; // Return original if conversion fails
  }
};

// Scope value decoder
export const decodeScopeValues = (scopes: any) => {
  if (!scopes || typeof scopes !== "object") return scopes;

  if (Array.isArray(scopes)) {
    return scopes.map((scope: any) => {
      if (
        typeof scope === "number" &&
        scope >= 0 &&
        scope < SCOPE_VALUES.length
      ) {
        return `${scope} (${SCOPE_VALUES[scope]})`;
      }
      return scope;
    });
  }

  const decoded = { ...scopes };
  for (const [key, value] of Object.entries(decoded)) {
    if (Array.isArray(value)) {
      decoded[key] = value.map((item: any) => {
        if (
          typeof item === "number" &&
          item >= 0 &&
          item < SCOPE_VALUES.length
        ) {
          return `${item} (${SCOPE_VALUES[item]})`;
        }
        return item;
      });
    }
  }

  return decoded;
};

// Auth method type name mapping
export const getAuthMethodTypeName = (typeNumber: number): string => {
  const AUTH_METHOD_TYPE = {
    EthWallet: 1,
    LitAction: 2,
    WebAuthn: 3,
    Discord: 4,
    Google: 5,
    GoogleJwt: 6,
    AppleJwt: 8,
    StytchOtp: 9,
    StytchEmailFactorOtp: 10,
    StytchSmsFactorOtp: 11,
    StytchWhatsAppFactorOtp: 12,
    StytchTotpFactorOtp: 13,
  };

  const entry = Object.entries(AUTH_METHOD_TYPE).find(
    ([, value]) => value === typeNumber
  );
  return entry ? entry[0] : `Unknown (${typeNumber})`;
};

// Copy to clipboard utility
export const copyToClipboard = async (text: string, onSuccess?: (field: string) => void, fieldName?: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    if (onSuccess && fieldName) {
      onSuccess(fieldName);
    }
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    if (onSuccess && fieldName) {
      onSuccess(fieldName);
    }
  }
}; 