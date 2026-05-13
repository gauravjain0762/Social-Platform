"use client";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchNotifications, sendBroadcast } from "@/store/slices/notificationsSlice";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, StatusBadge, SectionCard, DataTable, LoadingSpinner, Pagination } from "@/components/ui";
import { Notification } from "@/types";
import { Bell, Mail, MessageSquare, Megaphone, Users, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const { list, loading, sending, pagination } = useAppSelector((s) => s.notifications);

  const [form, setForm] = useState({
    title: "",
    message: "",
    audience: "Users", // Changed default audience
    schedule: "now" as "now" | "later",
    channels: [] as string[],
  });

  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

  const toggleChannel = (ch: string) => {
    setForm((f) => ({
      ...f,
      channels: f.channels.includes(ch) ? f.channels.filter((c) => c !== ch) : [...f.channels, ch],
    }));
  };

  const handleSubmit = () => {
    if (!form.title || !form.message || form.channels.length === 0) return;
    dispatch(sendBroadcast({ ...form, audience: form.audience as any })).then(() => { // Cast audience to match Notification["audience"]
      setForm({ title: "", message: "", audience: "Doctors", schedule: "now", channels: [] });
    });
  };

  const recentHistory = list.slice(0, 3);

  const columns = [
    { key: "id", label: "ID", render: (n: Notification) => <span className="text-accent-red-light font-mono text-xs">#{n.id.replace("n", "BC-98")}{n.id.slice(1)}</span> },
    { key: "title", label: "Title", render: (n: Notification) => <span className="text-text-primary font-medium">{n.title}</span> },
    {
      key: "audience", label: "Audience",
      render: (n: Notification) => (
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 text-blue-400">
          {n.audience}
        </span>
      ),
    },
    {
      key: "channel", label: "Channel",
      render: (n: Notification) => (
        <div className="flex gap-1">
          {n.channel.includes("push") && <Bell size={14} className="text-text-secondary" />}
          {n.channel.includes("email") && <Mail size={14} className="text-text-secondary" />}
          {n.channel.includes("sms") && <MessageSquare size={14} className="text-text-secondary" />}
        </div>
      ),
    },
    { key: "status", label: "Status", render: (n: Notification) => <StatusBadge status={n.status} /> },
    {
      key: "actions", label: "Action",
      render: () => (
        <button className="w-7 h-7 rounded-lg border border-border-default flex items-center justify-center text-text-muted hover:text-text-primary">⋮</button>
      ),
    },
  ];

  const channelOptions = [
    { key: "push", icon: <Bell size={20} />, label: "Push" },
    { key: "email", icon: <Mail size={20} />, label: "Email" },
    { key: "sms", icon: <MessageSquare size={20} />, label: "SMS" },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <PageHeader
          title="Broadcast Center"
          subtitle="Dispatch high-priority alerts and system-wide notifications across all social channels." // Updated subtitle
          stats={
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl border border-border-default bg-bg-card text-center">
                <p className="text-white font-bold text-lg">12.4k</p>
                <p className="text-text-muted text-[10px] uppercase tracking-wider">Active Reach</p>
              </div>
              <div className="p-3 rounded-xl border border-border-default bg-bg-card text-center">
                <p className="text-emerald-400 font-bold text-lg">99.2%</p>
                <p className="text-text-muted text-[10px] uppercase tracking-wider">Success Rate</p>
              </div>
            </div>
          }
        />

        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Broadcast form */}
          <SectionCard className="col-span-2" title="🔊 New Broadcast Alert" subtitle="">
            <div className="space-y-4">
              <div>
                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider block mb-2">Notification Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g., System Maintenance Schedule"
                  className="w-full h-10 px-4 bg-bg-elevated border border-border-default rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-red/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider block mb-2">Message Body</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Describe the notification details here..."
                  className="w-full h-28 px-4 py-3 bg-bg-elevated border border-border-default rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-red/50 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider block mb-2">Target Audience</label>
                  <select
                    value={form.audience}
                    onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
                    className="w-full h-10 px-3 bg-bg-elevated border border-border-default rounded-lg text-sm text-text-primary focus:outline-none focus:border-accent-red/50 appearance-none cursor-pointer"
                  >
                    {["Users", "Creators", "Moderators", "All"].map((a) => ( // Updated audience options
                      <option key={a} value={a} className="bg-bg-elevated">{a}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider block mb-2">Schedule</label>
                  <div className="flex gap-2">
                    {(["now", "later"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setForm((f) => ({ ...f, schedule: s }))}
                        className={cn(
                          "flex-1 h-10 rounded-lg border text-sm font-medium transition-all capitalize",
                          form.schedule === s // Changed accent-red to blue-600
                            ? "bg-bg-elevated border-blue-600/40 text-text-primary"
                            : "border-border-default text-text-muted hover:text-text-primary"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider block mb-2">Delivery Channels</label>
                <div className="grid grid-cols-3 gap-3">
                  {channelOptions.map((ch) => (
                    <button
                      key={ch.key}
                      onClick={() => toggleChannel(ch.key)}
                      className={cn(
                        "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                        form.channels.includes(ch.key) // Changed accent-red to blue-600
                          ? "border-blue-600/40 bg-blue-600/10 text-blue-400"
                          : "border-border-default bg-bg-elevated text-text-secondary hover:border-accent-red/20 hover:text-text-primary"
                      )}
                    >
                      {ch.icon}
                      <span className="text-xs font-medium">{ch.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={sending || !form.title || !form.message || form.channels.length === 0}
                className="w-full h-12 rounded-xl bg-gradient-accent text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed shadow-accent-glow"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={16} />
                    Execute Broadcast Dispatch
                  </>
                )}
              </button>
            </div>
          </SectionCard>

          {/* Recent History */}
          <div className="space-y-4">
            <SectionCard title="Recent History" headerRight={<button className="text-accent-red text-xs hover:underline">VIEW ALL</button>}>
              <div className="space-y-3">
                {recentHistory.map((n) => (
                  <div key={n.id} className="flex gap-3 p-3 rounded-xl bg-bg-elevated border border-border-subtle hover:border-border-default transition-colors">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                      n.status === "delivered" ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-yellow-500/10 border border-yellow-500/20"
                    )}>
                      {n.status === "delivered" ? <span className="text-emerald-400 text-sm">✓</span> : <Bell size={13} className="text-yellow-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <p className="text-text-primary text-sm font-medium truncate">{n.title}</p>
                        <span className="text-text-muted text-[10px] shrink-0 ml-2">{n.sentAt}</span>
                      </div>
                      <div className="flex gap-1.5 mt-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-bg-card border border-border-subtle text-text-muted uppercase">
                          {n.channel[0]}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-bg-card border border-border-subtle text-text-muted uppercase">
                          {n.audience}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <div className="rounded-xl border border-border-subtle overflow-hidden">
              <div className="p-4 bg-gradient-to-br from-bg-elevated to-bg-card">
                <p className="text-text-muted text-[10px] uppercase tracking-wider mb-1">Engagement Tip</p> {/* Updated tip */}
                <p className="text-white font-bold text-sm">Optimizing Engagement Rates</p> {/* Updated tip */}
                <p className="text-text-secondary text-xs mt-2">Broadcasts sent between 8:00 AM and 9:30 AM have a 40% higher user engagement rate.</p> {/* Updated tip */}
                <button className="mt-3 h-7 px-3 rounded-lg border border-border-default text-text-secondary text-xs hover:text-text-primary transition-all">
                  Read Guidelines
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Full History Log */}
        <SectionCard noPadding title="" subtitle="">
          <div className="px-5 py-4 border-b border-border-subtle">
            <h3 className="text-white font-semibold">Full History Log</h3>
          </div>
          {loading ? <LoadingSpinner /> : (
            <>
              <DataTable columns={columns} data={list} keyExtractor={(n) => n.id} />
              <div className="flex items-center justify-between px-5 py-3 border-t border-border-subtle">
                <p className="text-text-muted text-xs">Showing 1–{list.length} of {list.length} broadcasts</p>
                <Pagination page={pagination.page} total={list.length} limit={pagination.limit} onPageChange={() => {}} />
              </div>
            </>
          )}
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
