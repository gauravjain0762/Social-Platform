"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Users, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Crown, Zap, Star, Eye } from "lucide-react";

const BASE_URL = "https://social-platform-backend-a4zd.onrender.com";

interface Plan {
  _id: string;
  type: string;
  tier: string;
  price: number;
  features: string[];
}

interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar: string;
  membership: string;
  isPlanSelected: boolean;
  isVerified: boolean;
  createdAt: string;
  plan: Plan | null;
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
    icon: <Zap size={10} />,
  },
  gold: {
    label: "Gold",
    className: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    icon: <Star size={10} />,
  },
  platinum: {
    label: "Platinum",
    className: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    icon: <Crown size={10} />,
  },
};

function Avatar({ name, src }: { name: string; src: string }) {
  if (src) {
    return <img src={src} alt={name} className="w-8 h-8 rounded-full object-cover" />;
  }
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-[11px] font-semibold shrink-0">
      {initials}
    </div>
  );
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("kick_admin_token") : "";

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/admin/users?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data?.users) {
        setUsers(data.users);
        setPagination(data.pagination ?? { total: data.users.length, page, limit: 10, totalPages: 1 });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
  }, []);

  const goToPage = (p: number) => {
    if (p < 1 || p > pagination.totalPages) return;
    fetchUsers(p);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#070707] text-white px-5 py-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">All Users</h1>
            <p className="text-gray-500 text-xs mt-0.5">
              {pagination.total > 0 ? `${pagination.total} registered users` : "Manage your platform users"}
            </p>
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl py-20 text-center">
            <Users className="mx-auto mb-3 text-purple-500/40" size={36} />
            <p className="text-gray-400 text-sm">No users found</p>
          </div>
        ) : (
          <>
            <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl overflow-hidden">
              {/* TABLE HEAD */}
              <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-[#1a1a1a] text-[11px] uppercase tracking-wider text-gray-600 font-medium">
                <span>User</span>
                <span>Email</span>
                <span>Membership</span>
                <span>Plan</span>
                <span>Verified</span>
                <span>Joined</span>
                <span></span>
              </div>

              {/* TABLE ROWS */}
              <div className="divide-y divide-[#141414]">
                {users.map((user) => {
                  const tier = TIER_STYLES[user.membership] ?? TIER_STYLES.free;
                  const joined = new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });

                  const params = new URLSearchParams({
                    name: user.fullName,
                    email: user.email,
                    avatar: user.avatar || "",
                    membership: user.membership,
                    verified: String(user.isVerified),
                    joined: user.createdAt,
                    planPrice: user.plan ? String(user.plan.price) : "",
                    planType: user.plan?.type || "",
                  });

                  return (
                    <div
                      key={user._id}
                      className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3.5 items-center hover:bg-white/[0.02] transition"
                    >
                      {/* USER */}
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={user.fullName} src={user.avatar} />
                        <span className="text-sm font-medium text-white truncate">{user.fullName}</span>
                      </div>

                      {/* EMAIL */}
                      <span className="text-xs text-gray-400 truncate">{user.email}</span>

                      {/* MEMBERSHIP BADGE */}
                      <div>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${tier.className}`}>
                          {tier.icon}
                          {tier.label}
                        </span>
                      </div>

                      {/* PLAN */}
                      <div className="text-xs text-gray-400">
                        {user.plan ? (
                          <span>
                            ${user.plan.price}
                            <span className="text-gray-600">/{user.plan.type === "monthly" ? "mo" : "yr"}</span>
                          </span>
                        ) : (
                          <span className="text-gray-600">—</span>
                        )}
                      </div>

                      {/* VERIFIED */}
                      <div>
                        {user.isVerified ? (
                          <CheckCircle2 size={14} className="text-green-500" />
                        ) : (
                          <XCircle size={14} className="text-red-400/60" />
                        )}
                      </div>

                      {/* JOINED */}
                      <span className="text-xs text-gray-500">{joined}</span>

                      {/* VIEW */}
                      <button
                        onClick={() => router.push(`/dashboard/users/${user._id}?${params.toString()}`)}
                        className="flex items-center gap-1.5 text-[11px] font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1.5 rounded-lg hover:bg-purple-500/20 transition whitespace-nowrap"
                      >
                        <Eye size={12} /> View
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* PAGINATION */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => goToPage(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="w-7 h-7 rounded-lg border border-[#222] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition"
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
                            : "border-[#222] text-gray-500 hover:text-white hover:border-[#333]"
                        }`}
                      >
                        {p}
                      </button>
                    ))}

                  <button
                    onClick={() => goToPage(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="w-7 h-7 rounded-lg border border-[#222] flex items-center justify-center text-gray-400 hover:text-white hover:border-[#333] disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
