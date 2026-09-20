import React, { useEffect, useState } from "react";
import api from "../services/api.js";
import { toast } from "../store/useToastStore.js";
import Modal from "../components/common/Modal.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import Pagination from "../components/common/Pagination.jsx";
import { LoadingSpinner, EmptyState } from "../components/common/LoadingSpinner.jsx";
import {
  HelpCircle,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Brain,
  Gamepad2,
  Film,
  Sparkles,
  Layers,
} from "lucide-react";

export default function QuizQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all"); // 'all' | 'anime' | 'game'
  const [selectedDifficulty, setSelectedDifficulty] = useState("all"); // 'all' | 'easy' | 'medium' | 'hard'

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const initialForm = {
    question: "",
    type: "anime",
    title: "",
    difficulty: "medium",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchStats = async () => {
    try {
      const res = await api.get("/quiz-questions/stats");
      if (res.status) setStats(res.data);
    } catch (err) {
      console.error("Stats load error:", err);
    }
  };

  const fetchQuestions = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 15);
      if (searchQuery.trim()) params.append("q", searchQuery.trim());
      if (selectedType !== "all") params.append("type", selectedType);
      if (selectedDifficulty !== "all") params.append("difficulty", selectedDifficulty);

      const res = await api.get(`/quiz-questions?${params.toString()}`);
      if (res.status) {
        setQuestions(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load quiz questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuestions(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedType, selectedDifficulty]);

  const handlePageChange = (newPage) => {
    fetchQuestions(newPage);
  };

  const openCreateModal = () => {
    setFormData(initialForm);
    setCreateModalOpen(true);
  };

  const openEditModal = (q) => {
    setSelectedQuestion(q);
    setFormData({
      question: q.question || "",
      type: q.type || "anime",
      title: q.title || "",
      difficulty: q.difficulty || "medium",
      options: Array.isArray(q.options) && q.options.length === 4 ? [...q.options] : ["", "", "", ""],
      correctAnswer: q.correctAnswer || "",
      explanation: q.explanation || "",
    });
    setEditModalOpen(true);
  };

  const openDeleteModal = (q) => {
    setSelectedQuestion(q);
    setDeleteModalOpen(true);
  };

  const handleOptionChange = (index, value) => {
    const updated = [...formData.options];
    const prevVal = updated[index];
    updated[index] = value;
    
    // Auto update correct answer if it was previously matching this option
    let updatedCorrect = formData.correctAnswer;
    if (updatedCorrect === prevVal) {
      updatedCorrect = value;
    }

    setFormData((prev) => ({
      ...prev,
      options: updated,
      correctAnswer: updatedCorrect,
    }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim()) return toast.error("Question text is required.");
    if (formData.options.some((opt) => !opt.trim())) {
      return toast.error("All 4 options must be filled.");
    }
    if (!formData.correctAnswer.trim()) {
      return toast.error("Please choose the correct answer from options.");
    }

    setActionLoading(true);
    try {
      const res = await api.post("/quiz-questions", formData);
      if (res.status) {
        toast.success("Quiz question created successfully.");
        setCreateModalOpen(false);
        fetchQuestions(1);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || "Failed to create question.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question.trim()) return toast.error("Question text is required.");
    if (formData.options.some((opt) => !opt.trim())) {
      return toast.error("All 4 options must be filled.");
    }
    if (!formData.correctAnswer.trim()) {
      return toast.error("Please choose the correct answer.");
    }

    setActionLoading(true);
    try {
      const res = await api.put(`/quiz-questions/${selectedQuestion._id}`, formData);
      if (res.status) {
        toast.success("Question updated successfully.");
        setEditModalOpen(false);
        fetchQuestions(pagination.page);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update question.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    setActionLoading(true);
    try {
      const res = await api.delete(`/quiz-questions/${selectedQuestion._id}`);
      if (res.status) {
        toast.success("Quiz question deleted.");
        setDeleteModalOpen(false);
        fetchQuestions(pagination.page);
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || "Failed to delete question.");
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
            <Brain className="w-7 h-7 text-rose-500" />
            Quiz Questions Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage anime and gaming trivia questions used for PvP Arena duels.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-linear-to-r from-rose-600 to-rose-700 text-white text-sm font-semibold hover:from-rose-500 hover:to-rose-600 shadow-md shadow-rose-950/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#121522] border border-slate-800 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Questions</div>
              <div className="text-xl font-bold text-slate-100">{stats.total?.toLocaleString() || 0}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#121522] border border-slate-800 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Anime Questions</div>
              <div className="text-xl font-bold text-slate-100">{stats.animeCount?.toLocaleString() || 0}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#121522] border border-slate-800 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Gaming Questions</div>
              <div className="text-xl font-bold text-slate-100">{stats.gameCount?.toLocaleString() || 0}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#121522] border border-slate-800 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Titles Covered</div>
              <div className="text-xl font-bold text-slate-100">{stats.coveredTitlesCount || 0} Titles</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-[#121522] border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions, titles, or explanations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900/80 border border-slate-700/60 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-rose-500 transition-colors"
          />
        </div>

        {/* Type & Difficulty Selectors */}
        <div className="flex items-center gap-3">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-900/80 border border-slate-700/60 rounded-xl text-slate-200 focus:outline-hidden focus:border-rose-500"
          >
            <option value="all">All Types</option>
            <option value="anime">Anime Trivia</option>
            <option value="game">Gaming Trivia</option>
          </select>

          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-900/80 border border-slate-700/60 rounded-xl text-slate-200 focus:outline-hidden focus:border-rose-500"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions Table / List */}
      <div className="rounded-2xl bg-[#121522] border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-20">
            <LoadingSpinner text="Loading trivia questions..." />
          </div>
        ) : questions.length === 0 ? (
          <div className="py-16">
            <EmptyState
              title="No quiz questions found"
              description="Try changing your search keywords or add a new question to the database."
            />
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {questions.map((q) => {
              const isAnime = q.type === "anime";
              return (
                <div
                  key={q._id}
                  className="p-5 hover:bg-slate-900/40 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2.5 flex-1 min-w-0">
                    {/* Badges row */}
                    <div className="flex items-center flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          isAnime
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            : "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        }`}
                      >
                        {isAnime ? <Film className="w-3 h-3" /> : <Gamepad2 className="w-3 h-3" />}
                        {isAnime ? "Anime" : "Gaming"}
                      </span>

                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700/60">
                        {q.title || "Lore"}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          q.difficulty === "easy"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : q.difficulty === "hard"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {q.difficulty || "medium"}
                      </span>
                    </div>

                    {/* Question text */}
                    <h3 className="text-sm font-semibold text-slate-100 leading-snug">
                      {q.question}
                    </h3>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options?.map((opt, idx) => {
                        const isCorrect =
                          String(opt).toLowerCase().trim() ===
                          String(q.correctAnswer).toLowerCase().trim();
                        return (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                              isCorrect
                                ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold"
                                : "bg-slate-900/60 border border-slate-800/80 text-slate-400"
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-slate-800">
                              {["A", "B", "C", "D"][idx]}
                            </span>
                            <span className="truncate flex-1">{opt}</span>
                            {isCorrect && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <p className="text-[11px] text-slate-400 italic pt-1 line-clamp-2">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end lg:self-center">
                    <button
                      onClick={() => openEditModal(q)}
                      className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                      title="Edit Question"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(q)}
                      className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 bg-[#0e1019] border-t border-slate-800">
          <Pagination pagination={pagination} onPageChange={handlePageChange} />
        </div>
      </div>

      {/* CREATE QUESTION MODAL */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add New Trivia Question"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value="anime">Anime</option>
                <option value="game">Gaming</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Title / Show Name</label>
              <input
                type="text"
                placeholder="e.g. Demon Slayer, Valorant"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Question Text</label>
            <textarea
              rows={2}
              placeholder="Enter question prompt..."
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
              required
            />
          </div>

          {/* 4 Options & Correct Answer Radio */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              4 Multiple Choice Options (Select radio for Correct Answer)
            </label>
            {formData.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctOption"
                  checked={formData.correctAnswer === opt && opt.trim() !== ""}
                  onChange={() => setFormData({ ...formData, correctAnswer: opt })}
                  className="w-4 h-4 accent-rose-500 cursor-pointer"
                  title="Mark as correct answer"
                />
                <span className="text-xs font-bold text-slate-400 w-4">
                  {["A", "B", "C", "D"][idx]}
                </span>
                <input
                  type="text"
                  placeholder={`Option ${["A", "B", "C", "D"][idx]}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                  required
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Lore Explanation (Optional)</label>
            <input
              type="text"
              placeholder="Why this answer is canon..."
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50"
            >
              {actionLoading ? "Saving..." : "Create Question"}
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT QUESTION MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Trivia Question"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value="anime">Anime</option>
                <option value="game">Gaming</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Title / Show Name</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Question Text</label>
            <textarea
              rows={2}
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              4 Multiple Choice Options (Select radio for Correct Answer)
            </label>
            {formData.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="editCorrectOption"
                  checked={formData.correctAnswer === opt && opt.trim() !== ""}
                  onChange={() => setFormData({ ...formData, correctAnswer: opt })}
                  className="w-4 h-4 accent-rose-500 cursor-pointer"
                  title="Mark as correct answer"
                />
                <span className="text-xs font-bold text-slate-400 w-4">
                  {["A", "B", "C", "D"][idx]}
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                  required
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Lore Explanation (Optional)</label>
            <input
              type="text"
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50"
            >
              {actionLoading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteSubmit}
        title="Delete Trivia Question"
        message={`Are you sure you want to delete the question: "${selectedQuestion?.question}"? This action cannot be undone.`}
        confirmText={actionLoading ? "Deleting..." : "Delete Question"}
        danger
      />
    </div>
  );
}
