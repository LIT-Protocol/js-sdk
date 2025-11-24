/**
 * GlobalMessage
 *
 * Sticky, dismiss-less message bar that appears below header/nav on md+ screens.
 * Responsive: not sticky on small screens by default (keeps layout simple).
 *
 * Usage:
 *  <GlobalMessage visible={true} message="..." />
 */

import React from "react";

interface GlobalMessageProps {
  visible: boolean;
  message: string;
  className?: string;
  /** Tailwind position classes controlling sticky offset on md+ */
  stickyOffsetClass?: string; // default "md:sticky md:top-28"
}

export const GlobalMessage: React.FC<GlobalMessageProps> = ({
  visible,
  message,
  className,
  stickyOffsetClass = "md:sticky md:top-28",
}) => {
  if (!visible) return null;
  return (
    <div
      id="site-global-message"
      className={`w-full bg-[#FFF6E5] text-black text-sm text-yellow-700 p-2 text-center border-b border-[#FFDD8F] border-t font-light relative ${stickyOffsetClass} z-10 -mt-px ${
        className || ""
      }`}
    >
      {message}
    </div>
  );
};


