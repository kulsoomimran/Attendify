"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock, ShieldAlert, BarChart3, Settings, Menu, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useSidebar } from "./SidebarContext";

export default function EmployeeSidebar() {
  const pathname = usePathname();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { data: session } = authClient.useSession();

  const userName = session?.user?.name ?? "Staff Member";
  const userEmail = session?.user?.email ?? "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "EM";

  const navItems = [
    { name: "My Dashboard", href: "/employee", icon: BarChart3 },
    { name: "Time Off", href: "/employee/leaves", icon: ShieldAlert },
    { name: "Settings", href: "/employee/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Toggle Button — always visible, above everything */}
      <div className="md:hidden fixed top-4 left-4 z-[60]">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2.5 rounded-xl bg-card border border-border shadow-soft text-foreground hover:bg-background transition-colors duration-200"
          id="btn-employee-mobile-sidebar-toggle"
          aria-label="Toggle navigation menu"
        >
          {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Sidebar overlay — tap outside to close; always rendered for smooth animation */}
      <div
        className={`md:hidden fixed inset-0 bg-primary/20 backdrop-blur-sm z-[50] transition-opacity duration-300 ${
          isMobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Main Sidebar Shell */}
      <aside
        className={`fixed top-0 bottom-0 left-0 bg-card border-r border-border flex flex-col z-[55] transition-transform duration-300 ease-in-out overflow-y-auto
          ${isCollapsed ? "md:w-20" : "md:w-64"} w-64
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        id="employee-sidebar"
      >
        {/* Top section: logo + nav */}
        <div className="flex flex-col space-y-8 px-4 py-6 flex-1">
          {/* Sidebar Brand Header */}
          <div className="flex items-center justify-between px-2">
            {/* Desktop: clicking logo toggles collapse */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex items-center gap-2 focus:outline-none group"
              id="btn-employee-sidebar-collapse"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <div className="w-8 h-8 rounded-xl bg-accent-sage flex items-center justify-center shadow-soft group-hover:opacity-80 transition-opacity duration-200 shrink-0">
                <Clock className="w-4 h-4 text-foreground" />
              </div>
              {!isCollapsed && (
                <span className="font-sans font-normal text-base tracking-tight text-foreground whitespace-nowrap">
                  Attendify
                </span>
              )}
            </button>

            {/* Mobile: logo link + close button */}
            <div className="md:hidden flex items-center justify-between w-full">
              <Link href="/" className="flex items-center gap-2" id="employee-sidebar-logo">
                <div className="w-8 h-8 rounded-xl bg-accent-sage flex items-center justify-center shadow-soft shrink-0">
                  <Clock className="w-4 h-4 text-foreground" />
                </div>
                <span className="font-sans font-normal text-base tracking-tight text-foreground">
                  Attendify
                </span>
              </Link>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-lg border border-border text-secondary hover:text-foreground hover:bg-background transition-all duration-200"
                aria-label="Close sidebar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1" id="employee-sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 md:py-2.5 rounded-xl text-sm font-normal transition-all duration-200
                    ${isActive
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-secondary hover:text-foreground hover:bg-background"
                    }
                  `}
                  id={`employee-sidebar-link-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-accent-sage" : ""}`} />
                  {/* Always show label on mobile; respect collapsed on desktop */}
                  <span className={`truncate md:${isCollapsed ? "hidden" : "block"}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer profile */}
        <div className="px-4 border-t border-border py-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-accent-sage/20 border border-accent-sage/35 flex items-center justify-center text-xs font-mono font-medium text-foreground shrink-0">
              {initials}
            </div>
            <div className={`truncate md:${isCollapsed ? "hidden" : "block"}`}>
              <span className="block text-xs font-semibold text-foreground truncate">{userName}</span>
              <span className="block text-[10px] font-normal text-secondary truncate">{userEmail}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
