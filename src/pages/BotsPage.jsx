import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import { toast } from "../store/useToastStore.js";
import Badge from "../components/common/Badge.jsx";
import Modal from "../components/common/Modal.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import Pagination from "../components/common/Pagination.jsx";
import ViewToggle from "../components/common/ViewToggle.jsx";
import {
  LoadingSpinner,
  EmptyState,
} from "../components/common/LoadingSpinner.jsx";
import {
  Bot,
  Search,
  Plus,
  Edit2,
  Trash2,
  Crown,
  Sparkles,
  Zap,
  CheckCircle2,
  Shield,
  Dices,
  Swords,
  Users,
  HeartHandshake,
} from "lucide-react";

// Anime & Gaming word pools for instant random bot generator
const ANIME_NAMES = [
  "Ren_Amamiya", "Mai_Sakurajima", "Aria_Valkyrie", "Rin_Tohsaka", "Gojo_Satoru",
  "Sukuna_Ryomen", "Zoro_Roronoa", "Levi_Ackerman", "Tanjiro_Kamado", "Nezuko_Kamado",
  "Eren_Yeager", "Mikasa_Ackerman", "Sung_Jinwoo", "Denji_Chainsaw", "Megumi_Fushiguro",
  "Kakashi_Hatake", "Luffy_StrawHat", "Goku_Saiyan", "Killua_Zoldyck", "Kurisu_Makise"
];

