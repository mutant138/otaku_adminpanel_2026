import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import { toast } from "../store/useToastStore.js";
import Badge from "../components/common/Badge.jsx";
import Modal from "../components/common/Modal.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import Pagination from "../components/common/Pagination.jsx";
import { LoadingSpinner, EmptyState } from "../components/common/LoadingSpinner.jsx";
import { Flag, Ban, Check, AlertTriangle, Eye, ShieldAlert } from "lucide-react";

export default function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [dismissModalOpen, setDismissModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/reports?page=${page}&limit=10`);
      if (res.status && res.data) {
        setReports(res.data.reports || []);
        setPagination(res.data.pagination || null);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(currentPage);
  }, [currentPage]);

  const openViewModal = (report) => {
    setSelectedReport(report);
    setViewModalOpen(true);
  };

  const openBanModal = (report) => {
    setSelectedReport(report);
    setBanModalOpen(true);
  };

  const openDismissModal = (report) => {
    setSelectedReport(report);
    setDismissModalOpen(true);
  };

  const handleBanConfirm = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/reports/${selectedReport._id}/ban-user`);
      if (res.status) {
        toast.success("Reported user banned and removed from database");
        setBanModalOpen(false);
        setViewModalOpen(false);
        fetchReports(currentPage);
      }
    } catch (err) {
      toast.error(err.message || "Failed to ban reported user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDismissConfirm = async () => {
    if (!selectedReport) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/reports/${selectedReport._id}`);
      if (res.status) {
        toast.success("Report dismissed");
        setDismissModalOpen(false);
        setViewModalOpen(false);
        fetchReports(currentPage);
      }
    } catch (err) {
      toast.error(err.message || "Failed to dismiss report");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <Flag className="w-6 h-6 text-amber-500" />
          <span>Moderation & Reports</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review community flagged behavior, investigate incident reports, and take disciplinary action
        </p>
      </div>

      {/* Reports Table Card */}
      <div className="rounded-2xl bg-[#121522] border border-slate-800/80 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching community reports..." />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={<Flag className="w-8 h-8 text-emerald-400" />}
            title="Clean moderation queue!"
            description="There are currently no outstanding user reports pending review."
          />
        ) : (
          <div className="table-container">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#161a29]/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Accused / Target</th>
                  <th className="py-3.5 px-4">Reporter</th>
                  <th className="py-3.5 px-4">Description Snippet</th>
                  <th className="py-3.5 px-4">Date Filed</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {reports.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/20 transition-colors">
                    {/* Reason */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge variant="danger" size="xs">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{r.reason}</span>
                      </Badge>
                    </td>

                    {/* Reported User */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-rose-950/80 border border-rose-800/40 flex items-center justify-center font-bold text-rose-300 text-xs shrink-0 overflow-hidden">
                          {r.reportedUser?.avatar ? (
                            <img
                              src={r.reportedUser.avatar}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            "T"
                          )}
                        </div>
                        <div className="truncate max-w-[140px]">
                          <div className="font-semibold text-slate-200 truncate">
                            {r.reportedUser?.fullname || r.reportedUser?.username || "Account Deleted"}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {r.reportedUser?.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Reporter */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-slate-300 text-xs shrink-0 overflow-hidden">
                          {r.reporter?.avatar ? (
                            <img
                              src={r.reporter.avatar}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            "R"
                          )}
                        </div>
                        <div className="truncate max-w-[140px]">
                          <div className="font-semibold text-slate-300 truncate">
                            {r.reporter?.fullname || r.reporter?.username || "Unknown"}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {r.reporter?.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Snippet */}
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <span className="text-slate-400 truncate block text-[11px]">
                        {r.details || "No additional description provided."}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      {new Date(r.createdAt).toLocaleDateString()}{" "}
                      <span className="text-slate-500">
                        {new Date(r.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Elaborately Icon */}
                        <button
                          onClick={() => openViewModal(r)}
                          className="p-1.5 rounded-lg border border-slate-700 text-sky-400 hover:text-white hover:bg-sky-950/60 transition-colors"
                          title="View Report Elaborately"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Ban Action Icon */}
                        <button
                          onClick={() => openBanModal(r)}
                          disabled={!r.reportedUser}
                          className="p-1.5 rounded-lg border border-rose-900/50 text-rose-400 hover:text-white hover:bg-rose-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          title="Ban Reported User"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>

                        {/* Dismiss Action Icon */}
                        <button
                          onClick={() => openDismissModal(r)}
                          className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Dismiss Report"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="px-4 pb-4 border-t border-slate-800/60 pt-3">
          <Pagination pagination={pagination} onPageChange={(p) => setCurrentPage(p)} />
        </div>
      </div>

      {/* ELABORATE VIEW MODAL */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Report Details & Investigation"
        maxWidth="max-w-2xl"
      >
        {selectedReport && (
          <div className="space-y-5">
            {/* Header info banner */}
            <div className="p-4 rounded-xl bg-[#161a29] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">Incident Category:</span>
                    <Badge variant="danger" size="xs">
                      {selectedReport.reason}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    Report ID: <span className="font-mono text-slate-400">{selectedReport._id}</span>
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                  Timestamp
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {new Date(selectedReport.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Elaborate Description */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Incident Report & Reporter Statement:
              </label>
              <div className="p-3.5 rounded-xl bg-[#0f121d] border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans min-h-20 whitespace-pre-wrap">
                {selectedReport.details || "No additional written details were attached to this report."}
              </div>
            </div>

            {/* Users Involved Details Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Accused User Profile */}
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/50 space-y-3">
                <div className="flex items-center justify-between border-b border-rose-900/30 pb-2">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                    Target / Accused User
                  </span>
                  {selectedReport.reportedUser && (
                    <Badge variant="danger" size="xs">
                      Reported
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-rose-900/60 border border-rose-700/50 flex items-center justify-center font-bold text-rose-200 text-sm overflow-hidden shrink-0">
                    {selectedReport.reportedUser?.avatar ? (
                      <img
                        src={selectedReport.reportedUser.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      "T"
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-sm font-semibold text-slate-100 truncate">
                      {selectedReport.reportedUser?.fullname ||
                        selectedReport.reportedUser?.username ||
                        "Account Deleted"}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {selectedReport.reportedUser?.email || "No email available"}
                    </div>
                    {selectedReport.reportedUser?.username && (
                      <div className="text-[11px] text-purple-400 font-mono">
                        @{selectedReport.reportedUser.username}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-mono pt-1">
                  ID: {selectedReport.reportedUser?._id || "N/A"}
                </div>
              </div>

              {/* Reporter Profile */}
              <div className="p-4 rounded-xl bg-[#141724] border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Filing Reporter
                  </span>
                  <Badge variant="info" size="xs">
                    Reporter
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-sm overflow-hidden shrink-0">
                    {selectedReport.reporter?.avatar ? (
                      <img
                        src={selectedReport.reporter.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      "R"
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-sm font-semibold text-slate-100 truncate">
                      {selectedReport.reporter?.fullname ||
                        selectedReport.reporter?.username ||
                        "Unknown"}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {selectedReport.reporter?.email || "No email"}
                    </div>
                    {selectedReport.reporter?.username && (
                      <div className="text-[11px] text-purple-400 font-mono">
                        @{selectedReport.reporter.username}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 font-mono pt-1">
                  ID: {selectedReport.reporter?._id || "N/A"}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setViewModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-xl transition-colors"
              >
                Close Window
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => openDismissModal(selectedReport)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Dismiss Report</span>
                </button>

                <button
                  type="button"
                  onClick={() => openBanModal(selectedReport)}
                  disabled={!selectedReport.reportedUser}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Ban User</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* BAN USER CONFIRM */}
      <ConfirmDialog
        isOpen={banModalOpen}
        onClose={() => setBanModalOpen(false)}
        onConfirm={handleBanConfirm}
        title="Ban & Remove Reported User"
        message={`Are you sure you want to ban and permanently delete user "${selectedReport?.reportedUser?.fullname || selectedReport?.reportedUser?.email}"? This action will immediately terminate their account and remove all their swipes.`}
        confirmText="Ban User"
        confirmVariant="danger"
        loading={actionLoading}
      />

      {/* DISMISS REPORT CONFIRM */}
      <ConfirmDialog
        isOpen={dismissModalOpen}
        onClose={() => setDismissModalOpen(false)}
        onConfirm={handleDismissConfirm}
        title="Dismiss Report"
        message="Are you sure you want to dismiss this report? The report entry will be removed from the moderation queue."
        confirmText="Dismiss Report"
        confirmVariant="primary"
        loading={actionLoading}
      />
    </div>
  );
}
