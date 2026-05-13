"use client";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchReviews, setReviewsFilter, updateReviewStatus } from "@/store/slices/reviewsSlice";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { PageHeader, DataTable, StatusBadge, ActionButton, SectionCard, LoadingSpinner } from "@/components/ui";
import { Review } from "@/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { AlertTriangle, Star, Download } from "lucide-react";

export default function ReviewsPage() {
  const dispatch = useAppDispatch();
  const { list, loading, filters, sentimentChart } = useAppSelector((s) => s.reviews);
  const [activeTab, setActiveTab] = useState<"all" | "flagged" | "resolved">("all");

  useEffect(() => { dispatch(fetchReviews()); }, [dispatch]);

  const filtered = useMemo(() => {
    let result = list;
    if (activeTab === "flagged") result = result.filter((r) => r.status === "flagged");
    if (activeTab === "resolved") result = result.filter((r) => r.status === "resolved");
    if (filters.search) result = result.filter((r) =>
      r.patientName.toLowerCase().includes(filters.search.toLowerCase()) ||
      r.doctorName.toLowerCase().includes(filters.search.toLowerCase())
    );
    return result;
  }, [list, activeTab, filters]);

  const pendingReviews = list.filter((r) => r.status === "published").length;
  const flaggedRatio = list.length ? ((list.filter((r) => r.status === "flagged").length / list.length) * 100).toFixed(1) : "0";

  const StarDisplay = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={12} className={s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"} />
      ))}
    </div>
  );

  const columns = [
    {
      key: "patientName", label: "Patient",
      render: (r: Review) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-[10px] font-bold">
            {r.patientName.split(" ").map((n) => n[0]).join("")}
          </div>
          <span className="text-text-primary text-sm">{r.patientName}</span>
        </div>
      ),
    },
    { key: "doctorName", label: "Doctor", render: (r: Review) => <span className="text-text-secondary text-sm">{r.doctorName}</span> },
    { key: "rating", label: "Rating", render: (r: Review) => <StarDisplay rating={r.rating} /> },
    {
      key: "reviewText", label: "Review Text Snippet",
      render: (r: Review) => (
        <span className="text-text-muted text-xs italic">
          "{r.reviewText.length > 40 ? r.reviewText.slice(0, 40) + "..." : r.reviewText}"
        </span>
      ),
    },
    { key: "date", label: "Date", render: (r: Review) => <span className="text-text-muted text-xs">{r.date}</span> },
    { key: "status", label: "Status", render: (r: Review) => <StatusBadge status={r.status} /> },
    {
      key: "actions", label: "Actions",
      render: (r: Review) => (
        <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
          {r.status === "published" && (
            <>
              <ActionButton label="Hide" onClick={() => dispatch(updateReviewStatus({ id: r.id, status: "hidden" }))} variant="secondary" size="xs" />
              <ActionButton label="Flag" onClick={() => dispatch(updateReviewStatus({ id: r.id, status: "flagged" }))} variant="danger" size="xs" />
            </>
          )}
          {r.status === "flagged" && (
            <ActionButton label="Resolve" onClick={() => dispatch(updateReviewStatus({ id: r.id, status: "resolved" }))} variant="success" size="xs" />
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <PageHeader
          title="Reviews & Complaints"
          subtitle="Manage user feedback and content disputes. All reports are timestamped and logged." // Updated subtitle
          stats={
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl border border-border-default bg-bg-card text-center min-w-[80px]">
                <p className="text-white font-bold text-xl">{pendingReviews}</p>
                <p className="text-text-muted text-[10px] uppercase tracking-wider">Pending Moderation</p> {/* Updated text */}
              </div>
              <div className="p-3 rounded-xl border border-border-default bg-bg-card text-center min-w-[80px]">
                <p className="text-white font-bold text-xl">{flaggedRatio}%</p>
                <p className="text-text-muted text-[10px] uppercase tracking-wider">Flagged Ratio</p>
              </div>
            </div>
          }
        />

        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Sentiment chart */}
          <SectionCard className="col-span-2" title="Monthly Sentiment Analysis" subtitle="Review quality trend over time">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={sentimentChart} barSize={28}>
                <CartesianGrid vertical={false} stroke="#1f1f1f" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(v: number) => [`${v}%`, "Sentiment Score"]}
                  contentStyle={{ background: "#1f1f1f", border: "1px solid #2a2a2a", borderRadius: 8 }}
                  cursor={{ fill: "rgba(229,62,62,0.05)" }}
                />
                <Bar dataKey="value" fill="#2a2a2a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="value" fill="rgba(229,62,62,0.3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          {/* Urgent dispute */}
          <SectionCard>
            <div className="mb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-red-500/10 border border-red-500/20 text-red-400"> {/* Keep red for critical */}
                Critical Action
              </span>
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Urgent Content Review</h3> {/* Updated title */}
            <p className="text-text-secondary text-sm mb-4"> 
              Report #4902 involves a severe platform policy violation. Legal/Trust & Safety review required within 4 hours. {/* Updated text */}
            </p>
            <button className="w-full h-10 rounded-xl bg-gradient-accent text-white text-sm font-semibold hover:opacity-90 transition-opacity">
              Investigate Now
            </button>
          </SectionCard>
        </div>

        {/* Reviews table */}
        <SectionCard noPadding>
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
            <div className="flex gap-4">
              {[["all", "All Reviews"], ["flagged", "Flagged"], ["resolved", "Resolved"]].map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as "all" | "flagged" | "resolved")}
                  className={`text-sm font-medium pb-1 border-b-2 transition-all ${
                    activeTab === tab // Changed accent-red to blue-600
                      ? "text-text-primary border-blue-600"
                      : "text-text-muted border-transparent hover:text-text-secondary"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 rounded-lg border border-border-default flex items-center justify-center text-text-muted hover:text-text-primary">☰</button>
              <button className="w-8 h-8 rounded-lg border border-border-default flex items-center justify-center text-text-muted hover:text-text-primary">
                <Download size={13} />
              </button>
            </div>
          </div>
          {loading ? <LoadingSpinner /> : (
            <DataTable columns={columns} data={filtered} keyExtractor={(r) => r.id} emptyMessage="No reviews found" />
          )}
          <div className="px-5 py-3 border-t border-border-subtle flex justify-between items-center">
            <p className="text-text-muted text-xs">Showing <strong className="text-text-primary">1–{filtered.length}</strong> of <strong className="text-text-primary">{list.length}</strong> reviews</p>
          </div>
        </SectionCard>

        {/* Bottom: Moderator log + Resolution template */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <SectionCard title="Admin Activity Log"> {/* Changed title */}
            <div className="space-y-3">
              {[
                { dot: "emerald", title: "Resolved Report #4102", sub: "Assigned credit to User Elena R.", time: "2 minutes ago" }, // Updated text
                { dot: "red", title: "Flagged Review #8821", sub: "Violation of safety guidelines.", time: "1 hour ago" },
                { dot: "gray", title: "Session Start", sub: "Admin login from NY Server.", time: "3 hours ago" },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 bg-${item.dot}-400`} />
                  <div>
                    <p className="text-text-primary text-sm font-medium">{item.title}</p>
                    <p className="text-text-muted text-xs">{item.sub}</p>
                    <p className="text-text-muted text-[10px] mt-0.5">{item.time}</p>
                  </div>
                </div>
              ))}
              <button className="text-accent-red text-xs hover:underline mt-2">VIEW FULL AUDIT TRAIL</button>
            </div>
          </SectionCard>

          <SectionCard title="Quick Resolution Template">
            <textarea
              defaultValue={`"We appreciate your feedback regarding your experience with [User Name]. We have reviewed the case and [Resolution Action]. Thank you for your patience."`} // Updated text
              className="w-full h-24 px-3 py-2 bg-bg-elevated border border-border-default rounded-lg text-sm text-text-secondary resize-none focus:outline-none focus:border-accent-red/50 mb-3"
            />
            <div className="flex gap-2 mb-4">
              <button className="h-8 px-4 rounded-lg border border-border-default text-text-secondary text-xs hover:text-text-primary transition-all">Save as Draft</button>
              <button className="h-8 px-4 rounded-lg border border-border-default text-text-secondary text-xs hover:text-text-primary transition-all">Edit Variables</button>
            </div>
            <div className="p-3 rounded-xl border border-border-subtle bg-bg-elevated flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-red-glow border border-accent-red/20 flex items-center justify-center text-accent-red">
                <Star size={14} />
              </div>
              <div>
                <p className="text-text-primary text-sm font-medium">Need Trust & Safety Review?</p> {/* Updated text */}
                <p className="text-text-muted text-xs">Escalate complex complaints to the Trust & Safety Committee.</p> {/* Updated text */}
              </div>
              <button className="ml-auto h-8 px-3 rounded-lg bg-gradient-accent text-white text-xs font-medium hover:opacity-90">
                Request Review
              </button>
            </div>
          </SectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
