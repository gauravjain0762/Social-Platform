"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  ArrowLeft, CheckCircle2, XCircle, Crown, Zap, Star,
  ChevronLeft, ChevronRight, Flag, ImageOff, X, Trash2,
  ShieldOff, Shield, AlertTriangle, EyeOff, Eye, Send,
} from "lucide-react";

const BASE_URL = "https://social-platform-backend-a4zd.onrender.com";

interface Reporter {
  fullName: string;
  email: string;
  avatar: string;
}

interface MediaItem {
  url: string;
  type: string;
}

interface Post {
  caption: string;
  media: MediaItem[];
  author: { fullName: string; avatar?: string };
}

interface Report {
  postId: string;
  reason: string;
  reportedBy: Reporter;
  post: Post | null;
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
  const [lightbox, setLightbox] = useState<{ url: string; type: string } | null>(null);
  const [reportedCount, setReportedCount] = useState<number | null>(null);
  const [deletingPostIds, setDeletingPostIds] = useState<Set<string>>(new Set());
  const [isSuspended, setIsSuspended] = useState<boolean | null>(null);
  const [isRestricted, setIsRestricted] = useState<boolean | null>(null);
  const [suspending, setSuspending] = useState(false);
  const [restricting, setRestricting] = useState(false);
  const [showWarnModal, setShowWarnModal] = useState(false);
  const [warnMessage, setWarnMessage] = useState("");
  const [warning, setWarning] = useState(false);
  const [warnSuccess, setWarnSuccess] = useState<string | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("kick_admin_token") : "";

  useEffect(() => {
    fetch(`${BASE_URL}/api/admin/users/${userId}/reported-posts/count`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => { if (d?.success) setReportedCount(d.totalReportedPosts); })
      .catch(() => {});
  }, [userId]);

