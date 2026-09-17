import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import { toast } from "../store/useToastStore.js";
import Modal from "../components/common/Modal.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import ViewToggle from "../components/common/ViewToggle.jsx";
import {
  LoadingSpinner,
  EmptyState,
} from "../components/common/LoadingSpinner.jsx";
import { Mail, Plus, Edit2, Trash2, Send, Eye, Code } from "lucide-react";

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [testEmailModalOpen, setTestEmailModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Preview tab within editor ('code' | 'preview')
  const [editorMode, setEditorMode] = useState("code");

  // Form states
  const initialForm = {
    identifier: "",
    subject: "",
    content: `<div style="font-family: sans-serif; padding: 20px;">
  <h2>Hello {{fullname}},</h2>
  <p>Here is your verification code:</p>
  <h1 style="color: #ff4757;">{{otp}}</h1>
</div>`,
  };
  const [formData, setFormData] = useState(initialForm);
  const [testEmailTo, setTestEmailTo] = useState("");

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await api.get("/emails");
      if (res.status && res.data) {
        setTemplates(res.data);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load email templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openCreateModal = () => {
    setFormData(initialForm);
    setEditorMode("code");
    setCreateModalOpen(true);
  };

  const openEditModal = (tpl) => {
    setSelectedTemplate(tpl);
    setFormData({
      identifier: tpl.identifier || "",
      subject: tpl.subject || "",
      content: tpl.content || "",
    });
    setEditorMode("code");
    setEditModalOpen(true);
  };

  const openTestEmailModal = (tpl) => {
    setSelectedTemplate(tpl);
    setTestEmailTo("");
    setTestEmailModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.post("/emails", formData);
      if (res.status) {
        toast.success("Email template created");
        setCreateModalOpen(false);
        fetchTemplates();
      }
    } catch (err) {
      toast.error(err.message || "Failed to create template");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    setActionLoading(true);
    try {
      const res = await api.put(`/emails/${selectedTemplate._id}`, formData);
      if (res.status) {
        toast.success("Email template updated");
        setEditModalOpen(false);
        fetchTemplates();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update template");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTemplate) return;
    setActionLoading(true);
    try {
      const res = await api.delete(`/emails/${selectedTemplate._id}`);
      if (res.status) {
        toast.success("Template deleted successfully");
        setDeleteModalOpen(false);
        fetchTemplates();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete template");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!selectedTemplate || !testEmailTo) return;
    setActionLoading(true);
    try {
      const res = await api.post("/emails/test", {
        to: testEmailTo,
        templateIdentifier: selectedTemplate.identifier,
        replacements: { fullname: "Admin Tester", otp: "884422" },
      });
      if (res.status) {
        toast.success(`Test email sent to ${testEmailTo}`);
        setTestEmailModalOpen(false);
      }
    } catch (err) {
      toast.error(err.message || "Failed to send test email");
    } finally {
      setActionLoading(false);
    }
  };

  // Replace placeholders for preview
  const getPreviewHtml = (rawHtml) => {
    return (rawHtml || "")
      .replace(/{{fullname}}/g, "Tanjiro Kamado")
      .replace(/{{otp}}/g, "749201");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
            <Mail className="w-6 h-6 text-sky-400" />
            <span>Email Templates Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Design HTML templates for verification OTPs, welcome emails, and
            password resets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ViewToggle view={viewMode} onViewChange={setViewMode} />
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-linear-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-lg shadow-rose-950/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Email Template</span>
          </button>
        </div>
      </div>

      {/* Templates List */}
      {loading ? (
        <div className="rounded-2xl bg-[#121522] border border-slate-800/80 p-8">
          <LoadingSpinner text="Fetching email templates..." />
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-2xl bg-[#121522] border border-slate-800/80 p-8">
          <EmptyState
            icon={<Mail className="w-8 h-8" />}
            title="No email templates found"
            description="Create your first transactional template."
          />
        </div>
      ) : viewMode === "table" ? (
        <div className="rounded-2xl bg-[#121522] border border-slate-800/80 overflow-hidden">
          <div className="table-container">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#161a29]/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Identifier / Slug</th>
                  <th className="py-3.5 px-4">Subject</th>
                  <th className="py-3.5 px-4">Variables</th>
                  <th className="py-3.5 px-4">Last Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {templates.map((tpl) => (
                  <tr
                    key={tpl._id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono text-purple-400 font-semibold">
                      #{tpl.identifier}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {tpl.subject}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {"{{fullname}}, {{otp}}"}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(
                        tpl.updatedAt || tpl.createdAt,
                      ).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openTestEmailModal(tpl)}
                          className="p-1.5 rounded-lg border border-slate-700 bg-[#161a29] text-sky-400 hover:text-white hover:bg-sky-950/50 transition-colors"
                          title="Send Test Email"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(tpl)}
                          className="p-1.5 rounded-lg border border-slate-700 bg-[#161a29] text-slate-300 hover:text-white hover:border-slate-600 transition-colors"
                          title="Edit Template"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTemplate(tpl);
                            setDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-rose-900/50 bg-[#161a29] text-rose-400 hover:text-white hover:bg-rose-600 transition-colors"
                          title="Delete Template"
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {templates.map((tpl) => (
            <div
              key={tpl._id}
              className="p-5 rounded-2xl bg-[#121522] border border-slate-800/80 glass-panel-hover flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-mono text-purple-400 font-bold block mb-1">
                      #{tpl.identifier}
                    </span>
                    <h3 className="text-base font-semibold text-slate-100">
                      {tpl.subject}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openTestEmailModal(tpl)}
                      className="p-1.5 rounded-lg border border-slate-700 text-sky-400 hover:text-white hover:bg-sky-950/50"
                      title="Send Test Email"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(tpl)}
                      className="p-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                      title="Edit Template"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTemplate(tpl);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg border border-rose-900/50 text-rose-400 hover:text-white hover:bg-rose-600"
                      title="Delete Template"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* HTML content snippet */}
                <div className="mt-4 p-3 rounded-xl bg-[#161a29] border border-slate-800 font-mono text-[11px] text-slate-400 max-h-24 overflow-hidden text-ellipsis line-clamp-3">
                  {tpl.content}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Variables: {"{{fullname}}, {{otp}}"}</span>
                <span>
                  {new Date(
                    tpl.updatedAt || tpl.createdAt,
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE TEMPLATE MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Email Template"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Identifier (slug) *
              </label>
              <input
                type="text"
                required
                value={formData.identifier}
                onChange={(e) =>
                  setFormData({ ...formData, identifier: e.target.value })
                }
                placeholder="e.g. otp-verification"
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subject *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="Verify your OtakuDuo account"
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                HTML Template Body *
              </label>
              <div className="flex items-center gap-1 bg-[#161a29] p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditorMode("code")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 ${
                    editorMode === "code"
                      ? "bg-rose-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Code className="w-3 h-3" />
                  <span>Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode("preview")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 ${
                    editorMode === "preview"
                      ? "bg-rose-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {editorMode === "code" ? (
              <textarea
                rows="8"
                required
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full p-3 bg-[#161a29] border border-slate-700 rounded-xl text-xs font-mono text-slate-100"
              />
            ) : (
              <div
                className="w-full h-52 p-4 bg-white text-black rounded-xl overflow-y-auto"
                dangerouslySetInnerHTML={{
                  __html: getPreviewHtml(formData.content),
                }}
              />
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              Supports mustache tags: {"{{fullname}}, {{otp}}"}
            </p>
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
              {actionLoading ? "Saving..." : "Save Template"}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT TEMPLATE MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Template: ${selectedTemplate?.identifier}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Identifier
              </label>
              <input
                type="text"
                required
                value={formData.identifier}
                onChange={(e) =>
                  setFormData({ ...formData, identifier: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                HTML Template Body
              </label>
              <div className="flex items-center gap-1 bg-[#161a29] p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditorMode("code")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 ${
                    editorMode === "code"
                      ? "bg-rose-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Code className="w-3 h-3" />
                  <span>Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode("preview")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 ${
                    editorMode === "preview"
                      ? "bg-rose-600 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
              </div>
            </div>

            {editorMode === "code" ? (
              <textarea
                rows="8"
                required
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full p-3 bg-[#161a29] border border-slate-700 rounded-xl text-xs font-mono text-slate-100"
              />
            ) : (
              <div
                className="w-full h-52 p-4 bg-white text-black rounded-xl overflow-y-auto"
                dangerouslySetInnerHTML={{
                  __html: getPreviewHtml(formData.content),
                }}
              />
            )}
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

      {/* TEST EMAIL MODAL */}
      <Modal
        isOpen={testEmailModalOpen}
        onClose={() => setTestEmailModalOpen(false)}
        title={`Send Test Email: ${selectedTemplate?.identifier}`}
      >
        <form onSubmit={handleSendTestEmail} className="space-y-4">
          <p className="text-xs text-slate-400">
            Send a sample email to verify your SMTP server delivery with mock
            replacements.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Recipient Email Address *
            </label>
            <input
              type="email"
              required
              value={testEmailTo}
              onChange={(e) => setTestEmailTo(e.target.value)}
              placeholder="your-email@example.com"
              className="w-full px-3 py-2 bg-[#161a29] border border-slate-700 rounded-xl text-xs text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setTestEmailModalOpen(false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {actionLoading ? "Sending..." : "Dispatch Test Email"}
              </span>
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRM */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Email Template"
        message={`Are you sure you want to delete template "${selectedTemplate?.identifier}"?`}
        confirmText="Delete Template"
        loading={actionLoading}
      />
    </div>
  );
}
