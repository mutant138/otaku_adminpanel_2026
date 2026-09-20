import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import { toast } from "../store/useToastStore.js";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import Pagination from "../components/common/Pagination.jsx";
import { LoadingSpinner, EmptyState } from "../components/common/LoadingSpinner.jsx";
import {
  Swords,
  Trophy,
  Crown,
  Zap,
  Trash2,
  Calendar,
  Bot,
  User,
  Activity,
  Flame,
} from "lucide-react";

export default function DuelsPage() {
  const [duels, setDuels] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Filters
  const [selectedOutcome, setSelectedOutcome] = useState("all"); // 'all' | 'victory' | 'draw'

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDuel, setSelectedDuel] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get("/duels/stats");
      if (res.status) setStats(res.data);
    } catch (err) {
      console.error("Duel stats load error:", err);
    }
  };

  const fetchDuels = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 15);
      if (selectedOutcome !== "all") params.append("outcome", selectedOutcome);

      const res = await api.get(`/duels?${params.toString()}`);
      if (res.status) {
        setDuels(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load duels history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchDuels(1);
  }, [selectedOutcome]);

  const handlePageChange = (newPage) => {
    fetchDuels(newPage);
  };

  const openDeleteModal = (duel) => {
    setSelectedDuel(duel);
    setDeleteModalOpen(true);
  };

  const handleDeleteSubmit = async () => {
    setActionLoading(true);
    try {
      const res = await api.delete(`/duels/${selectedDuel._id}`);
      if (res.status) {
        toast.success("Duel battle log deleted.");
        setDeleteModalOpen(false);
        fetchDuels(pagination.page);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete duel log.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Swords className="w-7 h-7 text-rose-500" />
            PvP Arena & Combat Logs
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor real-time 1v1 PvP combat battles, scores, win-rates, and Quantum Synergy rewards.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#121522] border border-slate-800 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Matches</div>
              <div className="text-xl font-bold text-slate-100">{stats.totalMatches?.toLocaleString() || 0}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#121522] border border-slate-800 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Today's Duels</div>
              <div className="text-xl font-bold text-slate-100">{stats.todayMatches?.toLocaleString() || 0}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#121522] border border-slate-800 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Decisive Victories</div>
              <div className="text-xl font-bold text-slate-100">{stats.victoryMatches?.toLocaleString() || 0}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#121522] border border-slate-800 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Honorable Draws</div>
              <div className="text-xl font-bold text-slate-100">{stats.drawMatches?.toLocaleString() || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Top Leaders Row */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Matches Table */}
        <div className="flex-1 space-y-4 min-w-0">
          {/* Outcome Filter */}
          <div className="p-4 rounded-2xl bg-[#121522] border border-slate-800 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Filter Match Outcomes
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedOutcome("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedOutcome === "all"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                All Duels
              </button>
              <button
                onClick={() => setSelectedOutcome("victory")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedOutcome === "victory"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                Victories
              </button>
              <button
                onClick={() => setSelectedOutcome("draw")}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedOutcome === "draw"
                    ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
                    : "bg-slate-900 text-slate-400 hover:text-white"
                }`}
              >
                Draws
              </button>
            </div>
          </div>

          {/* Duel Records List */}
          <div className="rounded-2xl bg-[#121522] border border-slate-800 overflow-hidden shadow-xl">
            {loading ? (
              <div className="py-20">
                <LoadingSpinner text="Loading combat logs..." />
              </div>
            ) : duels.length === 0 ? (
              <div className="py-16">
                <EmptyState
                  title="No duel records found"
                  description="Players will appear here once they complete PvP Arena battles."
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {duels.map((d) => {
                  const p1 = d.player1 || { username: "Duelist 1" };
                  const p2 = d.player2 || { username: "Duelist 2" };
                  const isDraw = d.isDraw;
                  const winner = d.winner;
                  const p1Winner = !isDraw && winner?._id === p1._id;
                  const p2Winner = !isDraw && winner?._id === p2._id;

                  return (
                    <div
                      key={d._id}
                      className="p-5 hover:bg-slate-900/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      {/* Combatants Row */}
                      <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
                        {/* Player 1 */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <img
                            src={p1.profilePics?.[0] || p1.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                            alt={p1.username}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-100 truncate">
                                {p1.username}
                              </span>
                              {p1.isBot && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                  BOT
                                </span>
                              )}
                              {p1Winner && (
                                <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 font-semibold">
                              {d.player1Score || 0} pts
                            </div>
                          </div>
                        </div>

                        {/* VS Divider & Score */}
                        <div className="flex flex-col items-center shrink-0 px-3">
                          <span className="text-[10px] font-black tracking-widest text-slate-500 font-space uppercase">
                            VS
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase mt-1 ${
                              isDraw
                                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            }`}
                          >
                            {isDraw ? "DRAW" : "VICTORY"}
                          </span>
                        </div>

                        {/* Player 2 */}
                        <div className="flex items-center justify-end gap-2.5 min-w-0 flex-1 text-right">
                          <div className="min-w-0">
                            <div className="flex items-center justify-end gap-1.5">
                              {p2Winner && (
                                <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              )}
                              {p2.isBot && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                                  BOT
                                </span>
                              )}
                              <span className="text-xs font-bold text-slate-100 truncate">
                                {p2.username}
                              </span>
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 font-semibold">
                              {d.player2Score || 0} pts
                            </div>
                          </div>
                          <img
                            src={p2.profilePics?.[0] || p2.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"}
                            alt={p2.username}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                        </div>
                      </div>

                      {/* Meta and Synergy Log */}
                      <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 border-t md:border-t-0 border-slate-800/80 pt-3 md:pt-0">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
                          <Zap className="w-3.5 h-3.5" />
                          <span>{isDraw ? "+5 Synergy each" : "+10 Synergy to Winner"}</span>
                        </div>

                        <div className="text-[11px] text-slate-500 font-mono">
                          {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "Recent"}
                        </div>

                        <button
                          onClick={() => openDeleteModal(d)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            <div className="p-4 bg-[#0e1019] border-t border-slate-800">
              <Pagination pagination={pagination} onPageChange={handlePageChange} />
            </div>
          </div>
        </div>

        {/* Sidebar: Top Synergy Duelists */}
        {stats?.topSynergyUsers && (
          <div className="w-full lg:w-72 space-y-4 shrink-0">
            <div className="p-5 rounded-2xl bg-[#121522] border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-100 border-b border-slate-800 pb-3">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Top Synergy Duelists</span>
              </div>

              <div className="space-y-3">
                {stats.topSynergyUsers.map((u, idx) => (
                  <div key={u._id} className="flex items-center justify-between gap-3 p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 text-center font-mono font-bold text-xs text-amber-400">
                        #{idx + 1}
                      </span>
                      <img
                        src={u.profilePics?.[0] || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                        alt={u.username}
                        className="w-7 h-7 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {u.username}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {u.email}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-mono font-bold text-cyan-400 shrink-0 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {u.synergy || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteSubmit}
        title="Delete Duel Record"
        message="Are you sure you want to delete this combat record? This will permanently remove this battle from the logs."
        confirmText={actionLoading ? "Deleting..." : "Delete Record"}
        danger
      />
    </div>
  );
}
