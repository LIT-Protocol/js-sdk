/**
 * ScopeCheckboxes Component
 * 
 * Reusable component for selecting permission scopes
 */

import { ScopeConfig } from '../../types';

import type { FC } from "react";

interface ScopeCheckboxesProps {
  availableScopes: ScopeConfig[];
  selectedScopes: string[];
  onScopeChange: (scopes: string[]) => void;
  disabled?: boolean;
}

export const ScopeCheckboxes: FC<ScopeCheckboxesProps> = ({
  availableScopes,
  selectedScopes,
  onScopeChange,
  disabled = false,
}) => (
  <div style={{ marginBottom: "16px" }}>
    <label
      style={{
        display: "block",
        marginBottom: "8px",
        fontSize: "14px",
        fontWeight: "500",
        color: "#374151",
      }}
    >
      🎯 Scopes (select permissions):
    </label>
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {availableScopes.map((scope) => (
        <label
          key={scope.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            backgroundColor: selectedScopes.includes(scope.id)
              ? "#eff6ff"
              : "#ffffff",
            cursor: disabled ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <input
            type="checkbox"
            checked={selectedScopes.includes(scope.id)}
            disabled={disabled}
            onChange={(e) => {
              if (disabled) return;
              if (e.target.checked) {
                onScopeChange([...selectedScopes, scope.id]);
              } else {
                onScopeChange(selectedScopes.filter((s) => s !== scope.id));
              }
            }}
            style={{
              width: "16px",
              height: "16px",
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: "500",
                color: "#374151",
              }}
            >
              {scope.label}
            </div>
            <div style={{ fontSize: "11px", color: "#6b7280" }}>
              {scope.description}
            </div>
          </div>
        </label>
      ))}
    </div>
  </div>
); 
