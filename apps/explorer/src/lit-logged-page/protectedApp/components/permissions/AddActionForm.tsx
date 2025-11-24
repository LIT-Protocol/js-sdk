/**
 * AddActionForm Component
 * 
 * Form for adding permitted actions to a PKP
 */

import React, { useState } from 'react';
import { ScopeCheckboxes } from '../ui/ScopeCheckboxes';
import { AVAILABLE_SCOPES } from '../../types';
import { usePKPPermissions } from '../../contexts/PKPPermissionsContext';
import { useLitAuth } from '../../../../lit-login-modal/LitAuthProvider';
import { triggerLedgerRefresh } from '../../utils/ledgerRefresh';

interface AddActionFormProps {
  disabled?: boolean;
}

export const AddActionForm: React.FC<AddActionFormProps> = ({ disabled = false }) => {
  const { addPermittedAction } = usePKPPermissions();
  const { user } = useLitAuth();
  const [newActionIpfsId, setNewActionIpfsId] = useState(
    "QmSQDKRWEXZ9CGoucSTR11Mv6fhGqaytZ1MqrfHdkuS1Vg"
  );
  const [newActionSelectedScopes, setNewActionSelectedScopes] = useState<string[]>(["sign-anything"]);
  const [isAdding, setIsAdding] = useState(false);

  const handleSubmit = async () => {
    if (!newActionIpfsId.trim() || newActionSelectedScopes.length === 0) {
      return;
    }

    setIsAdding(true);
    try {
      await addPermittedAction(newActionIpfsId, newActionSelectedScopes);
      
      // Clear form on success
      setNewActionIpfsId("");
      setNewActionSelectedScopes([]);
      try {
        const addr = user?.pkpInfo?.ethAddress;
        if (addr) await triggerLedgerRefresh(addr);
      } catch {}
    } catch (error) {
      console.error("Failed to add permitted action:", error);
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
        ➕ Add Lit Action Permission
      </h3>
      <p
        style={{
          margin: "0 0 16px 0",
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        Allow your PKP to execute a specific Lit Action.
      </p>

      <input
        type="text"
        value={newActionIpfsId}
        onChange={(e) => setNewActionIpfsId(e.target.value)}
        placeholder="IPFS ID (e.g., QmSQDKRWEXZ9CGoucSTR11Mv6fhGqaytZ1MqrfHdkuS1Vg)"
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
        selectedScopes={newActionSelectedScopes}
        onScopeChange={setNewActionSelectedScopes}
        disabled={disabled || isAdding}
      />

      <button
        onClick={handleSubmit}
        disabled={
          disabled ||
          isAdding ||
          !newActionIpfsId.trim() ||
          newActionSelectedScopes.length === 0
        }
        className={`w-full p-3 rounded-lg text-sm font-medium border-1 border-gray-200 ${
          disabled ||
          isAdding ||
          !newActionIpfsId.trim() ||
          newActionSelectedScopes.length === 0
            ? "bg-gray-400 cursor-not-allowed text-white"
            : "bg-[#B7410D] text-white cursor-pointer"
        }`}
      >
        {isAdding ? "Adding..." : "Add Action Permission"}
      </button>
    </div>
  );
}; 