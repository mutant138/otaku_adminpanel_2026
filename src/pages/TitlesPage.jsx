import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import { toast } from "../store/useToastStore.js";
import Tabs from "../components/common/Tabs.jsx";
import Badge from "../components/common/Badge.jsx";
import Modal from "../components/common/Modal.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import {
  LoadingSpinner,
  EmptyState,
} from "../components/common/LoadingSpinner.jsx";
import {
  Film,
  Gamepad2,
  Plus,
  Edit2,
  Trash2,
  Search,
  Star,
  Image as ImageIcon,
} from "lucide-react";

export default function TitlesPage() {
  const [activeTab, setActiveTab] = useState("anime"); // 'anime' | 'game'
  const [animeTitles, setAnimeTitles] = useState([]);
  const [gameTitles, setGameTitles] = useState([]);
  const [animeCategories, setAnimeCategories] = useState([]);
  const [gameCategories, setGameCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const initialForm = {
    title: "",
    image: "",
    categories: [],
    popularity: 200,
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [animeT, gameT, animeC, gameC] = await Promise.all([
        api.get("/titles/anime"),
        api.get("/titles/game"),
        api.get("/categories/anime"),
        api.get("/categories/game"),
      ]);

      if (animeT.status) setAnimeTitles(animeT.data || []);
      if (gameT.status) setGameTitles(gameT.data || []);
      if (animeC.status) setAnimeCategories(animeC.data || []);
      if (gameC.status) setGameCategories(gameC.data || []);
    } catch (err) {
      toast.error(err.message || "Failed to fetch titles data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const currentTitles = activeTab === "anime" ? animeTitles : gameTitles;
  const currentCategories =
    activeTab === "anime" ? animeCategories : gameCategories;

  // Filtered titles list
  const filteredTitles = currentTitles.filter((t) => {
    const matchesSearch =
      !search.trim() || t.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      !categoryFilter ||
      (t.categories &&
        t.categories.some((c) => (c._id || c) === categoryFilter));
    return matchesSearch && matchesCategory;
  });

  const openCreateModal = () => {
    setFormData(initialForm);
    setCreateModalOpen(true);
  };

  const openEditModal = (item) => {
    setSelectedTitle(item);
    setFormData({
      title: item.title || "",
      image: item.image || "",
      categories: item.categories ? item.categories.map((c) => c._id || c) : [],
      popularity: item.popularity || 100,
    });
    setEditModalOpen(true);
  };

  const openDeleteModal = (item) => {
    setSelectedTitle(item);
    setDeleteModalOpen(true);
  };

  const handleCategoryToggle = (catId) => {
    setFormData((prev) => {
      const exists = prev.categories.includes(catId);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((id) => id !== catId)
          : [...prev.categories, catId],
      };
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const endpoint = activeTab === "anime" ? "/titles/anime" : "/titles/game";
      const res = await api.post(endpoint, formData);
      if (res.status) {
        toast.success("Title added successfully");
        setCreateModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || "Failed to create title");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTitle) return;
    setActionLoading(true);
    try {
      const endpoint =
        activeTab === "anime"
          ? `/titles/anime/${selectedTitle._id}`
          : `/titles/game/${selectedTitle._id}`;
      const res = await api.put(endpoint, formData);
      if (res.status) {
        toast.success("Title updated successfully");
        setEditModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update title");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTitle) return;
    setActionLoading(true);
    try {
      const endpoint =
        activeTab === "anime"
          ? `/titles/anime/${selectedTitle._id}`
          : `/titles/game/${selectedTitle._id}`;
      const res = await api.delete(endpoint);
      if (res.status) {
        toast.success("Title deleted successfully");
        setDeleteModalOpen(false);
        fetchData();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete title");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Film className="w-6 h-6 text-rose-500" />
            <span>Title Catalog Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Maintain official anime series and video game titles for user
            favorite selections
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-rose-950/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>
            Add {activeTab === "anime" ? "Anime Title" : "Game Title"}
          </span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between">
        <Tabs
          tabs={[
            {
              key: "anime",
              label: "Anime Titles",
              icon: <Film className="w-4 h-4" />,
              count: animeTitles.length,
            },
            {
              key: "game",
              label: "Game Titles",
              icon: <Gamepad2 className="w-4 h-4" />,
              count: gameTitles.length,
            },
          ]}
          activeTab={activeTab}
          onChange={(k) => {
            setActiveTab(k);
            setCategoryFilter("");
          }}
        />
      </div>

      {/* Search & Filter Controls */}
      <div className="p-4 rounded-2xl bg-[#121522] border border-slate-800/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab === "anime" ? "anime" : "games"} by name...`}
            className="w-full pl-10 pr-4 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500"
        >
          <option value="">All Categories / Genres</option>
          {currentCategories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Titles Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching titles catalog..." />
      ) : filteredTitles.length === 0 ? (
        <EmptyState
          icon={<Film className="w-8 h-8" />}
          title="No titles match your filter"
          description="Try clearing search or add a new title."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTitles.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl bg-[#121522] border border-slate-800/80 overflow-hidden glass-panel-hover flex flex-col justify-between"
            >
              {/* Thumbnail header */}
              <div className="relative h-36 w-full bg-[#181c2c] overflow-hidden flex items-center justify-center">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center text-slate-600 gap-1">
                    <ImageIcon className="w-7 h-7" />
                    <span className="text-[10px]">No Thumbnail</span>
                  </div>
                )}

                {/* Popularity badge */}
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-300 flex items-center gap-1 border border-amber-500/20">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  <span>{item.popularity ?? 0}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 truncate">
                    {item.title}
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.categories && item.categories.length > 0 ? (
                      item.categories.map((c) => (
                        <Badge key={c._id || c} variant="purple" size="xs">
                          {c.name || "Genre"}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        Uncategorized
                      </span>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                    title="Edit Title"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openDeleteModal(item)}
                    className="p-1.5 rounded-lg border border-rose-900/50 text-rose-400 hover:text-white hover:bg-rose-600"
                    title="Delete Title"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE TITLE MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={`Add New ${activeTab === "anime" ? "Anime Title" : "Game Title"}`}
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Title Name *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder={
                activeTab === "anime"
                  ? "e.g. Solo Leveling, Attack on Titan"
                  : "e.g. Elden Ring, Valorant"
              }
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Image Thumbnail URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Popularity Rating
            </label>
            <input
              type="number"
              min="0"
              value={formData.popularity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  popularity: parseInt(e.target.value, 10) || 0,
                })
              }
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Assign Categories
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-[#161a29] border border-slate-700 rounded-xl">
              {currentCategories.map((cat) => {
                const isSelected = formData.categories.includes(cat._id);
                return (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => handleCategoryToggle(cat._id)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      isSelected
                        ? "bg-rose-600 text-white border-rose-500"
                        : "bg-[#121520] text-slate-400 border-slate-800 hover:border-slate-600"
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                );
              })}
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
              {actionLoading ? "Saving..." : "Save Title"}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT TITLE MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Title: ${selectedTitle?.title}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Title Name
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Image Thumbnail URL
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Popularity Rating
            </label>
            <input
              type="number"
              min="0"
              value={formData.popularity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  popularity: parseInt(e.target.value, 10) || 0,
                })
              }
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Assign Categories
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-[#161a29] border border-slate-700 rounded-xl">
              {currentCategories.map((cat) => {
                const isSelected = formData.categories.includes(cat._id);
                return (
                  <button
                    key={cat._id}
                    type="button"
                    onClick={() => handleCategoryToggle(cat._id)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      isSelected
                        ? "bg-rose-600 text-white border-rose-500"
                        : "bg-[#121520] text-slate-400 border-slate-800 hover:border-slate-600"
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                );
              })}
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
        title="Delete Title"
        message={`Are you sure you want to delete "${selectedTitle?.title}"? Users who favorited this title will see it removed.`}
        confirmText="Delete Title"
        loading={actionLoading}
      />
    </div>
  );
}
