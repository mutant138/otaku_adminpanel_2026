import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import { toast } from "../store/useToastStore.js";
import Tabs from "../components/common/Tabs.jsx";
import Modal from "../components/common/Modal.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import { LoadingSpinner, EmptyState } from "../components/common/LoadingSpinner.jsx";
import { Tags, Plus, Edit2, Trash2, Film, Gamepad2 } from "lucide-react";

export default function CategoriesPage() {
  const [activeTab, setActiveTab] = useState("anime"); // 'anime' | 'game'
  const [animeCategories, setAnimeCategories] = useState([]);
  const [gameCategories, setGameCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const initialForm = {
    name: "",
    slug: "",
    description: "",
    icon: "🔥",
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const [animeRes, gameRes] = await Promise.all([
        api.get("/categories/anime"),
        api.get("/categories/game"),
      ]);
      if (animeRes.status) setAnimeCategories(animeRes.data || []);
      if (gameRes.status) setGameCategories(gameRes.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleNameChange = (name) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-");
    setFormData((prev) => ({ ...prev, name, slug: prev.slug === "" || prev.slug === slug.slice(0, -1) ? slug : prev.slug }));
  };

  const openCreateModal = () => {
    setFormData({
      ...initialForm,
      icon: activeTab === "anime" ? "🔥" : "⚔️",
    });
    setCreateModalOpen(true);
  };

  const openEditModal = (cat) => {
    setSelectedCategory(cat);
    setFormData({
      name: cat.name || "",
      slug: cat.slug || "",
      description: cat.description || "",
      icon: cat.icon || "",
    });
    setEditModalOpen(true);
  };

  const openDeleteModal = (cat) => {
    setSelectedCategory(cat);
    setDeleteModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const endpoint = activeTab === "anime" ? "/categories/anime" : "/categories/game";
      const res = await api.post(endpoint, formData);
      if (res.status) {
        toast.success("Category created successfully");
        setCreateModalOpen(false);
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.message || "Failed to create category");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setActionLoading(true);
    try {
      const endpoint =
        activeTab === "anime"
          ? `/categories/anime/${selectedCategory._id}`
          : `/categories/game/${selectedCategory._id}`;
      const res = await api.put(endpoint, formData);
      if (res.status) {
        toast.success("Category updated successfully");
        setEditModalOpen(false);
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update category");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    setActionLoading(true);
    try {
      const endpoint =
        activeTab === "anime"
          ? `/categories/anime/${selectedCategory._id}`
          : `/categories/game/${selectedCategory._id}`;
      const res = await api.delete(endpoint);
      if (res.status) {
        toast.success("Category deleted successfully");
        setDeleteModalOpen(false);
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete category");
    } finally {
      setActionLoading(false);
    }
  };

  const currentList = activeTab === "anime" ? animeCategories : gameCategories;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Tags className="w-6 h-6 text-purple-500" />
            <span>Category & Genre Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure Anime genres and Game categories for user profiling and matchmaking
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-rose-950/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add {activeTab === "anime" ? "Anime Genre" : "Game Category"}</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between">
        <Tabs
          tabs={[
            {
              key: "anime",
              label: "Anime Genres",
              icon: <Film className="w-4 h-4" />,
              count: animeCategories.length,
            },
            {
              key: "game",
              label: "Game Categories",
              icon: <Gamepad2 className="w-4 h-4" />,
              count: gameCategories.length,
            },
          ]}
          activeTab={activeTab}
          onChange={(key) => setActiveTab(key)}
        />
      </div>

      {/* Categories Grid */}
      {loading ? (
        <LoadingSpinner text="Loading categories..." />
      ) : currentList.length === 0 ? (
        <EmptyState
          icon={<Tags className="w-8 h-8" />}
          title={`No ${activeTab === "anime" ? "Anime Genres" : "Game Categories"} yet`}
          description="Create your first genre to organize titles."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentList.map((cat) => (
            <div
              key={cat._id}
              className="p-5 rounded-2xl bg-[#121522] border border-slate-800/80 glass-panel-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-[#181d2e] border border-slate-800 shrink-0">
                      {cat.icon || "🏷️"}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100">{cat.name}</h3>
                      <span className="text-[11px] text-purple-400 font-mono">#{cat.slug}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(cat)}
                      className="p-1.5 rounded-lg border border-rose-900/50 text-rose-400 hover:text-white hover:bg-rose-600"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                  {cat.description || "No description provided."}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Created {new Date(cat.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={`Add ${activeTab === "anime" ? "Anime Genre" : "Game Category"}`}
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Shonen, Battle Royale"
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Emoji Icon</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="🔥, ⚔️, 🌸"
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100 text-center text-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Slug *</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="shonen"
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Action-packed anime with high-stakes training and adventures..."
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
            />
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
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
            >
              {actionLoading ? "Creating..." : "Save Category"}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT CATEGORY MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Category: ${selectedCategory?.name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Emoji Icon</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100 text-center text-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Slug</label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
            />
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
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
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
        title="Delete Category"
        message={`Are you sure you want to delete category "${selectedCategory?.name}"? It will be removed from all associated titles.`}
        confirmText="Delete Category"
        loading={actionLoading}
      />
    </div>
  );
}
