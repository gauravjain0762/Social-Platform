"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome to Kick-Analyst admin.</p>
      </div>
    </DashboardLayout>
  );
}
