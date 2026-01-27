/**
 * StickySidebarLayout
 *
 * Two-column layout where the left sidebar is sticky and the right content scrolls.
 * - Sidebar hidden below a breakpoint (default: lg)
 * - Matches spacing, widths, and offsets used by the current app
 *
 * Usage:
 *  <StickySidebarLayout sidebar={<Sidebar />}>
 *    <YourContent />
 *  </StickySidebarLayout>
 */

import type { FC, ReactNode } from "react";

interface StickySidebarLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  /** Tailwind class controlling sidebar width */
  sidebarWidthClass?: string; // default w-[18rem]
  /** Breakpoint at which sidebar becomes hidden */
  hideAtBreakpoint?: 'lg' | 'md' | 'xl';
  /** Inline style top offset for the sticky sidebar */
  sidebarTopOffsetPx?: number; // default matches current header+nav height
}

export const StickySidebarLayout: FC<StickySidebarLayoutProps> = ({
  sidebar,
  children,
  sidebarWidthClass = "w-[18rem]",
  hideAtBreakpoint = "lg",
  sidebarTopOffsetPx = 7 * 16 + 38, // 7rem + 38px
}) => {
  const hiddenClass = hideAtBreakpoint === 'lg' ? 'hidden lg:block' : hideAtBreakpoint === 'md' ? 'hidden md:block' : 'hidden xl:block';
  return (
    <div className="bg-[#FAFAFA] text-black z-0">
      <div className="h-6 sm:h-8"></div>
      <div className="max-w-8xl m-auto px-4 sm:px-6 lg:px-12">
        <aside
          className={`${hiddenClass} z-20 fixed bottom-0 right-auto ${sidebarWidthClass} h-full pt-6 lg:pt-8`}
          style={{ top: `calc(${sidebarTopOffsetPx}px)` }}
        >
          {sidebar}
        </aside>
        <main className="relative grow box-border flex-col w-full mx-auto px-1 lg:pl-[23.7rem] lg:-ml-12">
          {children}
        </main>
      </div>
    </div>
  );
};

