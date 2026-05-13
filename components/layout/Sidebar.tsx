"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, CreditCard,
  HeadphonesIcon, Settings,
  ChevronLeft, ChevronRight, ChevronDown, Activity, Package,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Users", href: "/dashboard/users", icon: Users },
  { label: "Plans", href: "/dashboard/plans", icon: Package },
  { label: "Revenue", href: "/payments", icon: CreditCard },
  { label: "Support", href: "/support", icon: HeadphonesIcon },
  { label: "Settings", href: "/dashboard/app-settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const [openSettings, setOpenSettings] = useState(
    pathname.startsWith("/dashboard/app-settings") ||
    pathname.startsWith("/dashboard/terms") ||
    pathname.startsWith("/dashboard/privacy")
  );

  const handleLogout = () => {
    localStorage.removeItem("kick_admin_token");
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-bg-secondary border-r border-border-default z-50 flex flex-col transition-all duration-300 ease-in-out",
        collapsed ? "w-[64px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 h-[60px] border-b border-border-default shrink-0",
        collapsed && "justify-center px-0"
      )}>
        <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center shrink-0">
          <Activity size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm leading-none">Queue Token</div>
            <div className="text-text-muted text-[10px] mt-0.5 uppercase tracking-widest"></div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-4 py-2 border-b border-border-subtle">
          <p className="text-text-muted text-[10px] uppercase tracking-widest">Precision Admin</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 scrollbar-thin">
        {navItems.map(({ label, href, icon: Icon }) => {
          if (label === "Settings") {
            const active = pathname.startsWith("/dashboard/app-settings");
            return (
              <div key={href}>
                <div
                  onClick={() => setOpenSettings(!openSettings)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 cursor-pointer transition-all",
                    active
                      ? "bg-accent-red-glow text-accent-red-light border border-accent-red/20"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
                  )}
                >
                  <Icon size={16} />
                  {!collapsed && (
                    <>
                      <span className="text-sm font-medium flex-1">Settings</span>
                      <ChevronDown
                        size={14}
                        className={cn("transition-transform", openSettings && "rotate-180")}
                      />
                    </>
                  )}
                </div>

                {openSettings && !collapsed && (
                  <div className="ml-6 mt-1 space-y-1">
                    <Link
                      href="/dashboard/app-settings"
                      className={cn(
                        "block px-3 py-1.5 text-sm rounded-md",
                        pathname === "/dashboard/app-settings"
                          ? "text-accent-red"
                          : "text-text-muted hover:text-text-primary"
                      )}
                    >
                      App Settings
                    </Link>
                    <Link
                      href="/dashboard/terms"
                      className={cn(
                        "block px-3 py-1.5 text-sm rounded-md",
                        pathname === "/dashboard/terms"
                          ? "text-accent-red"
                          : "text-text-muted hover:text-text-primary"
                      )}
                    >
                      Terms &amp; Conditions
                    </Link>
                    <Link
                      href="/dashboard/privacy"
                      className={cn(
                        "block px-3 py-1.5 text-sm rounded-md",
                        pathname === "/dashboard/privacy"
                          ? "text-accent-red"
                          : "text-text-muted hover:text-text-primary"
                      )}
                    >
                      Privacy &amp; Policy
                    </Link>
                  </div>
                )}
              </div>
            );
          }

          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg mb-0.5 transition-all duration-150 group relative",
                active
                  ? "bg-accent-red-glow text-accent-red-light border border-accent-red/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-hover"
              )}
            >
              <Icon size={16} className={cn("shrink-0", active ? "text-accent-red" : "text-current")} />
              {!collapsed && (
                <span className="text-sm font-medium truncate">{label}</span>
              )}
              {active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-red shrink-0" />
              )}
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-bg-elevated text-text-primary text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap border border-border-default z-50 transition-opacity">
                  {label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border-default p-2 space-y-1 shrink-0">
        {/* <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-text-secondary hover:text-text-primary hover:bg-bg-hover",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Settings" : undefined}
        >
          <Settings size={16} />
          {!collapsed && <span className="text-sm">Settings</span>}
        </Link> */}

        {/* <div className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-bg-hover cursor-pointer",
          collapsed && "justify-center"
        )}
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
        >
          <div className="w-7 h-7 rounded-full bg-gradient-accent flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-bold">AT</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-xs font-medium truncate">Dr. Aris Thorne</p>
              <p className="text-text-muted text-[10px] truncate">Chief Administrator</p>
            </div>
          )}
        </div> */}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="absolute -right-3 top-[72px] w-6 h-6 rounded-full bg-bg-elevated border border-border-default flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-bg-hover transition-all z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
