/**
 * TabNavigation Component
 * 
 * Reusable tab navigation component
 */

import type { FC } from "react";

export interface Tab {
  id: string;
  label: string;
  icon?: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabNavigation: FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  return (
    <div style={{ marginBottom: "30px" }}>
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid #e5e7eb",
          marginBottom: "20px",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              padding: "12px 24px",
              border: "none",
              backgroundColor: "transparent",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              borderBottom:
                activeTab === tab.id
                  ? "2px solid #3b82f6"
                  : "2px solid transparent",
              color: activeTab === tab.id ? "#3b82f6" : "#6b7280",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = "#4b5563";
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.color = "#6b7280";
              }
            }}
          >
            {tab.icon && `${tab.icon} `}{tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}; 
