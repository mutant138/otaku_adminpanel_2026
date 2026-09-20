import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import Badge from "../components/common/Badge.jsx";
import { LoadingSpinner } from "../components/common/LoadingSpinner.jsx";
import {
  Users,
  Film,
  Gamepad2,
  IndianRupee,
  Flag,
  Crown,
  Bot,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Brain,
  Swords,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/stats");
      if (res.status && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading)
    return <LoadingSpinner size="lg" text="Loading dashboard analytics..." />;

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-sm">
        {error}
      </div>
    );
  }

  const {
    counts = {},
    recentUsers = [],
    recentPayments = [],
    recentReports = [],
  } = data || {};

  const statCards = [
    {
      title: "Total Registered Users",
      value: counts.totalUsers ?? 0,
      icon: <Users className="w-5 h-5 text-rose-400" />,
      sub: `${counts.premiumUsers ?? 0} Premium`,
      border: "border-rose-500/20",
    },
    {
      title: "Verified Revenue",
      value: `₹${(counts.totalRevenueInr ?? 0).toLocaleString()}`,
      icon: <IndianRupee className="w-5 h-5 text-emerald-400" />,
      sub: `${counts.totalPaymentsCount ?? 0} Total Orders`,
      border: "border-emerald-500/20",
    },
    {
      title: "Quiz Questions",
      value: counts.totalQuizQuestions ?? 0,
      icon: <Brain className="w-5 h-5 text-amber-400" />,
      sub: "Anime & Gaming Trivia",
      border: "border-amber-500/20",
    },
    {
      title: "PvP Arena Duels",
      value: counts.totalDuels ?? 0,
      icon: <Swords className="w-5 h-5 text-rose-400" />,
      sub: "Live Battles Logged",
      border: "border-rose-500/20",
    },
    {
      title: "Anime Titles",
      value: counts.animeTitles ?? 0,
      icon: <Film className="w-5 h-5 text-purple-400" />,
      sub: `${counts.animeCategories ?? 0} Genres`,
      border: "border-purple-500/20",
    },
    {
      title: "Game Titles",
      value: counts.gameTitles ?? 0,
      icon: <Gamepad2 className="w-5 h-5 text-sky-400" />,
      sub: `${counts.gameCategories ?? 0} Categories`,
      border: "border-sky-500/20",
    },
    {
      title: "Active Reports",
      value: counts.pendingReports ?? 0,
      icon: <Flag className="w-5 h-5 text-amber-400" />,
      sub: "Needs Moderation",
      border: "border-amber-500/20",
    },
    {
      title: "Automated Bots",
      value: counts.botUsers ?? 0,
      icon: <Bot className="w-5 h-5 text-indigo-400" />,
      sub: "Matchmaking Helpers",
      border: "border-indigo-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time analytics and platform operational controls
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/users"
            className="flex items-center gap-1.5 px-3 py-2 bg-[#161a29] hover:bg-slate-800 text-xs font-medium text-slate-200 border border-slate-700/60 rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-rose-400" />
            <span>Add User</span>
          </Link>
          <Link
            to="/titles"
            className="flex items-center gap-1.5 px-3 py-2 bg-linear-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-xs font-semibold text-white rounded-xl shadow-md shadow-rose-950/40 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Title</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-[#121522] border ${card.border} glass-panel-hover flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className="p-2 rounded-xl bg-[#181d2e]">{card.icon}</div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-extrabold text-slate-100 tracking-tight">
                {card.value}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                <span>{card.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two Column Layout for Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="p-5 rounded-2xl bg-[#121522] border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Recent Users
            </h3>
            <Link
              to="/users"
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentUsers.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No users registered yet.
              </p>
            ) : (
              recentUsers.map((u) => (
                <div
                  key={u.id || u._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#161a29] border border-slate-800/60"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs shrink-0 overflow-hidden">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        u.fullname?.[0] || u.username?.[0] || "U"
                      )}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1.5">
                        <span>{u.fullname || u.username}</span>
                        {u.isPremium && (
                          <Badge variant="purple" size="xs">
                            <Crown className="w-2.5 h-2.5" />
                            <span>PRO</span>
                          </Badge>
                        )}
                        {u.role === "admin" && (
                          <Badge variant="primary" size="xs">
                            ADMIN
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {u.email}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 shrink-0">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="p-5 rounded-2xl bg-[#121522] border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200">
              Recent Payments
            </h3>
            <Link
              to="/payments"
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentPayments.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">
                No payments recorded yet.
              </p>
            ) : (
              recentPayments.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#161a29] border border-slate-800/60"
                >
                  <div className="overflow-hidden">
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {p.user?.fullname || p.user?.email || "User"}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">
                      Plan: {p.planId}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-emerald-400">
                      ₹{Math.round(p.amount / 100)}
                    </div>
                    <Badge
                      variant={p.status === "verified" ? "success" : "warning"}
                      size="xs"
                      className="mt-0.5"
                    >
                      {p.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Reports section */}
      {recentReports.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#121522] border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Flag className="w-4 h-4 text-amber-400" />
              <span>Pending Moderation Reports</span>
            </h3>
            <Link
              to="/reports"
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentReports.map((r) => (
              <div
                key={r._id}
                className="p-3.5 rounded-xl bg-[#161a29] border border-slate-800/70 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-rose-400">
                      {r.reason}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] line-clamp-2">
                    {r.details || "No details provided"}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Reported: {r.reportedUser?.fullname || "User"}</span>
                  <Link
                    to="/reports"
                    className="text-rose-400 font-semibold hover:underline"
                  >
                    Action
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
