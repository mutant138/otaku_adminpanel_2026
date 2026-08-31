import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import { toast } from "../store/useToastStore.js";
import Badge from "../components/common/Badge.jsx";
import Modal from "../components/common/Modal.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import Pagination from "../components/common/Pagination.jsx";
import { LoadingSpinner, EmptyState } from "../components/common/LoadingSpinner.jsx";
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Crown,
  Bot,
  CheckCircle2,
  Shield,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");
  const [premiumFilter, setPremiumFilter] = useState("");
  const [botFilter, setBotFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const initialForm = {
    fullname: "",
    email: "",
    username: "",
    password: "",
    role: "user",
    isVerified: true,
    isOnboarded: true,
    isBot: false,
    isPremium: false,
    complimentsBalance: 1,
    superLikesBalance: 1,
    extraSwipesBalance: 0,
    bio: "",
    location: "",
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (search.trim()) params.append("q", search.trim());
      if (roleFilter) params.append("role", roleFilter);
      if (verifiedFilter) params.append("isVerified", verifiedFilter);
      if (premiumFilter) params.append("isPremium", premiumFilter);
      if (botFilter) params.append("isBot", botFilter);

      const res = await api.get(`/users?${params.toString()}`);
      if (res.status && res.data) {
        setUsers(res.data.users || []);
        setPagination(res.data.pagination || null);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, roleFilter, verifiedFilter, premiumFilter, botFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers(1);
  };

  const openCreateModal = () => {
    setFormData(initialForm);
    setCreateModalOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      fullname: user.fullname || "",
      email: user.email || "",
      username: user.username || "",
      password: "", // empty means keep existing
      role: user.role || "user",
      isVerified: Boolean(user.isVerified),
      isOnboarded: Boolean(user.isOnboarded),
      isBot: Boolean(user.isBot),
      isPremium: Boolean(user.isPremium),
      complimentsBalance: user.complimentsBalance ?? 1,
      superLikesBalance: user.superLikesBalance ?? 1,
      extraSwipesBalance: user.extraSwipesBalance ?? 0,
      bio: user.bio || "",
      location: user.location || "",
    });
    setEditModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post("/users", formData);
      if (res.status) {
        toast.success("User created successfully");
        setCreateModalOpen(false);
        fetchUsers(currentPage);
      }
    } catch (err) {
      toast.error(err.message || "Failed to create user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;

      const res = await api.put(`/users/${selectedUser.id || selectedUser._id}`, payload);
      if (res.status) {
        toast.success("User updated successfully");
        setEditModalOpen(false);
        fetchUsers(currentPage);
      }
    } catch (err) {
      toast.error(err.message || "Failed to update user");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/users/${selectedUser.id || selectedUser._id}`);
      if (res.status) {
        toast.success("User deleted successfully");
        setDeleteModalOpen(false);
        fetchUsers(currentPage);
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete user");
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
            <Users className="w-6 h-6 text-rose-500" />
            <span>User Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search, inspect, update balances, and moderate user accounts
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-rose-950/40 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New User</span>
        </button>
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
            placeholder="Search name, username, email..."
            className="w-full pl-10 pr-4 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
          />
        </form>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500"
          >
            <option value="">All Roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>

          <select
            value={verifiedFilter}
            onChange={(e) => {
              setVerifiedFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500"
          >
            <option value="">Verified: All</option>
            <option value="true">Verified</option>
            <option value="false">Unverified</option>
          </select>

          <select
            value={premiumFilter}
            onChange={(e) => {
              setPremiumFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500"
          >
            <option value="">Premium: All</option>
            <option value="true">Premium Only</option>
            <option value="false">Free Only</option>
          </select>

          <select
            value={botFilter}
            onChange={(e) => {
              setBotFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 bg-[#161a29] border border-slate-700/60 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500"
          >
            <option value="">Bots: All</option>
            <option value="true">Bots Only</option>
            <option value="false">Humans Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-[#121522] border border-slate-800/80 overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching user records..." />
        ) : users.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title="No users found"
            description="Try changing your search keywords or filter settings."
          />
        ) : (
          <div className="table-container">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#161a29]/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-3">Role</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Balances</th>
                  <th className="py-3.5 px-3">Joined</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {users.map((u) => (
                  <tr key={u.id || u._id} className="hover:bg-slate-800/30 transition-colors">
                    {/* User info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs shrink-0 overflow-hidden border border-slate-700/50">
                          {u.avatar ? (
                            <img src={u.avatar} alt="" className="w-full h-full object-cover" />
                          ) : (
                            u.fullname?.[0] || u.username?.[0] || "U"
                          )}
                        </div>
                        <div className="truncate max-w-[180px] sm:max-w-[220px]">
                          <div className="font-semibold text-slate-100 truncate">
                            {u.fullname || u.username || "Anonymous"}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">{u.email}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            ID: {u.userId || u.id?.substring(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-3">
                      {u.role === "admin" ? (
                        <Badge variant="primary" size="xs">
                          <Shield className="w-2.5 h-2.5" />
                          <span>Admin</span>
                        </Badge>
                      ) : (
                        <Badge variant="default" size="xs">
                          User
                        </Badge>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {u.isVerified ? (
                          <Badge variant="success" size="xs" title="Verified">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Verified</span>
                          </Badge>
                        ) : (
                          <Badge variant="warning" size="xs">
                            Unverified
                          </Badge>
                        )}
                        {u.isPremium && (
                          <Badge variant="purple" size="xs">
                            <Crown className="w-2.5 h-2.5" />
                            <span>PRO</span>
                          </Badge>
                        )}
                        {u.isBot && (
                          <Badge variant="info" size="xs">
                            <Bot className="w-2.5 h-2.5" />
                            <span>Bot</span>
                          </Badge>
                        )}
                      </div>
                    </td>

                    {/* Balances */}
                    <td className="py-3.5 px-3 text-[11px] text-slate-300">
                      <div className="space-y-0.5">
                        <div>Compliments: <span className="font-semibold text-rose-400">{u.complimentsBalance ?? 0}</span></div>
                        <div>Super Likes: <span className="font-semibold text-amber-400">{u.superLikesBalance ?? 0}</span></div>
                        <div>Extra Swipes: <span className="font-semibold text-sky-400">{u.extraSwipesBalance ?? 0}</span></div>
                      </div>
                    </td>

                    {/* Joined */}
                    <td className="py-3.5 px-3 text-[11px] text-slate-400 whitespace-nowrap">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg border border-slate-700 bg-[#161a29] text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(u)}
                          className="p-1.5 rounded-lg border border-rose-900/50 bg-rose-950/30 text-rose-400 hover:text-white hover:bg-rose-600 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        <div className="px-4 pb-4">
          <Pagination
            pagination={pagination}
            onPageChange={(newPage) => setCurrentPage(newPage)}
          />
        </div>
      </div>

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create New User Account"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                placeholder="Tanjiro Kamado"
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Username (Optional)</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Leave blank to autogenerate"
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Set user password"
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Verified</label>
              <select
                value={formData.isVerified ? "true" : "false"}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.value === "true" })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Premium</label>
              <select
                value={formData.isPremium ? "true" : "false"}
                onChange={(e) => setFormData({ ...formData, isPremium: e.target.value === "true" })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Is Bot</label>
              <select
                value={formData.isBot ? "true" : "false"}
                onChange={(e) => setFormData({ ...formData, isBot: e.target.value === "true" })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              >
                <option value="false">Human</option>
                <option value="true">Bot</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Compliments</label>
              <input
                type="number"
                min="0"
                value={formData.complimentsBalance}
                onChange={(e) => setFormData({ ...formData, complimentsBalance: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Super Likes</label>
              <input
                type="number"
                min="0"
                value={formData.superLikesBalance}
                onChange={(e) => setFormData({ ...formData, superLikesBalance: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Extra Swipes</label>
              <input
                type="number"
                min="0"
                value={formData.extraSwipesBalance}
                onChange={(e) => setFormData({ ...formData, extraSwipesBalance: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
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
              {actionLoading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT USER MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit User: ${selectedUser?.fullname || selectedUser?.username || "User"}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                New Password (leave blank to retain)
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Verified</label>
              <select
                value={formData.isVerified ? "true" : "false"}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.value === "true" })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Premium</label>
              <select
                value={formData.isPremium ? "true" : "false"}
                onChange={(e) => setFormData({ ...formData, isPremium: e.target.value === "true" })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              >
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Is Bot</label>
              <select
                value={formData.isBot ? "true" : "false"}
                onChange={(e) => setFormData({ ...formData, isBot: e.target.value === "true" })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              >
                <option value="false">Human</option>
                <option value="true">Bot</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Compliments</label>
              <input
                type="number"
                min="0"
                value={formData.complimentsBalance}
                onChange={(e) => setFormData({ ...formData, complimentsBalance: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Super Likes</label>
              <input
                type="number"
                min="0"
                value={formData.superLikesBalance}
                onChange={(e) => setFormData({ ...formData, superLikesBalance: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Extra Swipes</label>
              <input
                type="number"
                min="0"
                value={formData.extraSwipesBalance}
                onChange={(e) => setFormData({ ...formData, extraSwipesBalance: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
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

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete User Account"
        message={`Are you sure you want to permanently delete user "${selectedUser?.fullname || selectedUser?.username}" (${selectedUser?.email})? All associated swipes and reports will be deleted.`}
        confirmText="Permanently Delete"
        loading={actionLoading}
      />
    </div>
  );
}
