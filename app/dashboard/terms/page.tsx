﻿"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Save } from "lucide-react";

const RichTextEditor = dynamic(() => import("@/components/ui/RichTextEditor"), { ssr: false });

const BASE_URL = "https://social-platform-backend-a4zd.onrender.com";
const getAdminToken = () =>
  localStorage.getItem("kick_admin_token") || "";

const ENDPOINTS: Record<"user" | "general", string> = { // Renamed for social platform context
  user: "/api/admin/legal/terms_user", // Assuming these endpoints will be updated on backend
  general: "/api/admin/legal/terms_general", // Assuming these endpoints will be updated on backend
};

export default function TermsPage() {
  const [activeTab, setActiveTab] = useState<"doctor" | "patient">("doctor");
  const [contents, setContents] = useState<Record<"doctor" | "patient", string>>({
    doctor: "",
    patient: "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoadingContent(true);
      try {
        const token = getAdminToken();
        const [userRes, generalRes] = await Promise.all([
          fetch(`${BASE_URL}${ENDPOINTS.user}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}${ENDPOINTS.general}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const [userData, generalData] = await Promise.all([userRes.json(), generalRes.json()]);
        setContents({
          user: userData.content ?? userData.data?.content ?? "",
          general: generalData.content ?? generalData.data?.content ?? "",
        });
      } catch {
        // silently fail — user can still type and save
      } finally {
        setLoadingContent(false);
      }
    };
    fetchAll();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}${ENDPOINTS[activeTab as "user" | "general"]}`, { // Cast activeTab
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({ content: contents[activeTab as "user" | "general"] }), // Cast activeTab
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Terms &amp; Conditions</h1>
            <p className="text-text-secondary text-sm mt-1"> 
              Set terms and conditions for users and general platform usage.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium flex items-center gap-2 transition-colors" // Changed from accent-red
          >
            {saving ? (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <Save size={14} />
            )}
            {saving ? "Saving..." : saved ? "Saved!" : "Save"}
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-bg-card border border-border-subtle rounded-xl p-1 w-fit">
          {(["user", "general"] as const).map((tab) => ( // Changed tab names
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? "bg-blue-600 text-white shadow" // Changed from accent-red
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              {tab === "user" ? "Users" : "General"}
            </button>
          ))}
        </div>

        <div className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
            <p className="text-text-muted text-xs uppercase tracking-wider"> 
              Terms &amp; Conditions for {activeTab === "user" ? "Users" : "General Platform"}
            </p>
            <p className="text-text-muted text-xs">{contents[activeTab as "user" | "general"].length} characters</p>
          </div>
          {loadingContent ? (
            <div className="flex items-center justify-center h-40 text-text-muted text-sm">
              <svg className="animate-spin w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading content...
            </div>
          ) : (
            <RichTextEditor
              key={activeTab}
              content={contents[activeTab as "user" | "general"]}
              onChange={(html) => setContents((p) => ({ ...p, [activeTab as "user" | "general"]: html }))}
              placeholder={`Enter Terms & Conditions for ${activeTab === "user" ? "users" : "general platform"}...`}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
