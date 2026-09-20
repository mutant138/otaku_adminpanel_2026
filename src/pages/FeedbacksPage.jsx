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
  MessageSquareHeart,
  Search,
  Filter,
  Eye,
  Trash2,
  Mail,
  CheckCircle2,
  Clock,
  Bug,
  Lightbulb,
  Palette,
  Layers,
  HelpCircle,
  Sparkles,
  ExternalLink,
  Save,
  User,
  Calendar,
  Send,
} from "lucide-react";

export default function FeedbacksPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    resolved: 0,
    bugs: 0,
    features: 0,
  });
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("table");

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");

  // Modals state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [adminNotesDraft, setAdminNotesDraft] = useState("");
  const [statusDraft, setStatusDraft] = useState("pending");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch Feedback Stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await api.get("/feedbacks/stats");
      if (res.status && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error("Failed to load feedback stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch Feedback List with filters & pagination
  const fetchFeedbacks = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "10",
        });

        if (statusFilter && statusFilter !== "all") {
          queryParams.append("status", statusFilter);
        }
        if (tagFilter && tagFilter !== "all") {
          queryParams.append("tag", tagFilter);
        }
        if (searchQuery.trim()) {
          queryParams.append("search", searchQuery.trim());
        }

        const res = await api.get(`/feedbacks?${queryParams.toString()}`);
        if (res.status && res.data) {
          setFeedbacks(res.data.feedbacks || []);
          setPagination(res.data.pagination || null);
        }
      } catch (err) {
        toast.error(err.message || "Failed to load feedbacks");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, tagFilter, searchQuery]
  );

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchFeedbacks(currentPage);
  }, [fetchFeedbacks, currentPage]);

  // Handle Search Input with debounce or reset page
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFeedbacks(1);
  };

  const handleStatusTabChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleTagFilterChange = (e) => {
    setTagFilter(e.target.value);
    setCurrentPage(1);
  };

  // Open View & Edit Modal
  const openViewModal = (feedback) => {
    setSelectedFeedback(feedback);
    setAdminNotesDraft(feedback.adminNotes || "");
    setStatusDraft(feedback.status || "pending");
    setViewModalOpen(true);
  };

  // Open Delete Confirmation Modal
  const openDeleteModal = (feedback) => {
    setSelectedFeedback(feedback);
    setDeleteModalOpen(true);
  };

  // Save changes to Status / Admin Notes
  const handleUpdateFeedback = async () => {
    if (!selectedFeedback) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/feedbacks/${selectedFeedback._id}`, {
        status: statusDraft,
        adminNotes: adminNotesDraft,
      });

      if (res.status) {
        toast.success("Feedback status & notes updated successfully!");
        setViewModalOpen(false);
        fetchFeedbacks(currentPage);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update feedback");
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Status change from Table dropdown
  const handleQuickStatusChange = async (feedbackId, newStatus) => {
    try {
      const res = await api.patch(`/feedbacks/${feedbackId}`, {
        status: newStatus,
      });
      if (res.status) {
        toast.success(`Marked as ${newStatus}`);
        setFeedbacks((prev) =>
          prev.map((f) => (f._id === feedbackId ? { ...f, status: newStatus } : f))
        );
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    }
  };

  // Delete Feedback
  const handleDeleteConfirm = async () => {
    if (!selectedFeedback) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/feedbacks/${selectedFeedback._id}`);
      if (res.status) {
        toast.success("Feedback log deleted successfully.");
        setDeleteModalOpen(false);
        fetchFeedbacks(currentPage);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete feedback");
    } finally {
      setActionLoading(false);
    }
  };

  // Tag Helpers
  const getTagBadge = (tag) => {
    switch (tag) {
      case "bug":
        return (
          <Badge variant="danger" size="xs">
            <Bug className="w-3 h-3 text-rose-400" />
            Bug Report
          </Badge>
        );
      case "feature":
        return (
          <Badge variant="purple" size="xs">
            <Lightbulb className="w-3 h-3 text-purple-400" />
            Feature Request
          </Badge>
        );
      case "ux":
        return (
          <Badge variant="info" size="xs">
            <Palette className="w-3 h-3 text-sky-400" />
            UI / UX
          </Badge>
        );
      case "content":
        return (
          <Badge variant="warning" size="xs">
            <Layers className="w-3 h-3 text-amber-400" />
            Content / Titles
          </Badge>
        );
      default:
        return (
          <Badge variant="default" size="xs">
            <HelpCircle className="w-3 h-3 text-slate-400" />
            General Feedback
          </Badge>
        );
    }
  };

  // Status Helpers
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="warning" size="xs">
            <Clock className="w-3 h-3 text-amber-400" />
            Pending Triage
          </Badge>
        );
      case "reviewed":
        return (
          <Badge variant="info" size="xs">
            <Eye className="w-3 h-3 text-sky-400" />
            Reviewed
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="success" size="xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Resolved
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="default" size="xs">
            Archived
          </Badge>
        );
      default:
        return (
          <Badge variant="default" size="xs">
            {status}
          </Badge>
        );
    }
  };

  const statusTabs = [
    { id: "all", label: "All Logs", count: stats.total },
    { id: "pending", label: "Pending", count: stats.pending },
    { id: "reviewed", label: "Reviewed", count: stats.reviewed },
    { id: "resolved", label: "Resolved", count: stats.resolved },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
            <span>User Feedbacks & Telemetry</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review community ideas, feature requests, bug telemetry, and direct user thoughts
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-[#121522] border border-slate-800/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Feedbacks</span>
            <MessageSquareHeart className="w-4 h-4 text-slate-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-100">
            {statsLoading ? "..." : stats.total}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">All transmissions logged</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121522] border border-amber-900/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300">Pending Review</span>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">
            {statsLoading ? "..." : stats.pending}
          </div>
          <div className="mt-1 text-[11px] text-amber-400/60">Awaiting triage</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121522] border border-rose-900/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300">Bug Reports</span>
            <Bug className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-400">
            {statsLoading ? "..." : stats.bugs}
          </div>
          <div className="mt-1 text-[11px] text-rose-400/60">Issues & anomalies</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121522] border border-purple-900/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-300">Feature Ideas</span>
            <Lightbulb className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-400">
            {statsLoading ? "..." : stats.features}
          </div>
          <div className="mt-1 text-[11px] text-purple-400/60">Community suggestions</div>
        </div>

        <div className="p-4 rounded-xl bg-[#121522] border border-emerald-900/30 shadow-xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-300">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">
            {statsLoading ? "..." : stats.resolved}
          </div>
          <div className="mt-1 text-[11px] text-emerald-400/60">Addressed & closed</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 bg-[#121522] p-3 rounded-2xl border border-slate-800">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {statusTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleStatusTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? "bg-rose-600 text-white shadow-md shadow-rose-950/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  statusFilter === tab.id
                    ? "bg-rose-800/80 text-rose-100"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search, Tag Dropdown & View Mode */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Tag Selector */}
          <div className="relative">
            <select
              value={tagFilter}
              onChange={handleTagFilterChange}
              className="px-3 py-1.5 pr-8 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:border-rose-500 appearance-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="bug">Bug Reports</option>
              <option value="feature">Feature Requests</option>
              <option value="ux">UI / UX</option>
              <option value="content">Content / Anime / Games</option>
              <option value="general">General</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search user, email, text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-rose-500"
            />
          </form>

          {/* View Toggle (Table / Grid) */}
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="h-64 flex items-center justify-center bg-[#121522] rounded-2xl border border-slate-800">
          <LoadingSpinner text="Decrypting feedback transmissions..." />
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-[#121522] rounded-2xl border border-slate-800 p-8">
          <EmptyState
            icon={<MessageSquareHeart className="w-8 h-8 text-slate-600" />}
            title="No Feedbacks Found"
            description="No user feedback entries matched your current filter criteria."
          />
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-[#121522] rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Submitter</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Feedback Transmission</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Submitted</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {feedbacks.map((fb) => (
                  <tr
                    key={fb._id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Submitter Info */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs shrink-0 overflow-hidden">
                          {fb.user?.avatar ? (
                            <img
                              src={fb.user.avatar}
                              alt={fb.username}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            fb.username?.[0]?.toUpperCase() || "U"
                          )}
                        </div>
                        <div className="truncate max-w-[150px]">
                          <div className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                            <span>{fb.username}</span>
                            {fb.user?.isPremium && (
                              <span className="text-[9px] font-extrabold uppercase px-1 bg-amber-500/20 text-amber-300 rounded">
                                VIP
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {fb.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Category Tag */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {getTagBadge(fb.tag)}
                    </td>

                    {/* Feedback Preview */}
                    <td className="px-4 py-3.5 max-w-xs">
                      <div
                        onClick={() => openViewModal(fb)}
                        className="cursor-pointer hover:text-rose-300 transition-colors"
                      >
                        <p className="line-clamp-2 text-slate-200 leading-relaxed font-sans">
                          {fb.feedback}
                        </p>
                        {fb.adminNotes && (
                          <div className="mt-1 text-[10px] text-amber-400/80 flex items-center gap-1">
                            <span className="font-semibold">Note:</span>
                            <span className="truncate">{fb.adminNotes}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status Select */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <select
                        value={fb.status || "pending"}
                        onChange={(e) =>
                          handleQuickStatusChange(fb._id, e.target.value)
                        }
                        className={`text-[11px] font-semibold px-2 py-1 rounded-lg border focus:outline-hidden cursor-pointer ${
                          fb.status === "resolved"
                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/40"
                            : fb.status === "reviewed"
                            ? "bg-sky-950/40 text-sky-400 border-sky-800/40"
                            : fb.status === "archived"
                            ? "bg-slate-900 text-slate-400 border-slate-800"
                            : "bg-amber-950/40 text-amber-400 border-amber-800/40"
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                        <option value="archived">Archived</option>
                      </select>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-[11px] text-slate-400">
                      {new Date(fb.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      <div className="text-[10px] text-slate-500">
                        {new Date(fb.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openViewModal(fb)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
                          title="View Details & Notes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`mailto:${fb.email}?subject=Re: Your OtakuDuo Feedback&body=Hi ${fb.username},%0D%0A%0D%0AThank you for your feedback on OtakuDuo!%0D%0A%0D%0A`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-950/30 transition-colors"
                          title="Reply via Email"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => openDeleteModal(fb)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                          title="Delete Feedback"
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
        </div>
      ) : (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {feedbacks.map((fb) => (
            <div
              key={fb._id}
              className="bg-[#121522] rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between hover:border-slate-700 transition-all group shadow-xs"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs shrink-0 overflow-hidden">
                      {fb.user?.avatar ? (
                        <img
                          src={fb.user.avatar}
                          alt={fb.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        fb.username?.[0]?.toUpperCase() || "U"
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-200">
                        {fb.username}
                      </div>
                      <div className="text-[11px] text-slate-500">{fb.email}</div>
                    </div>
                  </div>
                  {getTagBadge(fb.tag)}
                </div>

                {/* Feedback Body */}
                <div className="mt-3.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto">
                  {fb.feedback}
                </div>

                {/* Admin notes if any */}
                {fb.adminNotes && (
                  <div className="mt-2.5 p-2 rounded-lg bg-amber-950/20 border border-amber-800/30 text-[11px] text-amber-300">
                    <span className="font-bold">Internal Note: </span>
                    {fb.adminNotes}
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3.5 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  {new Date(fb.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={fb.status || "pending"}
                    onChange={(e) =>
                      handleQuickStatusChange(fb._id, e.target.value)
                    }
                    className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 focus:outline-hidden"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                    <option value="archived">Archived</option>
                  </select>

                  <button
                    onClick={() => openViewModal(fb)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                    title="View & Edit"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <a
                    href={`mailto:${fb.email}?subject=Re: Your OtakuDuo Feedback`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-950/30"
                    title="Email User"
                  >
                    <Mail className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => openDeleteModal(fb)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(p) => setCurrentPage(p)}
        />
      )}

      {/* View & Edit Feedback Modal */}
      {selectedFeedback && (
        <Modal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="Feedback Transmission Details"
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5">
            {/* Submitter Metadata Bar */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-600/20 border border-rose-500/30 flex items-center justify-center font-bold text-rose-300 text-sm shrink-0 overflow-hidden">
                  {selectedFeedback.user?.avatar ? (
                    <img
                      src={selectedFeedback.user.avatar}
                      alt={selectedFeedback.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selectedFeedback.username?.[0]?.toUpperCase() || "U"
                  )}
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                    <span>{selectedFeedback.username}</span>
                    {getTagBadge(selectedFeedback.tag)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {selectedFeedback.email}
                  </div>
                </div>
              </div>

              <div className="text-right text-xs text-slate-400">
                <div className="flex items-center gap-1.5 justify-end">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>
                    {new Date(selectedFeedback.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Source: {selectedFeedback.source || "OtakuDuo Web"}
                </div>
              </div>
            </div>

            {/* Transmission Body */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                User Transmission Log
              </label>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-sm text-slate-200 leading-relaxed font-sans whitespace-pre-wrap select-text">
                {selectedFeedback.feedback}
              </div>
            </div>

            {/* Status Selector & Admin Notes */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Triage Status
                  </label>
                  <select
                    value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-hidden focus:border-rose-500"
                  >
                    <option value="pending">Pending Triage</option>
                    <option value="reviewed">Reviewed by Team</option>
                    <option value="resolved">Resolved / Actioned</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <a
                    href={`mailto:${selectedFeedback.email}?subject=Re: Your OtakuDuo Feedback&body=Hi ${selectedFeedback.username},%0D%0A%0D%0AThank you for contacting OtakuDuo telemetry regarding your feedback:%0D%0A"${selectedFeedback.feedback}"%0D%0A%0D%0A`}
                    className="w-full px-4 py-2 rounded-xl bg-sky-600/20 border border-sky-500/30 text-sky-300 hover:bg-sky-600/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Reply to {selectedFeedback.username}</span>
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Internal Team Notes
                </label>
                <textarea
                  rows={3}
                  value={adminNotesDraft}
                  onChange={(e) => setAdminNotesDraft(e.target.value)}
                  placeholder="Add internal investigation notes, engineering bug links, or action summary..."
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-rose-500 resize-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setViewModalOpen(false);
                  openDeleteModal(selectedFeedback);
                }}
                className="px-3 py-2 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-950/30 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Log</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateFeedback}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-linear-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white shadow-md shadow-rose-950/40 flex items-center gap-1.5 disabled:opacity-50 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{actionLoading ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Feedback Log"
        message={`Are you sure you want to delete the feedback transmission from "${selectedFeedback?.username}"? This action cannot be undone.`}
        confirmText={actionLoading ? "Deleting..." : "Delete Permanently"}
        variant="danger"
      />
    </div>
  );
}
