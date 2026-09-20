import React, { useEffect, useState, useCallback } from "react";
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
  History,
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  LogIn,
  AlertTriangle,
  User,
  Calendar,
  Layers,
  Copy,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export default function LoginHistoryPage() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({
    totalLogins: 0,
    todayLogins: 0,
    todayUniqueUsers: 0,
    totalFailedLogins: 0,
    successRate: 100,
    methods: {},
    devices: {},
  });
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");

  // Modals
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [clearOlderModalOpen, setClearOlderModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await api.get("/login-history/stats");
      if (res.status && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Failed to load login stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Logs
  const fetchLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "15",
        });

        if (statusFilter && statusFilter !== "all") {
          queryParams.append("status", statusFilter);
        }
        if (methodFilter && methodFilter !== "all") {
          queryParams.append("loginMethod", methodFilter);
        }
        if (deviceFilter && deviceFilter !== "all") {
          queryParams.append("deviceType", deviceFilter);
        }
        if (searchQuery.trim()) {
          queryParams.append("q", searchQuery.trim());
        }

        const res = await api.get(`/login-history?${queryParams.toString()}`);
        if (res.status && res.data) {
          setLogs(res.data.logs || []);
          setPagination(res.data.pagination || null);
        }
      } catch (err) {
        toast.error(err.message || "Failed to load login history.");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, methodFilter, deviceFilter, searchQuery]
  );

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage, fetchLogs]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setMethodFilter("all");
    setDeviceFilter("all");
    setCurrentPage(1);
  };

  const handleDeleteLog = async () => {
    if (!selectedLog) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/login-history/${selectedLog._id}`);
      if (res.status) {
        toast.success("Login history record deleted.");
        setDeleteModalOpen(false);
        setSelectedLog(null);
        fetchLogs(currentPage);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete record.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearOlder = async (days = 30) => {
    setActionLoading(true);
    try {
      const res = await api.post("/login-history/clear-older", { days });
      if (res.status) {
        toast.success(res.message || "Old login records cleaned up.");
        setClearOlderModalOpen(false);
        fetchLogs(1);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || "Failed to clean up records.");
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text, label = "Copied to clipboard") => {
    navigator.clipboard.writeText(text);
    toast.success(label);
  };

  const getDeviceIcon = (deviceType) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-3.5 h-3.5 text-sky-400" />;
      case "tablet":
        return <Tablet className="w-3.5 h-3.5 text-purple-400" />;
      case "desktop":
      default:
        return <Monitor className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getMethodBadge = (method) => {
    switch (method?.toLowerCase()) {
      case "google":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <Globe className="w-3 h-3" /> Google
          </span>
        );
      case "discord":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[#5865F2]/15 text-[#8891f5] border border-[#5865F2]/30">
            <Globe className="w-3 h-3" /> Discord
          </span>
        );
      case "otp":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-3 h-3" /> OTP Verify
          </span>
        );
      case "email":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <LogIn className="w-3 h-3" /> Email
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <History className="w-6 h-6 text-rose-500" />
            <span>User Login History</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time audit log of user logins, devices, IPs, and authentication telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              fetchLogs(currentPage);
              fetchStats();
              toast.success("Telemetry updated.");
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => setClearOlderModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Prune Old Logs</span>
          </button>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Logins */}
        <div className="bg-[#121522] border border-slate-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Logins</span>
            <span className="p-2 rounded-xl bg-slate-800/60 text-slate-300">
              <History className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">
            {statsLoading ? "..." : stats.totalLogins.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
            <span>{stats.successRate}% Success Rate</span>
          </div>
        </div>

        {/* Logins Today */}
        <div className="bg-[#121522] border border-slate-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Logins Today</span>
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <LogIn className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-cyan-400 mt-2">
            {statsLoading ? "..." : stats.todayLogins.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">24h Activity</div>
        </div>

        {/* Unique Users Today */}
        <div className="bg-[#121522] border border-slate-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Active Users Today</span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <User className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-400 mt-2">
            {statsLoading ? "..." : stats.todayUniqueUsers.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Unique Accounts</div>
        </div>

        {/* Failed Logins */}
        <div className="bg-[#121522] border border-slate-800/80 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Failed Logins</span>
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-2">
            {statsLoading ? "..." : stats.totalFailedLogins.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-400/80 mt-1">Requires Attention</div>
        </div>
      </div>

      {/* ── Filters & Search Toolbar ── */}
      <div className="bg-[#121522] border border-slate-800/80 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Email, Username, IP address, OS, Browser..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500/50"
            />
          </form>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
          </div>
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500/50 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="SUCCESS">Success Only</option>
            <option value="FAILED">Failed Only</option>
          </select>

          {/* Method Filter */}
          <select
            value={methodFilter}
            onChange={(e) => {
              setMethodFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500/50 cursor-pointer"
          >
            <option value="all">All Methods</option>
            <option value="email">Email</option>
            <option value="google">Google</option>
            <option value="discord">Discord</option>
            <option value="otp">OTP Verify</option>
          </select>

          {/* Device Filter */}
          <select
            value={deviceFilter}
            onChange={(e) => {
              setDeviceFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500/50 cursor-pointer"
          >
            <option value="all">All Devices</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>

          {(searchQuery ||
            statusFilter !== "all" ||
            methodFilter !== "all" ||
            deviceFilter !== "all") && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1 transition-colors"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Content View ── */}
      {loading ? (
        <LoadingSpinner message="Fetching user login telemetry..." />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={<History className="w-10 h-10 text-slate-500" />}
          title="No Login Records Found"
          description="No user login activities match your current search or filters."
        />
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-[#121522] border border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0e1019] text-xs font-semibold text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-4 py-3.5">Method</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">IP Address</th>
                  <th className="px-4 py-3.5">Device & Browser</th>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            log.userId?.avatar ||
                            `https://api.dicebear.com/7.x/adventurer/svg?seed=${log.username || log.userIdentifier || "User"}`
                          }
                          alt="avatar"
                          className="w-8 h-8 rounded-full object-cover border border-slate-700/80 bg-slate-900"
                        />
                        <div className="min-w-0">
                          <div className="font-medium text-slate-200 truncate max-w-[160px]">
                            {log.userId?.fullname || log.username || log.userIdentifier || "Anonymous"}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                            {log.email || log.userId?.email || "No Email"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Method */}
                    <td className="px-4 py-3.5">
                      {getMethodBadge(log.loginMethod)}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      {log.status === "SUCCESS" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> Success
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-help"
                          title={log.failReason || "Failed"}
                        >
                          <XCircle className="w-3 h-3" /> Failed
                        </span>
                      )}
                    </td>

                    {/* IP Address */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => copyToClipboard(log.ipAddress, "IP copied")}
                        className="font-mono text-xs text-slate-300 hover:text-cyan-400 flex items-center gap-1.5 transition-colors group cursor-pointer"
                        title="Click to copy IP"
                      >
                        <span>{log.ipAddress}</span>
                        <Copy className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>

                    {/* Device & Browser */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(log.deviceType)}
                        <div>
                          <div className="text-xs text-slate-200 font-medium">
                            {log.browser || "Unknown"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {log.os || "Unknown"} • {log.deviceType || "desktop"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="px-4 py-3.5">
                      <div className="text-xs text-slate-300">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setDetailModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && (
            <div className="p-4 border-t border-slate-800">
              <Pagination
                pagination={pagination}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          )}
        </div>
      ) : (
        /* CARDS VIEW */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {logs.map((log) => (
              <div
                key={log._id}
                className="bg-[#121522] border border-slate-800/80 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={
                          log.userId?.avatar ||
                          `https://api.dicebear.com/7.x/adventurer/svg?seed=${log.username || log.userIdentifier || "User"}`
                        }
                        alt="avatar"
                        className="w-9 h-9 rounded-full object-cover border border-slate-700 bg-slate-900"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-100 text-sm truncate">
                          {log.userId?.fullname || log.username || log.userIdentifier || "Anonymous"}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {log.email || "No Email"}
                        </div>
                      </div>
                    </div>

                    {log.status === "SUCCESS" ? (
                      <span className="p-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span
                        className="p-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 cursor-help"
                        title={log.failReason}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-xs bg-slate-900/60 rounded-xl p-3 border border-slate-800/60">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Method</span>
                      {getMethodBadge(log.loginMethod)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">IP Address</span>
                      <span className="font-mono text-slate-300">
                        {log.ipAddress}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Device</span>
                      <span className="text-slate-300 flex items-center gap-1.5">
                        {getDeviceIcon(log.deviceType)}
                        {log.browser} on {log.os}
                      </span>
                    </div>
                    {log.failReason && (
                      <div className="pt-1 border-t border-slate-800 text-[11px] text-rose-400">
                        Reason: {log.failReason}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="text-slate-500 text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedLog(log);
                        setDetailModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLog(log);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination && (
            <div className="p-4 bg-[#121522] border border-slate-800/80 rounded-2xl">
              <Pagination
                pagination={pagination}
                onPageChange={(page) => {
                  setCurrentPage(page);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* ── DETAIL MODAL ── */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Login Event Inspector"
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-900/80 rounded-xl border border-slate-800">
              <img
                src={
                  selectedLog.userId?.avatar ||
                  `https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedLog.username || selectedLog.userIdentifier || "User"}`
                }
                alt="avatar"
                className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-950"
              />
              <div className="min-w-0">
                <div className="font-bold text-slate-100 text-base">
                  {selectedLog.userId?.fullname || selectedLog.username || selectedLog.userIdentifier || "Anonymous"}
                </div>
                <div className="text-xs text-slate-400">
                  {selectedLog.email || "No email associated"}
                </div>
                {selectedLog.userId?._id && (
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    User ID: {selectedLog.userId._id}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-1">Status</span>
                {selectedLog.status === "SUCCESS" ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Authentication Successful
                  </span>
                ) : (
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Failed
                  </span>
                )}
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-1">Auth Provider</span>
                <span className="text-slate-200 font-semibold uppercase">
                  {selectedLog.loginMethod}
                </span>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-1">Client IP</span>
                <span className="font-mono text-cyan-400 font-semibold">
                  {selectedLog.ipAddress}
                </span>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                <span className="text-slate-500 block mb-1">Device & OS</span>
                <span className="text-slate-200 font-semibold">
                  {selectedLog.browser} ({selectedLog.os})
                </span>
              </div>
            </div>

            {selectedLog.failReason && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300">
                <strong className="block text-rose-400 mb-0.5">Failure Diagnostic:</strong>
                {selectedLog.failReason}
              </div>
            )}

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="text-slate-500 block">Raw User Agent:</span>
              <p className="font-mono text-[11px] text-slate-400 break-all leading-relaxed bg-slate-950 p-2 rounded-lg border border-slate-850">
                {selectedLog.userAgent || "No user-agent string provided."}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Close Inspector
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteLog}
        loading={actionLoading}
        title="Delete Login Record"
        message="Are you sure you want to delete this login event record? This audit log will be permanently removed."
        confirmText="Delete Record"
        confirmVariant="danger"
      />

      {/* ── CLEAR OLDER RECORDS MODAL ── */}
      <ConfirmDialog
        isOpen={clearOlderModalOpen}
        onClose={() => setClearOlderModalOpen(false)}
        onConfirm={() => handleClearOlder(30)}
        loading={actionLoading}
        title="Prune Historical Records"
        message="This will delete all login logs older than 30 days to free up database space. Are you sure you want to proceed?"
        confirmText="Prune 30+ Day Logs"
        confirmVariant="danger"
      />
    </div>
  );
}
