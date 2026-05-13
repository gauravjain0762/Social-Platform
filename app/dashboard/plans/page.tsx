"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Plus, Trash2, Edit, CheckCircle2, XCircle, Crown, Zap, Star } from "lucide-react";

const BASE_URL = "https://social-platform-backend-a4zd.onrender.com";

interface Plan {
  _id: string;
  type: string;
  tier: string;
  price: number;
  features: string[];
  isActive?: boolean;
}

const TIER_CONFIG = {
  free: {
    label: "Starter",
    icon: <Zap size={14} />,
    accent: "text-gray-400",
    border: "border-[#2a2a2a]",
    badge: "",
    cta: "bg-[#1e1e1e] hover:bg-[#282828] text-white",
    ctaLabel: "Join for Free",
    ring: "",
  },
  gold: {
    label: "Influencer",
    icon: <Star size={14} />,
    accent: "text-amber-400",
    border: "border-amber-500/40",
    badge: "Most Popular",
    cta: "bg-amber-500 hover:bg-amber-400 text-black",
    ctaLabel: "Get Gold",
    ring: "shadow-[0_0_24px_rgba(245,158,11,0.12)]",
  },
  platinum: {
    label: "Professional",
    icon: <Crown size={14} />,
    accent: "text-purple-400",
    border: "border-purple-500/40",
    badge: "",
    cta: "bg-purple-600 hover:bg-purple-500 text-white",
    ctaLabel: "Go Platinum",
    ring: "shadow-[0_0_24px_rgba(168,85,247,0.12)]",
  },
};

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    type: "monthly",
    tier: "free",
    price: "",
    features: "",
    isActive: true,
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("kick_admin_token") : "";

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/api/admin/plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPlans(Array.isArray(data?.plans) ? data.plans : []);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async () => {
    try {
      const body = {
        type: formData.tier === "free" ? "monthly" : formData.type,
        tier: formData.tier,
        price: formData.tier === "free" ? 0 : Number(formData.price),
        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
        isActive: formData.isActive,
      };

      const url = editingPlan
        ? `${BASE_URL}/api/admin/plans/${editingPlan._id}`
        : `${BASE_URL}/api/admin/plans`;

      const res = await fetch(url, {
        method: editingPlan ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchPlans();
        setOpenModal(false);
        setEditingPlan(null);
        setFormData({ type: "monthly", tier: "free", price: "", features: "", isActive: true });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deletePlan = async (id: string) => {
    if (!confirm("Delete this plan?")) return;
    try {
      await fetch(`${BASE_URL}/api/admin/plans/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPlans();
    } catch (error) {
      console.log(error);
    }
  };

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      type: plan.type,
      tier: plan.tier,
      price: String(plan.price),
      features: plan.features.join(", "),
      isActive: plan.isActive ?? true,
    });
    setOpenModal(true);
  };

  const openCreate = () => {
    setEditingPlan(null);
    setFormData({ type: "monthly", tier: "free", price: "", features: "", isActive: true });
    setOpenModal(true);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#070707] text-white px-5 py-6">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Subscription Plans</h1>
            <p className="text-gray-500 text-xs mt-0.5">Manage membership tiers for your platform</p>
          </div>
          <button
            onClick={openCreate}
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-xl flex items-center gap-1.5 text-sm font-medium hover:opacity-90 transition"
          >
            <Plus size={15} />
            New Plan
          </button>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl py-20 text-center">
            <Crown className="mx-auto mb-3 text-purple-500/50" size={36} />
            <h2 className="text-base font-medium text-gray-300">No plans yet</h2>
            <p className="text-gray-600 text-sm mt-1">Create your first membership plan to get started</p>
          </div>
        ) : (
          <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-4">
            {plans.map((plan) => {
              const cfg = TIER_CONFIG[plan.tier as keyof typeof TIER_CONFIG] ?? TIER_CONFIG.free;
              return (
                <div
                  key={plan._id}
                  className={`relative bg-[#0f0f0f] border rounded-2xl p-5 flex flex-col transition-transform hover:translate-y-[-2px] ${cfg.border} ${cfg.ring}`}
                >
                  {/* MOST POPULAR BADGE */}
                  {cfg.badge && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-[10px] font-semibold px-3 py-0.5 rounded-full tracking-wide uppercase">
                      {cfg.badge}
                    </div>
                  )}

                  {/* TOP ROW */}
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`text-[10px] uppercase tracking-[0.2em] font-medium flex items-center gap-1 ${cfg.accent}`}>
                        {cfg.icon}
                        {cfg.label}
                      </p>
                      <h2 className="text-base font-semibold capitalize mt-0.5">{plan.tier}</h2>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {plan.isActive ? (
                        <span className="flex items-center gap-1 text-green-500 text-[10px] font-medium bg-green-500/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={10} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400 text-[10px] font-medium bg-red-500/10 px-2 py-0.5 rounded-full">
                          <XCircle size={10} /> Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* PRICE */}
                  <div className="flex items-end gap-1 mt-4">
                    <span className="text-2xl font-bold tracking-tight">
                      {plan.tier === "free" ? "$0" : `$${plan.price}`}
                    </span>
                    <span className="text-gray-500 text-xs mb-0.5">
                      {plan.tier === "free" ? "/ forever" : `/ ${plan.type === "monthly" ? "mo" : "yr"}`}
                    </span>
                  </div>

                  {/* FEATURES */}
                  <ul className="mt-4 space-y-2 flex-1">
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-400 text-xs">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] shrink-0 ${
                          plan.tier === "gold"
                            ? "bg-amber-500/20 text-amber-400"
                            : plan.tier === "platinum"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-gray-700 text-gray-400"
                        }`}>
                          ✓
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="mt-5 space-y-2">
                    <button className={`w-full py-2 rounded-xl text-xs font-semibold transition ${cfg.cta}`}>
                      {cfg.ctaLabel}
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(plan)}
                        className="flex-1 bg-white/5 border border-white/10 text-gray-300 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-xs hover:bg-white/10 transition"
                      >
                        <Edit size={12} /> Edit
                      </button>
                      <button
                        onClick={() => deletePlan(plan._id)}
                        className="flex-1 bg-red-500/5 border border-red-500/20 text-red-400 py-1.5 rounded-lg flex items-center justify-center gap-1.5 text-xs hover:bg-red-500/15 transition"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL */}
        {openModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e1e]">
                <h2 className="text-sm font-semibold">
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </h2>
                <button
                  onClick={() => setOpenModal(false)}
                  className="text-gray-500 hover:text-white text-sm w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/10 transition"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* TIER SELECTOR */}
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Tier</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "free", label: "Free", desc: "Starter" },
                      { value: "gold", label: "Gold", desc: "Creator" },
                      { value: "platinum", label: "Platinum", desc: "Pro" },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            tier: item.value,
                            price: item.value === "free" ? "0" : formData.price,
                            type: item.value === "free" ? "monthly" : formData.type,
                          })
                        }
                        className={`rounded-xl p-3 text-left border transition-all ${
                          formData.tier === item.value
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-[#222] bg-[#141414] hover:border-[#333]"
                        }`}
                      >
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-gray-500 text-[10px] mt-0.5">{item.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* BILLING TYPE */}
                {formData.tier !== "free" && (
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">Billing Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-[#141414] border border-[#222] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-purple-500/50 transition"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                )}

                {/* PRICE */}
                {formData.tier !== "free" && (
                  <div>
                    <label className="text-xs text-gray-500 mb-2 block">Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                      <input
                        type="number"
                        placeholder="499"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full bg-[#141414] border border-[#222] rounded-xl pl-7 pr-3 py-2.5 text-sm outline-none focus:border-purple-500/50 transition"
                      />
                    </div>
                  </div>
                )}

                {/* FEATURES */}
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">
                    Features <span className="text-gray-600">(comma-separated)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="HD Streaming, Unlimited Uploads, Priority Support"
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="w-full bg-[#141414] border border-[#222] rounded-xl px-3 py-2.5 text-sm outline-none resize-none focus:border-purple-500/50 transition"
                  />
                </div>

                {/* ACTIVE TOGGLE */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-400">Active</span>
                  <button
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`w-10 h-5 rounded-full transition-colors relative ${
                      formData.isActive ? "bg-green-500" : "bg-gray-700"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                        formData.isActive ? "left-5" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* SUBMIT */}
                <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition"
                >
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