  const fetchReports = async (page: number) => {
    try {
      setReportsLoading(true);
      const res = await fetch(
        `${BASE_URL}/api/admin/users/${userId}/reported-posts?page=${page}&limit=10`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data?.success) {
        const rawReports = data.reports ?? data.data ?? data.reportedPosts ?? [];
        const normalized: Report[] = rawReports.map((r: Record<string, unknown>) => {
          const rawPost = (r.post ?? r.postId ?? null) as Record<string, unknown> | null;
          const rawReporter = (r.reportedBy ?? r.reporter ?? {}) as Record<string, unknown>;
          const rawAuthor = rawPost
            ? ((rawPost.author ?? rawPost.user ?? {}) as Record<string, unknown>)
            : {};
          const rawMedia = (rawPost?.media ?? rawPost?.images ?? rawPost?.attachments ?? []) as Array<
            { url?: string; type?: string } | string
          >;
          return {
            postId: (rawPost?._id as string) ?? "",
            reason: (r.reason as string) ?? "",
            createdAt: (r.createdAt as string) ?? "",
            reportedBy: {
              fullName: (rawReporter.fullName ?? rawReporter.name ?? "") as string,
              email: (rawReporter.email ?? "") as string,
              avatar: (rawReporter.avatar ?? rawReporter.profilePicture ?? "") as string,
            },
            post: rawPost
              ? {
                  caption: (rawPost.caption ?? rawPost.content ?? rawPost.text ?? rawPost.body ?? "") as string,
                  media: rawMedia.map((m) =>
                    typeof m === "string"
                      ? { url: m, type: "image" }
                      : { url: m.url ?? "", type: m.type ?? "image" }
                  ),
                  author: {
                    fullName: (rawAuthor.fullName ?? rawAuthor.name ?? "") as string,
                    avatar: (rawAuthor.avatar ?? rawAuthor.profilePicture ?? "") as string,
                  },
                }
              : null,
          };
        });
        setReports(normalized);
        setPagination(data.pagination ?? { total: normalized.length, page, limit: 10, totalPages: 1 });
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

  const deletePost = async (postId: string) => {
    setDeletingPostIds((prev) => new Set(prev).add(postId));
    try {
      const res = await fetch(`${BASE_URL}/api/admin/posts/${postId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.success) {
        setReports((prev) => prev.filter((r) => r.postId !== postId));
        setReportedCount((prev) => (prev !== null ? Math.max(0, prev - 1) : prev));
      }
    } catch (err) {
      console.log(err);
    } finally {
      setDeletingPostIds((prev) => {
        const next = new Set(prev);
        next.delete(postId);
        return next;
      });
    }
  };

  const toggleSuspend = async () => {
    setSuspending(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/users/${userId}/suspend`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.success) setIsSuspended(data.isSuspended);
    } catch (err) {
      console.log(err);
    } finally {
      setSuspending(false);
    }
  };

  const toggleRestrict = async () => {
    setRestricting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/users/${userId}/restrict`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.success) setIsRestricted(data.isRestricted);
    } catch (err) {
      console.log(err);
    } finally {
      setRestricting(false);
    }
  };

  const sendWarning = async () => {
    if (!warnMessage.trim()) return;
    setWarning(true);
    try {
      const res = await fetch(`${BASE_URL}/api/admin/users/${userId}/warn`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message: warnMessage.trim() }),
      });
      const data = await res.json();
      if (data?.success) {
        setWarnSuccess(`Warning sent · ${data.totalWarnings} total warning${data.totalWarnings !== 1 ? "s" : ""}`);
        setWarnMessage("");
        setTimeout(() => {
          setShowWarnModal(false);
          setWarnSuccess(null);
        }, 1800);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setWarning(false);
    }
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > pagination.totalPages) return;
    fetchReports(p);
  };

  const tier = TIER_STYLES[membership] ?? TIER_STYLES.free;

  return (
    <DashboardLayout>
      {/* LIGHTBOX */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
          >
            <X size={18} />
          </button>
          <div
            className="max-w-3xl w-full max-h-[90vh] flex items-center justify-center px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {lightbox.type === "video" ? (
              <video
                src={lightbox.url}
                controls
                autoPlay
                className="max-h-[85vh] max-w-full rounded-xl"
              />
            ) : (
              <img
                src={lightbox.url}
                alt=""
                className="max-h-[85vh] max-w-full rounded-xl object-contain"
              />
            )}
          </div>
        </div>
      )}

      {/* WARN MODAL */}
      {showWarnModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center px-4"
          onClick={() => { setShowWarnModal(false); setWarnMessage(""); setWarnSuccess(null); }}
        >
          <div
            className="bg-[#111] border border-[#222] rounded-2xl p-5 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-400" />
                <span className="text-sm font-semibold text-white">Send Warning</span>
              </div>
              <button
                onClick={() => { setShowWarnModal(false); setWarnMessage(""); setWarnSuccess(null); }}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 transition"
              >
                <X size={14} />
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mb-3">
              This message will be sent to <span className="text-gray-300">{name}</span> as an official warning. All warnings are permanently stored on the account.
            </p>
            <textarea
              value={warnMessage}
              onChange={(e) => setWarnMessage(e.target.value)}
              placeholder="Your post violated our community guidelines…"
              rows={4}
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-3 py-2.5 text-xs text-gray-200 placeholder-gray-600 resize-none outline-none focus:border-amber-500/50 transition mb-3"
            />
            {warnSuccess && (
              <p className="text-[11px] text-green-400 mb-3 flex items-center gap-1.5">
                <CheckCircle2 size={12} /> {warnSuccess}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowWarnModal(false); setWarnMessage(""); setWarnSuccess(null); }}
                className="px-3 py-1.5 rounded-lg text-xs text-gray-500 hover:text-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={sendWarning}
                disabled={warning || !warnMessage.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {warning ? (
                  <span className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send size={11} />
                )}
                Send Warning
              </button>
            </div>
          </div>
        </div>
      )}

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
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition ${
                activeTab === tab
                  ? "bg-white/10 text-white"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab === "reports" ? "Reported Posts" : "Overview"}
              {tab === "reports" && reportedCount !== null && (
                <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold ${
                  reportedCount > 0
                    ? "bg-red-500/20 text-red-400 border border-red-500/30"
                    : "bg-gray-500/20 text-gray-500 border border-gray-500/20"
                }`}>
                  {reportedCount}
                </span>
              )}
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
            {/* ACTION BAR */}
            <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-[#0f0f0f] border border-[#1e1e1e] rounded-xl">
              <span className="text-[11px] text-gray-600 mr-1">User actions:</span>

              {/* SUSPEND */}
              <button
                onClick={toggleSuspend}
                disabled={suspending}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  isSuspended
                    ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                    : "bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20"
                }`}
              >
                {suspending ? (
                  <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                ) : isSuspended ? (
                  <Shield size={11} />
                ) : (
                  <ShieldOff size={11} />
                )}
                {isSuspended ? "Unsuspend User" : "Suspend User"}
              </button>

              {/* WARN */}
              <button
                onClick={() => setShowWarnModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition"
              >
                <AlertTriangle size={11} />
                Send Warning
              </button>

              {/* RESTRICT */}
              <button
                onClick={toggleRestrict}
                disabled={restricting}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRestricted
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
                    : "bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20"
                }`}
              >
                {restricting ? (
                  <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                ) : isRestricted ? (
                  <Eye size={11} />
                ) : (
                  <EyeOff size={11} />
                )}
                {isRestricted ? "Restore Visibility" : "Restrict Visibility"}
              </button>

