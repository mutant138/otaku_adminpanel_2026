import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import { toast } from "../store/useToastStore.js";
import Badge from "../components/common/Badge.jsx";
import Modal from "../components/common/Modal.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import {
  LoadingSpinner,
  EmptyState,
} from "../components/common/LoadingSpinner.jsx";
import { Sparkles, Plus, Edit2, Trash2, Check, Crown } from "lucide-react";

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const initialForm = {
    planId: "",
    name: "",
    price: 99,
    originalPrice: 199,
    description: "",
    type: "refill",
    durationDays: 0,
    complimentsRefill: 5,
    isPremium: false,
    benefits: [{ text: "5 Extra Compliments", iconName: "heart" }],
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await api.get("/plans");
      if (res.status && res.data) {
        setPlans(res.data);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreateModal = () => {
    setFormData(initialForm);
    setCreateModalOpen(true);
  };

  const openEditModal = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      planId: plan.planId || "",
      name: plan.name || "",
      price: plan.price || 0,
      originalPrice: plan.originalPrice || 0,
      description: plan.description || "",
      type: plan.type || "refill",
      durationDays: plan.durationDays || 0,
      complimentsRefill: plan.complimentsRefill || 0,
      isPremium: Boolean(plan.isPremium),
      benefits:
        plan.benefits && plan.benefits.length > 0
          ? plan.benefits
          : [{ text: "", iconName: "check" }],
    });
    setEditModalOpen(true);
  };

  const openDeleteModal = (plan) => {
    setSelectedPlan(plan);
    setDeleteModalOpen(true);
  };

  const handleBenefitChange = (index, field, value) => {
    const updated = [...formData.benefits];
    updated[index][field] = value;
    setFormData({ ...formData, benefits: updated });
  };

  const addBenefitRow = () => {
    setFormData({
      ...formData,
      benefits: [...formData.benefits, { text: "", iconName: "check" }],
    });
  };

  const removeBenefitRow = (index) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index),
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post("/plans", formData);
      if (res.status) {
        toast.success("Plan created successfully");
        setCreateModalOpen(false);
        fetchPlans();
      }
    } catch (err) {
      toast.error(err.message || "Failed to create plan");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setActionLoading(true);
    try {
      const res = await api.put(`/plans/${selectedPlan._id}`, formData);
      if (res.status) {
        toast.success("Plan updated successfully");
        setEditModalOpen(false);
        fetchPlans();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update plan");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPlan) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/plans/${selectedPlan._id}`);
      if (res.status) {
        toast.success("Plan deleted successfully");
        setDeleteModalOpen(false);
        fetchPlans();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete plan");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <span>Monetization & Plans</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure consumable refills (Mana Drops) and premium subscriptions
            (Otaku Pass)
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-rose-950/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Plan</span>
        </button>
      </div>

      {/* Plans List */}
      {loading ? (
        <LoadingSpinner text="Fetching monetization plans..." />
      ) : plans.length === 0 ? (
        <EmptyState
          icon={<Sparkles className="w-8 h-8" />}
          title="No plans configured"
          description="Create your first subscription or refill pack."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((p) => {
            const discountPercent =
              p.originalPrice > p.price
                ? Math.round(
                    ((p.originalPrice - p.price) / p.originalPrice) * 100,
                  )
                : 0;

            return (
              <div
                key={p._id}
                className="p-6 rounded-2xl bg-[#121522] border border-slate-800/90 glass-panel-hover flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-slate-100">
                          {p.name}
                        </span>
                        {p.isPremium && (
                          <Badge variant="purple" size="xs">
                            <Crown className="w-2.5 h-2.5" />
                            <span>PRO</span>
                          </Badge>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        ID: {p.planId}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                        title="Edit Plan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(p)}
                        className="p-1.5 rounded-lg border border-rose-900/50 text-rose-400 hover:text-white hover:bg-rose-600"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Price Tag */}
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">
                      ₹{p.price}
                    </span>
                    {p.originalPrice > p.price && (
                      <span className="text-sm line-through text-slate-500 font-medium">
                        ₹{p.originalPrice}
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="text-xs font-bold text-emerald-400">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mt-2">
                    {p.description || "—"}
                  </p>

                  {/* Attributes Badges */}
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Badge
                      variant={p.type === "subscription" ? "purple" : "info"}
                      size="xs"
                    >
                      {p.type === "subscription"
                        ? `Subscription (${p.durationDays}d)`
                        : "Refill Pack"}
                    </Badge>
                    {p.complimentsRefill > 0 && (
                      <Badge variant="warning" size="xs">
                        +{p.complimentsRefill} Compliments
                      </Badge>
                    )}
                  </div>

                  {/* Benefits List */}
                  {p.benefits && p.benefits.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Included Perks:
                      </div>
                      {p.benefits.map((b, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs text-slate-300"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{b.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
                  Updated{" "}
                  {new Date(p.updatedAt || p.createdAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE PLAN MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New Plan"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Plan ID (Unique slug) *
              </label>
              <input
                type="text"
                required
                value={formData.planId}
                onChange={(e) =>
                  setFormData({ ...formData, planId: e.target.value })
                }
                placeholder="e.g. mana-drop, otaku-pass"
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Plan Display Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g. Mana Drop 10x"
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Price (₹ INR) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Original Price (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.originalPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    originalPrice: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              >
                <option value="refill">Refill Pack</option>
                <option value="subscription">Subscription</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Duration (Days)
              </label>
              <input
                type="number"
                min="0"
                value={formData.durationDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    durationDays: parseInt(e.target.value, 10) || 0,
                  })
                }
                placeholder="0 for refills"
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Compliments Refill
              </label>
              <input
                type="number"
                min="0"
                value={formData.complimentsRefill}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    complimentsRefill: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Grants Premium?
              </label>
              <select
                value={formData.isPremium ? "true" : "false"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isPremium: e.target.value === "true",
                  })
                }
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              >
                <option value="false">No (Refill only)</option>
                <option value="true">Yes (Pro features)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Unlock unlimited swipes and see who liked you"
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
            />
          </div>

          {/* Benefits Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Plan Benefits / Perks
              </label>
              <button
                type="button"
                onClick={addBenefitRow}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                + Add Perk
              </button>
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {formData.benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={b.text}
                    onChange={(e) =>
                      handleBenefitChange(i, "text", e.target.value)
                    }
                    placeholder="e.g. 5 Free Compliments"
                    className="flex-1 px-3 py-1.5 bg-[#161a29] border border-slate-700 rounded-lg text-xs text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeBenefitRow(i)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
            >
              {actionLoading ? "Creating..." : "Save Plan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT PLAN MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Plan: ${selectedPlan?.name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Plan ID
              </label>
              <input
                type="text"
                required
                value={formData.planId}
                onChange={(e) =>
                  setFormData({ ...formData, planId: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Plan Display Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Price (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Original Price (₹)
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.originalPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    originalPrice: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              >
                <option value="refill">Refill Pack</option>
                <option value="subscription">Subscription</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Duration (Days)
              </label>
              <input
                type="number"
                min="0"
                value={formData.durationDays}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    durationDays: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Compliments Refill
              </label>
              <input
                type="number"
                min="0"
                value={formData.complimentsRefill}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    complimentsRefill: parseInt(e.target.value, 10) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Grants Premium?
              </label>
              <select
                value={formData.isPremium ? "true" : "false"}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isPremium: e.target.value === "true",
                  })
                }
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              >
                <option value="false">No (Refill only)</option>
                <option value="true">Yes (Pro features)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Plan Benefits
              </label>
              <button
                type="button"
                onClick={addBenefitRow}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
              >
                + Add Perk
              </button>
            </div>
            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {formData.benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={b.text}
                    onChange={(e) =>
                      handleBenefitChange(i, "text", e.target.value)
                    }
                    className="flex-1 px-3 py-1.5 bg-[#161a29] border border-slate-700 rounded-lg text-xs text-slate-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeBenefitRow(i)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
            >
              {actionLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Plan"
        message={`Are you sure you want to delete plan "${selectedPlan?.name}" (${selectedPlan?.planId})? Existing user subscriptions won't be cancelled.`}
        confirmText="Delete Plan"
        loading={actionLoading}
      />
    </div>
  );
}
