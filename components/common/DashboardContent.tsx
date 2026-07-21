"use client";

import { useSidebar } from "./SidebarContext";

export function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  return (
    <div
      className={`flex-1 flex flex-col min-w-0 overflow-x-hidden transition-all duration-300 ease-in-out ${
        isCollapsed ? "md:pl-20" : "md:pl-64"
      }`}
    >
      {/* pt-14 on mobile gives clearance for the fixed hamburger toggle */}
      <main className="flex-1 pt-14 px-3 pb-6 sm:px-4 md:pt-8 md:px-8 md:pb-8 min-w-0">
        {children}
      </main>
    </div>
  );
}
