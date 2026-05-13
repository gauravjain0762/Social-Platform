"use client";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setGlobalSearch } from "@/store/slices/uiSlice";
import { Search, Bell, Calendar, Headphones, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const dispatch = useAppDispatch();
  const search = useAppSelector((s) => s.ui.globalSearch);
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const handleLogout = () => {
    localStorage.removeItem("kick_admin_token");
    window.location.href = "/login";
  };

  return (
    <header
      className={cn(
        "fixed top-0 right-0 h-[60px] bg-bg-secondary border-b border-border-default z-40 flex items-center px-6 gap-4 transition-all duration-300",
        collapsed ? "left-[64px]" : "left-[220px]"
      )}
    >
      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          placeholder="Search medical records, doctors, or analytics..."
          value={search}
          onChange={(e) => dispatch(setGlobalSearch(e.target.value))}
          className="w-full h-9 pl-9 pr-4 bg-bg-card border border-border-default rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-red/50 transition-colors"
        />
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Calendar */}
        {/* <button className="w-9 h-9 rounded-lg border border-border-default bg-bg-card flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent-red/30 transition-all">
          <Calendar size={16} />
        </button> */}

        {/* Notifications */}
        <button className="w-9 h-9 rounded-lg border border-border-default bg-bg-card flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent-red/30 transition-all relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-red" />
        </button>

        {/* Support */}
        <button className="h-9 px-4 rounded-lg bg-gradient-accent text-white text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity shadow-accent-glow">
          <Headphones size={14} />
          Support
        </button>

        <button
    onClick={handleLogout}
    className="h-9 px-4 rounded-lg border border-red-500 text-red-400 text-sm font-medium flex items-center gap-2 hover:bg-red-500/10 transition-all"
  >
    <LogOut size={14} />
    Logout
  </button>
      </div>
    </header>
  );
}
