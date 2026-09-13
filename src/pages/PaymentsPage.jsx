import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import { toast } from "../store/useToastStore.js";
import Badge from "../components/common/Badge.jsx";
import Modal from "../components/common/Modal.jsx";
import Pagination from "../components/common/Pagination.jsx";
import {
  LoadingSpinner,
  EmptyState,
} from "../components/common/LoadingSpinner.jsx";
import {
  CreditCard,
  Search,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayments = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (statusFilter) params.append("status", statusFilter);
      if (search.trim()) params.append("q", search.trim());

      const res = await api.get(`/payments?${params.toString()}`);
      if (res.status && res.data) {
        setPayments(res.data.payments || []);
        setPagination(res.data.pagination || null);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPayments(1);
  };

  const openDetailModal = (payment) => {
    setSelectedPayment(payment);
    setDetailModalOpen(true);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedPayment) return;
    setActionLoading(true);
    try {
      const res = await api.put(`/payments/${selectedPayment._id}/status`, {
        status: newStatus,
      });
      if (res.status) {
        toast.success(`Payment marked as ${newStatus}`);
        setSelectedPayment((prev) => ({ ...prev, status: newStatus }));
        fetchPayments(currentPage);
      }
    } catch (err) {
      toast.error(err.message || "Failed to update payment status");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "verified":
        return (
          <Badge variant="success" size="xs">
            <CheckCircle2 className="w-2.5 h-2.5" />
            <span>Verified</span>
          </Badge>
        );
      case "created":
        return (
          <Badge variant="warning" size="xs">
            <Clock className="w-2.5 h-2.5" />
            <span>Created</span>
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="danger" size="xs">
            <AlertCircle className="w-2.5 h-2.5" />
            <span>Failed</span>
          </Badge>
        );
      default:
        return <Badge size="xs">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-emerald-400" />
          <span>Payment Transactions</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Monitor Razorpay orders, user transactions, and checkout verifications
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#121522] border border-slate-800/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payment ID, order ID, plan..."
            className="w-full pl-10 pr-4 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full sm:w-auto px-3 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500"
        >
          <option value="">All Statuses</option>
          <option value="verified">Verified Only</option>
          <option value="created">Created (Pending)</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl bg-[#121522] border border-slate-800/80 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching transactions list..." />
        ) : payments.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="w-8 h-8" />}
            title="No payment records found"
            description="No transactions match the selected filter."
          />
        ) : (
          <div className="table-container">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#161a29]/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-3">Plan</th>
                  <th className="py-3.5 px-3">Amount</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Payment ID</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {payments.map((p) => (
                  <tr
                    key={p._id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs shrink-0 overflow-hidden">
                          {p.user?.avatar ? (
                            <img
                              src={p.user.avatar}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            p.user?.fullname?.[0] || p.user?.email?.[0] || "U"
                          )}
                        </div>
                        <div className="truncate max-w-40">
                          <div className="font-semibold text-slate-200 truncate">
                            {p.user?.fullname ||
                              p.user?.username ||
                              "Anonymous"}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {p.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-3">
                      <Badge variant="purple" size="xs">
                        {p.planId}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-3 font-bold text-emerald-400 text-sm">
                      ₹{Math.round(p.amount / 100)}
                    </td>

                    <td className="py-3.5 px-3">{getStatusBadge(p.status)}</td>

                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-400 max-w-35 truncate">
                      {p.razorpay_payment_id || "—"}
                    </td>

                    <td className="py-3.5 px-3 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openDetailModal(p)}
                        className="p-1.5 rounded-lg border border-slate-700 bg-[#161a29] text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                        title="View Payment Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 pb-4">
          <Pagination
            pagination={pagination}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      </div>

      {/* PAYMENT DETAILS MODAL */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="Payment & Order Details"
      >
        {selectedPayment && (
          <div className="space-y-4">
            {/* Amount and Status Banner */}
            <div className="p-4 rounded-xl bg-[#161a29] border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider block">
                  Total Amount
                </span>
                <span className="text-2xl font-extrabold text-emerald-400">
                  ₹{Math.round(selectedPayment.amount / 100)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">
                  Status
                </span>
                {getStatusBadge(selectedPayment.status)}
              </div>
            </div>

            {/* Info rows */}
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-500">Plan Selected</span>
                <span className="font-mono text-purple-400 font-semibold">
                  {selectedPayment.planId}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-500">User Email</span>
                <span className="text-slate-200">
                  {selectedPayment.user?.email || "Unknown"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-500">Razorpay Order ID</span>
                <span className="font-mono text-slate-300">
                  {selectedPayment.razorpay_order_id}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-500">Razorpay Payment ID</span>
                <span className="font-mono text-slate-300">
                  {selectedPayment.razorpay_payment_id}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800">
                <span className="text-slate-500">Transaction Time</span>
                <span className="text-slate-300">
                  {new Date(selectedPayment.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Admin Override Status Actions */}
            <div className="pt-4 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-2">
                Override Payment Status (Admin Action):
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={
                    actionLoading || selectedPayment.status === "verified"
                  }
                  onClick={() => handleStatusUpdate("verified")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-xs font-medium hover:bg-emerald-900/80 disabled:opacity-50 transition-colors"
                >
                  Mark Verified
                </button>
                <button
                  type="button"
                  disabled={
                    actionLoading || selectedPayment.status === "failed"
                  }
                  onClick={() => handleStatusUpdate("failed")}
                  className="px-3 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs font-medium hover:bg-rose-900/80 disabled:opacity-50 transition-colors"
                >
                  Mark Failed
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
