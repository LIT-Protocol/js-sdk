/**
 * AddAddressForm Component
 * 
 * Form for adding permitted addresses to a PKP
 */

import { useState, type FC } from "react";

import { useLitAuth } from '../../../../lit-login-modal/LitAuthProvider';
import { usePKPPermissions } from '../../contexts/PKPPermissionsContext';
import { AVAILABLE_SCOPES } from '../../types';
import { triggerLedgerRefresh } from '../../utils/ledgerRefresh';
import { ScopeCheckboxes } from '../ui/ScopeCheckboxes';

interface AddAddressFormProps {
  disabled?: boolean;
}

export const AddAddressForm: FC<AddAddressFormProps> = ({
  disabled = false,
}) => {
  const { addPermittedAddress } = usePKPPermissions();
  const { user } = useLitAuth();
  const [newPermittedAddress, setNewPermittedAddress] = useState(
    "0xef3eE1bD838aF5B36482FAe8a6Fc394C68d5Fa9F"
  );
  const [newAddressSelectedScopes, setNewAddressSelectedScopes] = useState<string[]>(["sign-anything"]);
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async () => {
    if (!newPermittedAddress.trim() || newAddressSelectedScopes.length === 0) {
      return;
    }

    setIsAdding(true);
    try {
      await addPermittedAddress(newPermittedAddress, newAddressSelectedScopes);
      
      // Clear form on success
      setNewPermittedAddress("");
      setNewAddressSelectedScopes([]);
      try {
        const addr = user?.pkpInfo?.ethAddress;
        if (addr) await triggerLedgerRefresh(addr);
      } catch {
        // ignore ledger refresh errors
      }
    } catch (error) {
      console.error("Failed to add permitted address:", error);
    } finally {
      setIsAdding(false);
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
      }}
    >
      <h3 style={{ margin: "0 0 16px 0", color: "#1f2937" }}>
        🏠 Add Address Permission
      </h3>
      <p
        style={{
          margin: "0 0 16px 0",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        Allow a specific address to use your PKP.
      </p>

      <input
        type="text"
        value={newPermittedAddress}
        onChange={(e) => setNewPermittedAddress(e.target.value)}
        placeholder="Ethereum Address (0x...)"
        disabled={disabled || isAdding}
        style={{
          width: "100%",
          padding: "12px",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          fontSize: "13px",
          marginBottom: "16px",
          fontFamily: "monospace",
          backgroundColor: disabled ? "#f3f4f6" : "#ffffff",
          color: disabled ? "#6b7280" : "#000000",
        }}
      />

      <ScopeCheckboxes
        availableScopes={AVAILABLE_SCOPES}
        selectedScopes={newAddressSelectedScopes}
        onScopeChange={setNewAddressSelectedScopes}
        disabled={disabled || isAdding}
      />

      <button
        onClick={handleSubmit}
        disabled={
          disabled ||
          isAdding ||
          !newPermittedAddress.trim() ||
          newAddressSelectedScopes.length === 0
        }
        className={`w-full p-3 rounded-lg text-sm font-medium border-1 border-gray-200 ${
          disabled ||
          isAdding ||
          !newPermittedAddress.trim() ||
          newAddressSelectedScopes.length === 0
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-[#B7410D] text-white cursor-pointer"
        }`}
      >
        {isAdding ? "Adding..." : "Add Address Permission"}
      </button>
    </div>
  );
}; 
