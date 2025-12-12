/**
 * TopNavBar
 *
 * Sticky tab navigation bar that sits below the page header.
 * - Tabs scroll horizontally on small screens
 * - Sticks under a standard sticky header height
 * - Provides a right-side slot for actions (e.g., account/burger menu)
 *
 * Usage:
 *  <TopNavBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} rightSlot={<AccountMenu .../>} />
 */

import type { FC, ReactNode } from "react";

export interface TopNavTab {
  id: string;
  label: string;
}

interface TopNavBarProps {
  tabs: TopNavTab[];
  activeTab: string;
  onTabChange: (id: string) => void;
  rightSlot?: ReactNode;
  /** Override sticky offsets if your header height differs */
  stickyClassName?: string; // e.g. "sticky top-14 sm:top-16"
}

export const TopNavBar: FC<TopNavBarProps> = ({
  tabs,
  activeTab,
  onTabChange,
  rightSlot,
  stickyClassName = "sticky top-14 sm:top-16",
}) => {
  return (
    <div className={`${stickyClassName} z-50 bg-white`}>
      <div id="header-nav" className="text-black max-w-8xl mx-auto">
        <div className="px-4 sm:px-6 lg:px-12 h-12 font-medium text-sm bg-white flex items-center justify-between pr-1">
          <div className="nav-tabs h-full flex text-sm gap-x-4 sm:gap-x-6 overflow-x-auto whitespace-nowrap no-scrollbar">
            {tabs.map((t) => (
              <a
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`cursor-pointer relative h-full gap-2 flex items-center hover:border-b ${
                  activeTab === t.id
                    ? "border-b border-b-[#EA580D] hover:border-b-[#EA580D]"
                    : "text-[#837F7E] hover:border-b-gray-300 hover:text-[#575250] font-medium"
                }`}
              >
                {t.label}
              </a>
            ))}
          </div>
          {rightSlot}
        </div>
      </div>
    </div>
  );
};

