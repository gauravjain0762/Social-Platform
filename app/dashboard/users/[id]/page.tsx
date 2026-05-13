"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  ArrowLeft, CheckCircle2, XCircle, Crown, Zap, Star,
  ChevronLeft, ChevronRight, Flag, ImageOff,
} from "lucide-react";

const BASE_URL = "https://social-platform-backend-a4zd.onrender.com";

interface Reporter {
  fullName: string;
  email: string;
  avatar: string;
}

interface Post {
  caption: string;
  media: string[];
  author: { fullName: string; avatar?: string };
}

interface Report {
  reason: string;
  reportedBy: Reporter;
  post: Post;
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const TIER_STYLES: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  free: {
    label: "Free",
    className: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
    icon: <Zap size={11} />,
  },
  gold: {
    label: "Gold",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    icon: <Star size={11} />,
  },
  platinum: {
    label: "Platinum",
    className: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    icon: <Crown size={11} />,
  },
};

function AvatarCircle({ name, src, size = "md" }: { name: string; src: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "lg" ? "w-16 h-16 text-lg" : size === "sm" ? "w-7 h-7 text-[10px]" : "w-9 h-9 text-xs";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  if (src) return <img src={src} alt={name} className={`${sizeClass} rounded-full object-cover shrink-0`} />;
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold shrink-0`}>
      {initials}
    </div>
  );
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params.id as string;

  // User info from URL params (passed from the list page)
  const name = searchParams.get("name") || "User";
  const email = searchParams.get("email") || "";
  const avatar = searchParams.get("avatar") || "";
  const membership = searchParams.get("membership") || "free";
  const isVerified = searchParams.get("verified") === "true";
  const joinedRaw = searchParams.get("joined") || "";
  const planPrice = searchParams.get("planPrice");
  const planType = searchParams.get("planType");

  const joined = joinedRaw
    ? new Date(joinedRaw).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—";

  const [activeTab, setActiveTab] = useState<"overview" | "reports">("overview");
  const [reports, setReports] = useState<Report[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsFetched, setReportsFetched] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("kick_admin_token") : "";

  const fetchReports = async (page: number) => {
    try {
      setReportsLoading(true);
      const res = await fetch(
        `${BASE_URL}/api/admin/users/${userId}/reported-posts?page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data?.success) {
        setReports(data.reports ?? []);
        setPagination(data.pagination ?? { total: data.reports?.length ?? 0, page, limit: 10, totalPages: 1 });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setReportsLoading(false);
      setReportsFetched(true);
    }
  };

  useEffect(() => {
    if (activeTab === "reports" && !reportsFetched) {
      fetchReports(1);
    }
  }, [activeTab]);

  const goToPage = (p: number) => {
    if (p < 1 || p > pagination.totalPages) return;
    fetchReports(p);
  };

  const tier = TIER_STYLES[membership] ?? TIER_STYLES.free;

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#070707] text-white px-5 py-6">
        {/* BACK */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-gray-500 hover:text-white text-xs mb-6 transition"
        >
          <ArrowLeft size={13} /> Back to Users
        </button>

        {/* USER HEADER CARD */}
        <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl p-5 mb-5 flex items-center gap-4">
          <AvatarCircle name={name} src={avatar} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base font-semibold text-white">{name}</h1>
              <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${tier.className}`}>
                {tier.icon} {tier.label}
              </span>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 text-[10px] text-green-500 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={10} /> Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                  <XCircle size={10} /> Unverified
                </span>
              )}
            </div>
            <p className="text-gray-500 text-xs mt-0.5">{email}</p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-1 mb-5 bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl p-1 w-fit">
          {(["overview", "reports"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition capitalize ${
                activeTab === tab
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab === "reports" ? "Reported Posts" : "Overview"}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl overflow-hidden">
            {[
              { label: "Full Name", value: name },
              { label: "Email", value: email },
              {
                label: "Membership",
                value: (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${tier.className}`}>
                    {tier.icon} {tier.label}
                  </span>
                ),
              },
              {
                label: "Plan",
                value: planPrice
                  ? `$${planPrice}${planType ? ` / ${planType === "monthly" ? "mo" : "yr"}` : ""}`
                  : "—",
              },
              {
                label: "Verified",
                value: isVerified ? (
                  <span className="flex items-center gap-1 text-green-500 text-xs"><CheckCircle2 size={13} /> Yes</span>
                ) : (
                  <span className="flex items-center gap-1 text-red-400 text-xs"><XCircle size={13} /> No</span>
                ),
              },
              { label: "Joined", value: joined },
              { label: "User ID", value: <span className="font-mono text-[11px] text-gray-500">{userId}</span> },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                className={`flex items-center justify-between px-5 py-3.5 ${i < arr.length - 1 ? "border-b border-[#141414]" : ""}`}
              >
                <span className="text-xs text-gray-500">{row.label}</span>
                <span className="text-xs text-white text-right">{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── REPORTED POSTS TAB ── */}
        {activeTab === "reports" && (
          <>
            {reportsLoading ? (
              <div className="flex justify-center py-16">
                <div className="w-7 h-7 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : reports.length === 0 && reportsFetched ? (
              <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl py-16 text-center">
                <Flag className="mx-auto mb-3 text-gray-700" size={32} />
                <p className="text-gray-500 text-sm">No reported posts for this user</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {reports.map((report, i) => (
                    <div key={i} className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl p-4">
                      {/* REPORT HEADER */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
                            <Flag size={10} />
                            {report.reason}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-600 shrink-0">
                          {new Date(report.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </span>
                      </div>

                      {/* POST CONTENT */}
                      {report.post && (
                        <div className="bg-[#141414] rounded-xl p-3 mb-3">
                          {report.post.caption && (
                            <p className="text-xs text-gray-300 leading-relaxed mb-2">{report.post.caption}</p>
                          )}
                          {report.post.media?.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {report.post.media.slice(0, 4).map((url, mi) => (
                                <div key={mi} className="w-16 h-16 rounded-lg overflow-hidden bg-[#1e1e1e] flex items-center justify-center">
                                  {url ? (
                                    <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).style.display = "none";
                                    }} />
                                  ) : (
                                    <ImageOff size={14} className="text-gray-600" />
                                  )}
                                </div>
                              ))}
                              {report.post.media.length > 4 && (
                                <div className="w-16 h-16 rounded-lg bg-[#1e1e1e] flex items-center justify-center text-gray-500 text-xs">
                                  +{report.post.media.length - 4}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* REPORTED BY */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-gray-600">Reported by</span>
                        <AvatarCircle name={report.reportedBy?.fullName || "?"} src={report.reportedBy?.avatar || ""} size="sm" />
                        <span className="text-[11px] text-gray-400">{report.reportedBy?.fullName}</span>
                        <span className="text-[11px] text-gray-600">{report.reportedBy?.email}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* PAGINATION */}
                {pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-600">
                      Page {pagination.page} of {pagination.totalPages} · {pagination.total} reports
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => goToPage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="w-7 h-7 rounded-lg border border-[#222] flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter((p) => Math.abs(p - pagination.page) <= 2)
                        .map((p) => (
                          <button
                            key={p}
                            onClick={() => goToPage(p)}
                            className={`w-7 h-7 rounded-lg border text-xs font-medium transition ${
                              p === pagination.page
                                ? "border-purple-500 bg-purple-500/10 text-purple-400"
                                : "border-[#222] text-gray-500 hover:text-white"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      <button
                        onClick={() => goToPage(pagination.page + 1)}
                        disabled={pagination.page === pagination.totalPages}
                        className="w-7 h-7 rounded-lg border border-[#222] flex items-center justify-center text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
