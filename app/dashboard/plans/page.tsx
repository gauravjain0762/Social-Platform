"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  Crown,
} from "lucide-react";

const BASE_URL =
  "https://social-platform-backend-a4zd.onrender.com";

interface Plan {
  _id: string;
  type: string;
  tier: string;
  price: number;
  features: string[];
  isActive?: boolean;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);

  const [editingPlan, setEditingPlan] =
    useState<Plan | null>(null);

  const [formData, setFormData] = useState({
    type: "monthly",
    tier: "free",
    price: "",
    features: "",
    isActive: true,
  });

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("adminToken")
      : "";

  // ================= FETCH PLANS =================

  const fetchPlans = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${BASE_URL}/api/admin/plans`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (Array.isArray(data?.plans)) {
        setPlans(data.plans);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.log(error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // ================= CREATE / UPDATE =================

  const handleSubmit = async () => {
    try {
      const body = {
        type:
          formData.tier === "free"
            ? "monthly"
            : formData.type,

        tier: formData.tier,

        price:
          formData.tier === "free"
            ? 0
            : Number(formData.price),

        features: formData.features
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),

        isActive: formData.isActive,
      };

      let url = `${BASE_URL}/api/admin/plans`;

      let method = "POST";

      if (editingPlan) {
        url = `${BASE_URL}/api/admin/plans/${editingPlan._id}`;

        method = "PUT";
      }

      const res = await fetch(url, {
        method,
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

        setFormData({
          type: "monthly",
          tier: "free",
          price: "",
          features: "",
          isActive: true,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ================= DELETE =================

  const deletePlan = async (id: string) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this plan?"
    );

    if (!confirmDelete) return;

    try {
      await fetch(
        `${BASE_URL}/api/admin/plans/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchPlans();
    } catch (error) {
      console.log(error);
    }
  };

  // ================= EDIT =================

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

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#070707] text-white p-6">
        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Subscription Plans
            </h1>

            <p className="text-gray-400 mt-2">
              Create and manage membership plans for
              your platform
            </p>
          </div>

          <button
            onClick={() => {
              setEditingPlan(null);

              setFormData({
                type: "monthly",
                tier: "free",
                price: "",
                features: "",
                isActive: true,
              });

              setOpenModal(true);
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 rounded-2xl flex items-center justify-center gap-2 hover:scale-105 transition-all"
          >
            <Plus size={18} />
            Create Plan
          </button>
        </div>

        {/* LOADING */}

        {loading ? (
          <div className="flex justify-center py-32">
            <div className="w-14 h-14 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {plans.length === 0 ? (
              <div className="bg-[#111] border border-[#222] rounded-3xl py-24 text-center">
                <Crown
                  className="mx-auto mb-4 text-purple-500"
                  size={60}
                />

                <h2 className="text-2xl font-semibold">
                  No Plans Created Yet
                </h2>

                <p className="text-gray-500 mt-3">
                  Create your first membership plan
                </p>
              </div>
            ) : (
              <div className="grid xl:grid-cols-3 md:grid-cols-2 gap-7">
                {plans.map((plan) => (
                  <div
                    key={plan._id}
                    className={`relative rounded-3xl p-8 transition-all hover:scale-[1.02]
                    ${
                      plan.tier === "gold"
                        ? "bg-gradient-to-b from-[#10182a] to-[#0d1117] border border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.15)]"
                        : plan.tier === "platinum"
                        ? "bg-gradient-to-b from-[#181818] to-[#0f0f0f] border border-[#333]"
                        : "bg-[#111] border border-[#222]"
                    }`}
                  >
                    {/* MOST POPULAR */}

                    {plan.tier === "gold" && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-4 py-1 rounded-full font-medium">
                        Most Popular
                      </div>
                    )}

                    {/* PLAN NAME */}

                    <div>
                      <p className="text-sm uppercase tracking-[0.3em] text-blue-400">
                        {plan.tier === "free"
                          ? "Starter"
                          : plan.tier === "gold"
                          ? "Influencer"
                          : "Professional"}
                      </p>

                      <div className="flex items-center gap-2 mt-3">
                        <h2 className="text-4xl font-bold capitalize">
                          {plan.tier}
                        </h2>

                        {plan.isActive ? (
                          <CheckCircle2
                            size={20}
                            className="text-green-500"
                          />
                        ) : (
                          <XCircle
                            size={20}
                            className="text-red-500"
                          />
                        )}
                      </div>
                    </div>

                    {/* PRICE */}

                    <div className="mt-8 flex items-end gap-2">
                      <h3 className="text-6xl font-bold tracking-tight">
                        {plan.tier === "free"
                          ? "$0"
                          : `$${plan.price}`}
                      </h3>

                      <span className="text-gray-500 mb-2">
                        {plan.tier === "free"
                          ? "Free Forever"
                          : `/${
                              plan.type === "monthly"
                                ? "mo"
                                : "yr"
                            }`}
                      </span>
                    </div>

                    {/* FEATURES */}

                    <div className="mt-10 space-y-4">
                      {plan.features?.map(
                        (feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3"
                          >
                            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
                              ✓
                            </div>

                            <span className="text-gray-300">
                              {feature}
                            </span>
                          </div>
                        )
                      )}
                    </div>

                    {/* CTA */}

                    <div className="mt-10">
                      <button
                        className={`w-full py-3 rounded-2xl font-semibold transition-all ${
                          plan.tier === "gold"
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : plan.tier === "platinum"
                            ? "bg-[#2c2f38] hover:bg-[#3b3f4d] text-white"
                            : "bg-[#d9d9df] hover:bg-white text-black"
                        }`}
                      >
                        {plan.tier === "free"
                          ? "Join for Free"
                          : plan.tier === "gold"
                          ? "Get Gold"
                          : "Go Platinum"}
                      </button>

                      {/* ADMIN ACTIONS */}

                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() =>
                            openEdit(plan)
                          }
                          className="flex-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500/20 transition"
                        >
                          <Edit size={16} />
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deletePlan(plan._id)
                          }
                          className="flex-1 bg-red-500/10 border border-red-500/20 text-red-400 py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-red-500/20 transition"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* MODAL */}

        {openModal && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-[#111] border border-[#222] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-7">
              {/* HEADER */}

              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">
                  {editingPlan
                    ? "Update Plan"
                    : "Create Plan"}
                </h2>

                <button
                  onClick={() =>
                    setOpenModal(false)
                  }
                  className="text-gray-500 hover:text-white text-xl"
                >
                  ✕
                </button>
              </div>

                  <div className="space-y-5">
                {/* TIER */}

                <div>
                  <label className="text-sm text-gray-400 mb-4 block">
                    Select Membership Tier
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      {
                        value: "free",
                        label: "Free",
                        desc: "Starter Access",
                      },
                      {
                        value: "gold",
                        label: "Gold",
                        desc: "Creator Plan",
                      },
                      {
                        value: "platinum",
                        label: "Platinum",
                        desc: "Professional Plan",
                      },
                    ].map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,

                            tier: item.value,

                            price:
                              item.value ===
                              "free"
                                ? "0"
                                : formData.price,

                            type:
                              item.value ===
                              "free"
                                ? "monthly"
                                : formData.type,
                          })
                        }
                        className={`rounded-2xl p-4 text-left border transition-all ${
                          formData.tier ===
                          item.value
                            ? "border-purple-500 bg-purple-500/10"
                            : "border-[#333] bg-[#151515]"
                        }`}
                      >
                        <h3 className="text-xl font-semibold">
                          {item.label}
                        </h3>

                        <p className="text-gray-500 text-sm mt-2">
                          {item.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* BILLING */}

                {formData.tier !== "free" && (
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Billing Type
                    </label>

                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value,
                        })
                      }
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-2xl px-5 py-4 outline-none"
                    >
                      <option value="monthly">
                        Monthly
                      </option>

                      <option value="yearly">
                        Yearly
                      </option>
                    </select>
                  </div>
                )}

                {/* PRICE */}

                {formData.tier !== "free" && (
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">
                      Price
                    </label>

                    <input
                      type="number"
                      placeholder="499"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: e.target.value,
                        })
                      }
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-2xl px-5 py-4 outline-none"
                    />
                  </div>
                )}

                {/* FEATURES */}

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">
                    Features
                  </label>

                  <textarea
                    rows={3}
                    placeholder="HD Streaming, Unlimited Uploads, Priority Support"
                    value={formData.features}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        features: e.target.value,
                      })
                    }
                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-2xl px-5 py-4 outline-none resize-none"
                  />
                </div>

                {/* ACTIVE */}

                <div className="flex items-center justify-between">
                  <span className="text-gray-300">
                    Active Plan
                  </span>

                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        isActive:
                          !formData.isActive,
                      })
                    }
                    className={`w-14 h-7 rounded-full transition relative ${
                      formData.isActive
                        ? "bg-green-500"
                        : "bg-gray-600"
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-5 h-5 rounded-full bg-white transition ${
                        formData.isActive
                          ? "left-8"
                          : "left-1"
                      }`}
                    />
                  </button>
                </div>

                {/* SUBMIT */}

                <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-2xl font-semibold text-lg hover:opacity-90 transition-all"
                >
                  {editingPlan
                    ? "Update Plan"
                    : "Create Plan"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}