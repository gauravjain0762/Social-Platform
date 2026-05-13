"use client";

import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({ children, title }: LayoutProps) {
  const collapsed = useAppSelector((s) => s.ui.sidebarCollapsed);
  const router = useRouter();

  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("kick_admin_token");

    if (!token) {
      router.push("/login");
    } else {
      setIsAuthChecked(true);
    }
  }, []);

  // ⛔ prevent flicker / broken UI
  if (!isAuthChecked) return null;

  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar />
      <Header title={title} />

      <main
        className={cn(
          "pt-[60px] min-h-screen transition-all duration-300",
          collapsed ? "pl-[64px]" : "pl-[220px]"
        )}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}