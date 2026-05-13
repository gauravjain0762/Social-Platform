"use client";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, SectionCard } from "@/components/ui";
import { User, Bell, Shield, Globe, Database, Palette, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const settingsTabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "platform", label: "Platform", icon: Globe },
  { id: "data", label: "Data & Privacy", icon: Database },
  { id: "appearance", label: "Appearance", icon: Palette },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <PageHeader title="Settings" subtitle="Manage system configuration and admin preferences." />

        <div className="grid grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="col-span-1">
            <SectionCard>
              <div className="space-y-1">
                {settingsTabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm",
                      activeTab === id
                        ? "bg-accent-red-glow text-accent-red-light border border-accent-red/20"
                        : "text-text-secondary hover:text-text-primary hover:bg-bg-hover" // Keep hover color consistent
                    )}
                  >
                    <Icon size={15} className={activeTab === id ? "text-accent-red" : "text-current"} />
                    {label}
                    {activeTab === id && <ChevronRight size={12} className="ml-auto text-accent-red" />}
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Content */}
          <div className="col-span-3">
            {activeTab === "profile" && (
              <SectionCard title="Admin Profile" subtitle="Update your administrator information.">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border-subtle">
                  <div className="w-16 h-16 rounded-full bg-gradient-accent flex items-center justify-center text-white text-2xl font-bold">
                    AT
                  </div>
                  <div>
                    <p className="text-white font-semibold">Dr. Aris Thorne</p>
                    <p className="text-text-muted text-sm">Platform Administrator</p> {/* Updated role */}
                    <button className="mt-1 text-blue-500 text-xs hover:underline">Change Avatar</button> {/* Changed color */}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "First Name", value: "Aris", type: "text" },
                    { label: "Last Name", value: "Thorne", type: "text" },
                    { label: "Email Address", value: "aris.thorne@kick-analyst.com", type: "email" }, // Updated email
                    { label: "Phone Number", value: "+1 555-0100", type: "tel" },
                    { label: "Role", value: "Chief Administrator", type: "text" },
                    { label: "Department", value: "Platform Operations", type: "text" }, // Updated department
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="text-text-muted text-xs uppercase tracking-wider block mb-2">{field.label}</label>
                      <input
                        type={field.type}
                        defaultValue={field.value}
                        className="w-full h-9 px-3 bg-bg-elevated border border-border-default rounded-lg text-sm text-text-primary focus:outline-none focus:border-blue-500/50 transition-colors" // Changed color
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-3">
                  <button className="h-9 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium hover:opacity-90 shadow-lg shadow-blue-900/20">Save Changes</button> {/* Changed color */}
                  <button className="h-9 px-6 rounded-xl border border-border-default text-text-secondary text-sm hover:text-text-primary transition-all">Cancel</button>
                </div>
              </SectionCard>
            )}

            {activeTab === "notifications" && (
              <SectionCard title="Notification Preferences" subtitle="Configure how and when you receive system alerts.">
                <div className="space-y-4">
                  {[
                    { label: "User Verification Alerts", sub: "Get notified when new users submit documents for verification.", enabled: true }, // Updated text
                    { label: "Critical System Alerts", sub: "Receive alerts for system health issues and security events.", enabled: true },
                    { label: "Revenue Milestones", sub: "Notifications for significant revenue events and anomalies.", enabled: false },
                    { label: "Support Ticket Escalations", sub: "Alert when support tickets are escalated to critical priority.", enabled: true },
                    { label: "User Feedback Alerts", sub: "Immediate alerts for flagged user feedback and negative reviews.", enabled: true }, // Updated text
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-bg-elevated">
                      <div>
                        <p className="text-text-primary text-sm font-medium">{item.label}</p>
                        <p className="text-text-muted text-xs mt-0.5">{item.sub}</p>
                      </div>
                      <div
                        className={cn(
                          "w-10 h-6 rounded-full border transition-all cursor-pointer relative",
                          item.enabled // Changed accent-red to blue-600
                            ? "bg-blue-600 border-blue-600"
                            : "bg-bg-card border-border-default"
                        )}
                      >
                        <div className={cn(
                          "w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all",
                          item.enabled ? "right-0.5" : "left-0.5"
                        )} />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {activeTab === "security" && (
              <SectionCard title="Security Settings" subtitle="Manage authentication and access control.">
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-border-subtle bg-bg-elevated">
                    <p className="text-text-primary font-medium mb-1">Two-Factor Authentication</p>
                    <p className="text-text-muted text-sm mb-3">Add an extra layer of security to your account.</p>
                    <button className="h-8 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-medium hover:opacity-90">Enable 2FA</button> {/* Changed color */}
                  </div>
                  <div className="p-4 rounded-xl border border-border-subtle bg-bg-elevated">
                    <p className="text-text-primary font-medium mb-1">Change Password</p>
                    <p className="text-text-muted text-sm mb-3">Last changed 30 days ago.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="password" placeholder="Current password" className="h-9 px-3 bg-bg-card border border-border-default rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/50" /> {/* Changed color */}
                      <input type="password" placeholder="New password" className="h-9 px-3 bg-bg-card border border-border-default rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-blue-500/50" /> {/* Changed color */}
                    </div>
                    <button className="mt-3 h-8 px-4 rounded-lg border border-border-default text-text-secondary text-xs hover:text-text-primary transition-all">Update Password</button>
                  </div>
                </div>
              </SectionCard>
            )}

            {(activeTab === "platform" || activeTab === "data" || activeTab === "appearance") && (
              <SectionCard title={settingsTabs.find((t) => t.id === activeTab)?.label + " Settings"} subtitle="Configuration options coming soon.">
                <div className="py-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center mx-auto mb-3">
                    {(() => { const T = settingsTabs.find((t) => t.id === activeTab)?.icon; return T ? <T size={20} className="text-text-muted" /> : null; })()}
                  </div>
                  <p className="text-text-secondary text-sm">This settings section is under development.</p>
                  <p className="text-text-muted text-xs mt-1">Check back in the next release.</p>
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
