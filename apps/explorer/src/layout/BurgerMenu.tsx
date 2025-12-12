/**
 * BurgerMenu
 *
 * Small-screen floating menu button (top-right). Consumer passes the menu content.
 * Visible only below a breakpoint (default: lg).
 */

import { useState, type FC, type ReactNode } from "react";

interface BurgerMenuProps {
  menu: ReactNode;
  buttonAriaLabel?: string;
  positionClass?: string; // default fixed top-2 right-2 sm:top-3 sm:right-3
  visibleBelowBreakpoint?: 'lg' | 'md' | 'xl';
}

export const BurgerMenu: FC<BurgerMenuProps> = ({
  menu,
  buttonAriaLabel = "Open menu",
  positionClass = "fixed top-2 right-2 sm:top-3 sm:right-3",
  visibleBelowBreakpoint = 'lg',
}) => {
  const [open, setOpen] = useState(false);
  const visibilityClass = visibleBelowBreakpoint === 'lg' ? 'block lg:hidden' : visibleBelowBreakpoint === 'md' ? 'block md:hidden' : 'block xl:hidden';
  return (
    <div className={`${positionClass} z-[1100] ${visibilityClass}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={buttonAriaLabel}
        className="p-2 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M3.75 6.75h16.5a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0 0 1.5Zm0 6h16.5a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0 0 1.5Zm0 6h16.5a.75.75 0 0 0 0-1.5H3.75a.75.75 0 0 0 0 1.5Z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[300px] max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-[1200] overflow-hidden">
          {menu}
        </div>
      )}
    </div>
  );
};

