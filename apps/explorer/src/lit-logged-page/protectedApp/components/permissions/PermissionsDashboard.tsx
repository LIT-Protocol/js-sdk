/**
 * PermissionsDashboard Component
 *
 * Complete permissions management dashboard that combines all permission-related components
 */

import { useEffect, type FC } from "react";

import { AddActionForm } from "./AddActionForm";
import { AddAddressForm } from "./AddAddressForm";
import { PermissionsList } from "./PermissionsList";
import { PermissionsSummaryCards } from "./PermissionsSummaryCards";
import { usePKPPermissions } from "../../contexts/PKPPermissionsContext";

interface PermissionsDashboardProps {
  disabled?: boolean;
}

export const PermissionsDashboard: FC<PermissionsDashboardProps> = ({
  disabled = false,
}) => {
  const {
    permissionsContext,
    isLoadingPermissions,
    permissionsError,
    loadPermissionsContext,
    selectedPkp,
  } = usePKPPermissions();

  // Auto-load permissions when component mounts or PKP changes
  useEffect(() => {
    if (selectedPkp && !permissionsContext && !isLoadingPermissions) {
      console.log(
        "🔄 Auto-loading permissions context for PKP:",
        selectedPkp.tokenId
      );
      loadPermissionsContext();
    }
  }, [
    selectedPkp,
    permissionsContext,
    isLoadingPermissions,
    loadPermissionsContext,
  ]);

  return (
    <>
      {/* Summary Cards */}
      <PermissionsSummaryCards />

      {/* Current Permissions Detail View */}
      <div
        style={{
          marginBottom: "30px",
          padding: "20px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          boxShadow: "",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3 style={{ margin: 0, color: "#1f2937" }}>
            📋 Current Permissions
          </h3>
          <button
            onClick={loadPermissionsContext}
            disabled={isLoadingPermissions || disabled}
            style={{
              padding: "8px 16px",
              backgroundColor:
                isLoadingPermissions || disabled ? "#9ca3af" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "12px",
              fontWeight: "500",
              cursor:
                isLoadingPermissions || disabled ? "not-allowed" : "pointer",
            }}
          >
            {isLoadingPermissions ? "Loading..." : "🔄 Refresh"}
          </button>
        </div>

        {!permissionsContext && !isLoadingPermissions && (
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f3f4f6",
              borderRadius: "8px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            No permissions loaded.{" "}
            {selectedPkp
              ? "Loading automatically..."
              : "Please select a PKP to view permissions."}
          </div>
        )}

        {isLoadingPermissions && (
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f3f4f6",
              borderRadius: "8px",
              textAlign: "center",
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                width: "16px",
                height: "16px",
                border: "2px solid #d1d5db",
                borderTop: "2px solid #3b82f6",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            />
            Loading permissions...
          </div>
        )}

        {permissionsContext && <PermissionsList />}
      </div>

      {/* Permission Management Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "20px",
          marginBottom: "20px",
        }}
      >
        <AddActionForm disabled={disabled} />
        <AddAddressForm disabled={disabled} />
      </div>

      {/* Permissions Error Display */}
      {permissionsError && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#dc2626",
            fontSize: "14px",
          }}
        >
          <strong>⚠️ Error:</strong> {permissionsError}
        </div>
      )}

      {/* Danger Zone */}
      {/* <PermissionsDangerZone /> */}

      {/* Loading animation CSS */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};