              {/* STATUS CHIPS */}
              {isSuspended && (
                <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                  <ShieldOff size={9} /> Suspended
                </span>
              )}
              {isRestricted && (
                <span className={`${isSuspended ? "" : "ml-auto"} inline-flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full`}>
                  <EyeOff size={9} /> Restricted
                </span>
              )}
            </div>

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
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] text-gray-600">
                            {new Date(report.createdAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                            })}
                          </span>
                          {report.post && report.postId && (
                            <button
                              onClick={() => deletePost(report.postId)}
                              disabled={deletingPostIds.has(report.postId)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-lg hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                              {deletingPostIds.has(report.postId) ? (
                                <span className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 size={10} />
                              )}
                              Delete Post
                            </button>
                          )}
                        </div>
                      </div>

                      {/* POST CONTENT */}
                      {report.post ? (
                        <div className="bg-[#141414] rounded-xl p-3 mb-3">
                          {report.post.author?.fullName && (
                            <div className="flex items-center gap-2 mb-2">
                              <AvatarCircle name={report.post.author.fullName} src={report.post.author.avatar ?? ""} size="sm" />
                              <span className="text-[11px] text-gray-400 font-medium">{report.post.author.fullName}</span>
                            </div>
                          )}
                          {report.post.caption ? (
                            <p className="text-xs text-gray-300 leading-relaxed mb-2">{report.post.caption}</p>
                          ) : null}
                          {report.post.media?.length > 0 && (
                            <div className="flex gap-2 flex-wrap">
                              {report.post.media.slice(0, 4).map((item, mi) => (
                                <div
                                  key={mi}
                                  onClick={() => item.url && setLightbox(item)}
                                  className="w-20 h-20 rounded-lg overflow-hidden bg-[#1e1e1e] flex items-center justify-center shrink-0 cursor-pointer hover:ring-2 hover:ring-purple-500/60 transition"
                                >
                                  {item.url ? (
                                    item.type === "video" ? (
                                      <video
                                        src={item.url}
                                        className="w-full h-full object-cover pointer-events-none"
                                        muted
                                        playsInline
                                        onError={(e) => { (e.currentTarget as HTMLVideoElement).style.display = "none"; }}
                                      />
                                    ) : (
                                      <img
                                        src={item.url}
                                        alt=""
                                        className="w-full h-full object-cover pointer-events-none"
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                                      />
                                    )
                                  ) : (
                                    <ImageOff size={14} className="text-gray-600" />
                                  )}
                                </div>
                              ))}
                              {report.post.media.length > 4 && (
                                <div className="w-20 h-20 rounded-lg bg-[#1e1e1e] flex items-center justify-center text-gray-500 text-xs">
                                  +{report.post.media.length - 4}
                                </div>
                              )}
                            </div>
                          )}
                          {!report.post.caption && (!report.post.media || report.post.media.length === 0) && (
                            <p className="text-xs text-gray-600 italic">No post content available</p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-[#141414] rounded-xl p-3 mb-3">
                          <p className="text-xs text-gray-600 italic">Post no longer available</p>
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