export default function BotsPage() {
  const [bots, setBots] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("cards");

  // Search & Filter
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const initialForm = {
    fullname: "",
    username: "",
    email: "",
    password: "BotInternalPassword#2026",
    role: "user",
    isBot: true,
    isVerified: true,
    isOnboarded: true,
    isPremium: false,
    synergy: 50,
    complimentsBalance: 99,
    superLikesBalance: 99,
    extraSwipesBalance: 99,
    gender: "Other",
    age: 20,
    bio: "Autonomous AI Persona ready for trivia duels and matchmaking exploration.",
    location: "Neo Tokyo, Global Server",
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchBots = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        isBot: "true", // Strictly bot accounts only
      });
      if (search.trim()) params.append("q", search.trim());

      const res = await api.get(`/users?${params.toString()}`);
      if (res.status && res.data) {
        setBots(res.data.users || []);
        setPagination(res.data.pagination || null);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load bots list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchBots(1);
  };

  const handleRandomizePersona = () => {
    const randomName = ANIME_NAMES[Math.floor(Math.random() * ANIME_NAMES.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    const cleanTag = `${randomName.replace(/\s+/g, "_")}_${randomNum}`;
    const cleanEmail = `bot_${cleanTag.toLowerCase()}@otakuduo.internal`;
    const formattedFullname = randomName.replace(/_/g, " ");

    setFormData((prev) => ({
      ...prev,
      fullname: formattedFullname,
      username: cleanTag,
      email: cleanEmail,
      synergy: Math.floor(30 + Math.random() * 120),
    }));
  };

  const openCreateModal = () => {
    const randomName = ANIME_NAMES[Math.floor(Math.random() * ANIME_NAMES.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    const cleanTag = `${randomName.replace(/\s+/g, "_")}_${randomNum}`;
    const cleanEmail = `bot_${cleanTag.toLowerCase()}@otakuduo.internal`;

    setFormData({
      ...initialForm,
      fullname: randomName.replace(/_/g, " "),
      username: cleanTag,
      email: cleanEmail,
      synergy: Math.floor(40 + Math.random() * 80),
    });
    setCreateModalOpen(true);
  };

  const openEditModal = (bot) => {
    setSelectedBot(bot);
    setFormData({
      fullname: bot.fullname || "",
      username: bot.username || "",
      email: bot.email || "",
      password: "", // empty keeps existing
      role: bot.role || "user",
      isBot: true,
      isVerified: Boolean(bot.isVerified),
      isOnboarded: Boolean(bot.isOnboarded),
      isPremium: Boolean(bot.isPremium),
      synergy: bot.synergy ?? 0,
      complimentsBalance: bot.complimentsBalance ?? 99,
      superLikesBalance: bot.superLikesBalance ?? 99,
      extraSwipesBalance: bot.extraSwipesBalance ?? 99,
      gender: bot.gender || "Other",
      age: bot.age || 20,
      bio: bot.bio || "",
      location: bot.location || "",
    });
    setEditModalOpen(true);
  };

  const openDeleteModal = (bot) => {
    setSelectedBot(bot);
    setDeleteModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post("/users", {
        ...formData,
        isBot: true,
      });
      if (res.status) {
        toast.success("Bot persona deployed successfully!");
        setCreateModalOpen(false);
        fetchBots(currentPage);
      }
    } catch (err) {
      toast.error(err.message || "Failed to create bot persona");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBot) return;
    setActionLoading(true);
    try {
      const payload = { ...formData, isBot: true };
      if (!payload.password) delete payload.password;

      const res = await api.put(
        `/users/${selectedBot.id || selectedBot._id}`,
        payload,
      );
      if (res.status) {
        toast.success("Bot persona updated successfully!");
        setEditModalOpen(false);
        fetchBots(currentPage);
      }
    } catch (err) {
      toast.error(err.message || "Failed to update bot");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBot) return;
    setActionLoading(true);
    try {
      const res = await api.delete(
        `/users/${selectedBot.id || selectedBot._id}`,
      );
      if (res.status) {
        toast.success("Bot removed successfully");
        setDeleteModalOpen(false);
        fetchBots(currentPage);
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete bot");
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
            <Bot className="w-6 h-6 text-indigo-400" />
            <span>AI & System Bot Personas</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dedicated repository for autonomous matchmaking companions, duel simulators, and system bots
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/users"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-[#161a29] hover:bg-slate-800 text-slate-200 border border-slate-700/60 text-xs sm:text-sm font-medium rounded-xl transition-all"
          >
            <Users className="w-4 h-4 text-rose-400" />
            <span>Real Users List</span>
          </a>

          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-indigo-950/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Deploy New Bot</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#121522] border border-slate-800/80 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bot persona, username, internal ID..."
            className="w-full pl-10 pr-4 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </form>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            Total Bots: <strong className="text-indigo-400">{pagination?.total ?? bots.length}</strong>
          </span>
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
        </div>
      </div>

      {/* Bots Content */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading AI bot personas..." />
      ) : bots.length === 0 ? (
        <EmptyState
          title="No bot personas found"
          description="Deploy automated bot accounts for instant PvP duels and matchmaking balance."
          actionText="Deploy First Bot"
          onAction={openCreateModal}
        />
      ) : viewMode === "cards" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {bots.map((bot) => {
            const avatarUrl = bot.avatar?.startsWith("http")
              ? bot.avatar
              : bot.profilePics?.[0]
              ? bot.profilePics[0]
              : `https://api.dicebear.com/7.x/adventurer/svg?seed=${bot.username || "Bot"}`;

            return (
              <div
                key={bot.id || bot._id}
                className="p-5 rounded-2xl bg-[#121522] border border-slate-800/80 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-4 relative group"
              >
                {/* Top Badge Tag */}
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                    <Bot className="w-3 h-3" /> BOT PERSONA
                  </span>
                  <div className="flex items-center gap-1.5">
                    {bot.isVerified && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        ✓ Verified
                      </span>
                    )}
                    {bot.isPremium && (
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5" /> Pass
                      </span>
                    )}
                  </div>
                </div>

                {/* Avatar & Identifiers */}
                <div className="flex items-center gap-3.5">
                  <div className="relative w-13 h-13 rounded-2xl overflow-hidden border-2 border-indigo-500/40 bg-[#0c0e17] shrink-0 shadow-md shadow-indigo-950/40">
                    <img
                      src={avatarUrl}
                      alt={bot.username}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-slate-100 truncate flex items-center gap-1">
                      {bot.fullname || bot.username}
                    </h3>
                    <p className="text-xs text-indigo-400 font-mono truncate">
                      @{bot.username}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                      {bot.email}
                    </p>
                  </div>
                </div>

                {/* Stats & Telemetry */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#0c0e17] border border-slate-800 text-xs">
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">
                      Synergy Rating
                    </span>
                    <span className="font-bold text-amber-400 flex items-center gap-1 mt-0.5">
                      <Zap className="w-3 h-3" /> {bot.synergy || 0} PTS
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">
                      Duel Rank
                    </span>
                    <span className="font-bold text-rose-400 flex items-center gap-1 mt-0.5">
                      <Swords className="w-3 h-3" /> Lv. {Math.floor((bot.synergy || 0) / 30) + 1}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-slate-400 line-clamp-2 italic">
                  "{bot.bio || "Active simulated persona for matchmaking and PvP duels."}"
                </p>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => openEditModal(bot)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-indigo-600 hover:text-white text-slate-300 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Edit Bot"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => openDeleteModal(bot)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-600 hover:text-white text-rose-400 text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    title="Delete Bot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl bg-[#121522] border border-slate-800/80 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-[#161a29] text-slate-400 font-medium uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Bot Persona</th>
                <th className="py-3 px-4">Internal ID / Email</th>
                <th className="py-3 px-4">Synergy</th>
                <th className="py-3 px-4">Duel Status</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {bots.map((bot) => {
                const avatarUrl = bot.avatar?.startsWith("http")
                  ? bot.avatar
                  : bot.profilePics?.[0]
                  ? bot.profilePics[0]
                  : `https://api.dicebear.com/7.x/adventurer/svg?seed=${bot.username || "Bot"}`;

                return (
                  <tr key={bot.id || bot._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={avatarUrl}
                          alt=""
                          className="w-9 h-9 rounded-xl border border-indigo-500/40 object-cover shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-100 flex items-center gap-1.5">
                            <span>{bot.fullname || bot.username}</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                              BOT
                            </span>
                          </div>
                          <div className="text-[11px] text-indigo-400 font-mono">@{bot.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      <div>{bot.email}</div>
                      <div className="text-[10px] text-slate-500">{bot.userId || "—"}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-amber-400 font-mono">
                      ⚡ {bot.synergy || 0}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono text-rose-300 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded">
                        <Swords className="w-3 h-3" /> Lv. {Math.floor((bot.synergy || 0) / 30) + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 truncate max-w-[150px]">
                      {bot.location || "Neo Tokyo"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(bot)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                          title="Edit Bot"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(bot)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Bot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* ─── CREATE BOT MODAL ─── */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Deploy AI / System Bot Persona"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs">
            <span className="text-indigo-200">
              Need a quick iconic anime/game persona?
            </span>
            <button
              type="button"
              onClick={handleRandomizePersona}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold cursor-pointer text-xs"
            >
              <Dices className="w-3.5 h-3.5" /> Random Persona
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Full Character / Bot Name
              </label>
              <input
                type="text"
                required
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                placeholder="e.g. Ren Amamiya"
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Bot Username Tag
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="e.g. Ren_Amamiya_701"
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Internal Bot Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="bot_name@otakuduo.internal"
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Synergy Points
              </label>
              <input
                type="number"
                value={formData.synergy}
                onChange={(e) => setFormData({ ...formData, synergy: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Bot Persona Bio / Catchphrase
            </label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Location / Realm</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-4 pt-5">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Verified</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                  className="rounded border-slate-700 text-amber-600 focus:ring-amber-500"
                />
                <span>Otaku Pass</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-lg shadow-indigo-950/40"
            >
              {actionLoading ? "Deploying..." : "Deploy Persona"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── EDIT BOT MODAL ─── */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Bot Persona"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Full Character Name
              </label>
              <input
                type="text"
                required
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Username Tag
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Synergy Rating
              </label>
              <input
                type="number"
                value={formData.synergy}
                onChange={(e) => setFormData({ ...formData, synergy: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Bot Bio
            </label>
            <textarea
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-4 pt-5">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isVerified}
                  onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Verified</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                  className="rounded border-slate-700 text-amber-600 focus:ring-amber-500"
                />
                <span>Pass</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-lg shadow-indigo-950/40"
            >
              {actionLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ─── DELETE CONFIRM MODAL ─── */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Bot Persona"
        message={`Are you sure you want to permanently delete the bot persona "${selectedBot?.fullname || selectedBot?.username}"? This action cannot be undone.`}
        confirmText="Delete Persona"
        type="danger"
        loading={actionLoading}
      />
    </div>
  );
}
