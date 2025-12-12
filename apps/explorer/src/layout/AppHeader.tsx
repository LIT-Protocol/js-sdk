/**
 * AppHeader
 *
 * Sticky top header shell with left logo slot, centre slot, and right actions slot.
 * Mirrors current spacing and borders used in the app header.
 */

import type { FC, ReactNode } from "react";

interface AppHeaderProps {
  leftSlot?: ReactNode; // e.g., logo/link
  centerSlot?: ReactNode; // e.g., search
  rightSlot?: ReactNode; // e.g., auth actions
}

export const AppHeader: FC<AppHeaderProps> = ({
  leftSlot,
  centerSlot,
  rightSlot,
}) => {
  return (
    <div className="sticky top-0 z-50 bg-white">
      <div className="max-w-8xl mx-auto relative text-black">
        <div>
          <div className="relative">
            <div className="flex items-center lg:px-12 h-16 min-w-0 mx-4 lg:mx-0 w-8xl">
              <div className="h-full relative flex items-center justify-between gap-x-4 min-w-0 border-b border-gray-500/5 dark:border-gray-300/[0.06] pl-4 lg:pl-0 w-full">
                <div className="flex items-center">{leftSlot}</div>
                <div className="flex-1 max-w-2xl mx-8">{centerSlot}</div>
                <div className="text-sm flex items-center gap-3 ml-auto text-[#837F7E] pr-14">{rightSlot}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

