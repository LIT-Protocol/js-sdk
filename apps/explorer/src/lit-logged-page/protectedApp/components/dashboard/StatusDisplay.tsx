/**
 * StatusDisplay Component
 * 
 * Reusable status message display with transaction links
 */

import React from 'react';

interface StatusDisplayProps {
  status: string;
  onDismiss: () => void;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({
  status,
  onDismiss,
}) => {
  if (!status) return null;

  return (
    <div
      style={{
        marginBottom: "20px",
        padding: "12px 16px",
        backgroundColor: status.includes("✅") ? "#f0fdf4" : "#eff6ff",
        border: `1px solid ${
          status.includes("✅") ? "#bbf7d0" : "#bfdbfe"
        }`,
        borderRadius: "8px",
        color: status.includes("✅") ? "#15803d" : "#1e40af",
        fontSize: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ flex: 1 }}>
        {status.includes("Transaction:") ? (
          <div>
            <div style={{ marginBottom: "8px" }}>
              {status.split("Transaction:")[0].trim()}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span style={{ fontSize: "12px", fontWeight: "500" }}>
                Transaction Hash:
              </span>
              <a
                href={`https://yellowstone-explorer.litprotocol.com/tx/${status
                  .split("Transaction:")[1]
                  .trim()}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#1d4ed8",
                  textDecoration: "underline",
                  fontFamily: "monospace",
                  fontSize: "11px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#2563eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#1d4ed8";
                }}
              >
                {status.split("Transaction:")[1].trim()}
              </a>
            </div>
          </div>
        ) : (
          status
        )}
      </div>
      <button
        onClick={onDismiss}
        style={{
          background: "none",
          border: "none",
          color: "inherit",
          fontSize: "16px",
          cursor: "pointer",
          padding: "4px",
          borderRadius: "4px",
          opacity: 0.7,
          transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = "0.7";
        }}
        title="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}; 