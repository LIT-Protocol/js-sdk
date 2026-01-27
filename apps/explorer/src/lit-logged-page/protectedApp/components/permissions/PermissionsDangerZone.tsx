/**
 * PermissionsDangerZone Component
 * 
 * Contains dangerous operations like revoking all permissions
 */

import { usePKPPermissions } from '../../contexts/PKPPermissionsContext';

import type { FC } from "react";

export const PermissionsDangerZone: FC = () => {
  const { revokeAllPermissions, isRevokingAll } = usePKPPermissions();

  return (
    <div style={{ marginTop: "16px" }}>
      <div
        style={{
          padding: "20px",
          backgroundColor: "#fef2f2",
          borderRadius: "12px",
          border: "1px solid #fecaca",
          boxShadow: "",
        }}
      >
        <h3 style={{ margin: "0 0 16px 0", color: "#dc2626" }}>
          ⚠️ Danger Zone
        </h3>
        <p
          style={{
            margin: "0 0 16px 0",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          <strong>Warning:</strong> This will remove ALL permissions from your
          PKP. This action cannot be undone.
        </p>

        <button
          onClick={revokeAllPermissions}
          disabled={isRevokingAll}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: isRevokingAll ? "#9ca3af" : "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: isRevokingAll ? "not-allowed" : "pointer",
          }}
        >
          {isRevokingAll ? "Revoking All..." : "🚨 Revoke All Permissions"}
        </button>
      </div>
    </div>
  );
}; 
