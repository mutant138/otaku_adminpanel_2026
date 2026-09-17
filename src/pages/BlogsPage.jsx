import React, { useState, useEffect, useMemo } from "react";
import api from "../services/api.js";
import { toast } from "../store/useToastStore.js";
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Globe,
  Share2,
  LayoutGrid,
  List as ListIcon,
  Tag,
  Clock,
  User,
  Calendar,
  ExternalLink,
  HelpCircle,
  BarChart2,
  FileText,
  RefreshCw,
  X,
} from "lucide-react";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'card'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("content"); // 'content', 'seo'
  const [editingBlog, setEditingBlog] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation State
  const [deleteId, setDeleteId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    coverImage: "",
    category: "Matchmaking Guides",
    authorName: "Otaku Guildmaster",
    authorTitle: "Senior Matchmaker",
    authorAvatar: "",
    readTime: "5 min read",
    tags: "",
    metaTitle: "",
    metaDescription: "",
    focusKeywords: "",
    canonicalUrl: "",
    isPublished: true,
  });

  const categories = [
    "Matchmaking Guides",
    "Anime News & Culture",
    "Gamer Guides",
    "Co-op & Tips",
    "Community & Events",
  ];

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/blogs");
      if (res.status && Array.isArray(res.data)) {
        setBlogs(res.data);
      } else {
        setBlogs([]);
      }
    } catch (err) {
      console.error("Failed to fetch blogs:", err);
      toast.error(err.message || "Failed to load blogs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSlugGenerate = (titleText) => {
    return titleText
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: !editingBlog ? handleSlugGenerate(val) : prev.slug,
      metaTitle: !editingBlog && !prev.metaTitle ? val : prev.metaTitle,
    }));
  };

  const handleOpenCreate = () => {
    setEditingBlog(null);
    setFormData({
      title: "",
      slug: "",
      description: "",
      content: "",
      coverImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
      category: "Matchmaking Guides",
      authorName: "Otaku Guildmaster",
      authorTitle: "Senior Matchmaker",
      authorAvatar: "",
      readTime: "5 min read",
      tags: "Anime Dating, Gamer Duo, Matchmaking",
      metaTitle: "",
      metaDescription: "",
      focusKeywords: "anime dating, gamer matchmaking, otaku duo",
      canonicalUrl: "",
      isPublished: true,
    });
    setModalTab("content");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || "",
      slug: blog.slug || "",
      description: blog.description || "",
      content: blog.content || "",
      coverImage: blog.coverImage || "",
      category: blog.category || "Matchmaking Guides",
      authorName: blog.authorName || "Otaku Guildmaster",
      authorTitle: blog.authorTitle || "Senior Matchmaker",
      authorAvatar: blog.authorAvatar || "",
      readTime: blog.readTime || "5 min read",
      tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : (blog.tags || ""),
      metaTitle: blog.metaTitle || blog.title || "",
      metaDescription: blog.metaDescription || blog.description || "",
      focusKeywords: Array.isArray(blog.focusKeywords) ? blog.focusKeywords.join(", ") : (blog.focusKeywords || ""),
      canonicalUrl: blog.canonicalUrl || "",
      isPublished: blog.isPublished !== undefined ? blog.isPublished : true,
    });
    setModalTab("content");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error("Please provide both a Title and Article Content.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        focusKeywords: formData.focusKeywords ? formData.focusKeywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
      };

      if (editingBlog) {
        const res = await api.put(`/blogs/${editingBlog._id}`, payload);
        toast.success("Blog updated successfully!");
      } else {
        const res = await api.post("/blogs", payload);
        toast.success("Blog article published successfully!");
      }
      setIsModalOpen(false);
      fetchBlogs();
    } catch (err) {
      console.error("Save Blog Error:", err);
      toast.error(err.message || "Failed to save blog article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await api.patch(`/blogs/${id}/publish`);
      toast.success(res.message || "Status updated.");
      setBlogs((prev) =>
        prev.map((b) => (b._id === id ? { ...b, isPublished: !b.isPublished } : b))
      );
    } catch (err) {
      console.error("Toggle publish error:", err);
      toast.error(err.message || "Failed to toggle status.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`/blogs/${deleteId}`);
      toast.success("Article deleted successfully.");
      setBlogs((prev) => prev.filter((b) => b._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      console.error("Delete blog error:", err);
      toast.error(err.message || "Failed to delete article.");
    }
  };

  // Filtered list
  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchesSearch =
        (b.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.slug || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.description || "").toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "All" || b.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Published" && b.isPublished) ||
        (statusFilter === "Draft" && !b.isPublished);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [blogs, searchTerm, categoryFilter, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = blogs.length;
    const published = blogs.filter((b) => b.isPublished).length;
    const drafts = total - published;
    const totalViews = blogs.reduce((acc, b) => acc + (b.viewsCount || 0), 0);
    return { total, published, drafts, totalViews };
  }, [blogs]);

  return (
    <div className="space-y-6">
      {/* Top Header & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-rose-500" />
            Blogs & SEO Engine
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Publish high-impact articles, optimize Google search snippets, and drive organic traffic to OtakuDuo.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-rose-950/40 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Article</span>
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#121522] border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100">{stats.total}</div>
            <div className="text-xs text-slate-400">Total Articles</div>
          </div>
        </div>

        <div className="bg-[#121522] border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100">{stats.published}</div>
            <div className="text-xs text-slate-400">Live (Indexed)</div>
          </div>
        </div>

        <div className="bg-[#121522] border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100">{stats.drafts}</div>
            <div className="text-xs text-slate-400">Drafts</div>
          </div>
        </div>

        <div className="bg-[#121522] border border-slate-800/80 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-100">{stats.totalViews}</div>
            <div className="text-xs text-slate-400">SEO Views</div>
          </div>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="bg-[#121522] border border-slate-800/80 rounded-2xl p-4 flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search blogs by title, slug, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0c0e17] border border-slate-700/60 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-[#0c0e17] border border-slate-700/60 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-[#0c0e17] border border-slate-700/60 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-rose-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#0c0e17] border border-slate-700/60 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "table" ? "bg-slate-800 text-rose-400 shadow-sm" : "text-slate-400 hover:text-white"
              }`}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === "card" ? "bg-slate-800 text-rose-400 shadow-sm" : "text-slate-400 hover:text-white"
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={fetchBlogs}
            className="p-2 bg-[#0c0e17] border border-slate-700/60 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Blogs Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mr-2" />
          <span>Loading articles...</span>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="bg-[#121522] border border-slate-800/80 rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No blog posts found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || categoryFilter !== "All" || statusFilter !== "All"
              ? "Try adjusting your search query or filters."
              : "Create your first SEO article to capture gamer & anime search traffic."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create First Article
          </button>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="bg-[#121522] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#0e1019] text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Article</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">SEO / Slug</th>
                  <th className="px-4 py-3.5">Views</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBlogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        {blog.coverImage ? (
                          <img
                            src={blog.coverImage}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover border border-slate-700/60 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center shrink-0 text-slate-500">
                            <BookOpen className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0 max-w-xs md:max-w-sm">
                          <div className="font-semibold text-slate-100 truncate" title={blog.title}>
                            {blog.title}
                          </div>
                          <div className="text-xs text-slate-400 truncate mt-0.5">
                            By {blog.authorName || "Otaku Team"} • {blog.readTime || "5 min"}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 border border-slate-700/50">
                        {blog.category || "General"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleTogglePublish(blog._id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                          blog.isPublished
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                            : "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
                        }`}
                        title="Click to toggle publish status"
                      >
                        {blog.isPublished ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-xs font-mono text-slate-400 truncate max-w-[160px]">
                        /blog/{blog.slug}
                      </div>
                      {blog.focusKeywords && blog.focusKeywords.length > 0 && (
                        <div className="text-[11px] text-rose-400/80 truncate mt-0.5">
                          {Array.isArray(blog.focusKeywords)
                            ? blog.focusKeywords.slice(0, 2).join(", ")
                            : blog.focusKeywords}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-4 text-xs font-mono text-slate-300">
                      {blog.viewsCount || 0}
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className="px-5 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(blog)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit Article & SEO"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(blog._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Article"
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
        /* CARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBlogs.map((blog) => (
            <div
              key={blog._id}
              className="bg-[#121522] border border-slate-800/80 rounded-2xl overflow-hidden hover:border-slate-700 transition-all flex flex-col shadow-lg"
            >
              <div className="relative h-44 bg-slate-900 overflow-hidden">
                {blog.coverImage ? (
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <BookOpen className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-black/60 backdrop-blur-md text-white border border-white/10">
                    {blog.category || "Guide"}
                  </span>
                </div>
                <div className="absolute top-3 right-3">
                  <button
                    onClick={() => handleTogglePublish(blog._id)}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold backdrop-blur-md cursor-pointer transition-colors ${
                      blog.isPublished
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                        : "bg-amber-950/80 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    {blog.isPublished ? "Live" : "Draft"}
                  </button>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-100 text-base line-clamp-2 mb-1.5">
                  {blog.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                  {blog.description || "No description provided."}
                </p>

                <div className="mt-auto pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>{blog.readTime || "5 min read"}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEdit(blog)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(blog._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT BLOG MODAL WITH LIVE GOOGLE SERP PREVIEW */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-[#10131f] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#141826]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100">
                    {editingBlog ? "Edit Article & SEO" : "Create New Blog Article"}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Write content and optimize your Google search appearance
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-800 bg-[#0e1019] px-6">
              <button
                onClick={() => setModalTab("content")}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  modalTab === "content"
                    ? "border-rose-500 text-rose-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="w-4 h-4" />
                Article Content
              </button>
              <button
                onClick={() => setModalTab("seo")}
                className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
                  modalTab === "seo"
                    ? "border-rose-500 text-rose-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Globe className="w-4 h-4" />
                Google SERP & SEO Snippet
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {modalTab === "content" ? (
                <div className="space-y-4">
                  {/* Title & Slug */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Article Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={handleTitleChange}
                        placeholder="e.g. How to Find Your Anime Duo"
                        required
                        className="w-full px-3.5 py-2.5 bg-[#161a29] border border-slate-700/60 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        URL Slug (https://otakuduo.com/blog/...)
                      </label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) =>
                          setFormData({ ...formData, slug: handleSlugGenerate(e.target.value) })
                        }
                        placeholder="how-to-find-your-anime-duo"
                        required
                        className="w-full px-3.5 py-2.5 bg-[#161a29] border border-slate-700/60 rounded-xl text-sm font-mono text-rose-300 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* Category, Read Time, Cover Image */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-[#161a29] border border-slate-700/60 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Read Time
                      </label>
                      <input
                        type="text"
                        value={formData.readTime}
                        onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                        placeholder="5 min read"
                        className="w-full px-3.5 py-2.5 bg-[#161a29] border border-slate-700/60 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Cover Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.coverImage}
                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full px-3.5 py-2.5 bg-[#161a29] border border-slate-700/60 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* Author Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Author Name
                      </label>
                      <input
                        type="text"
                        value={formData.authorName}
                        onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                        placeholder="Otaku Guildmaster"
                        className="w-full px-3.5 py-2.5 bg-[#161a29] border border-slate-700/60 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Author Title / Role
                      </label>
                      <input
                        type="text"
                        value={formData.authorTitle}
                        onChange={(e) => setFormData({ ...formData, authorTitle: e.target.value })}
                        placeholder="Senior Matchmaker"
                        className="w-full px-3.5 py-2.5 bg-[#161a29] border border-slate-700/60 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* Summary Description */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Short Summary / Excerpt
                    </label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief overview of what readers will learn in this article..."
                      className="w-full px-3.5 py-2.5 bg-[#161a29] border border-slate-700/60 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Content (Markdown / Text) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Article Body (Markdown Supported) *
                    </label>
                    <textarea
                      rows={10}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="## Introduction&#10;&#10;Write your article here using Markdown headings (##), lists (-), and paragraphs..."
                      required
                      className="w-full px-3.5 py-2.5 bg-[#161a29] border border-slate-700/60 rounded-xl text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              ) : (
                /* SEO & SERP PREVIEW TAB */
                <div className="space-y-5">
                  {/* Google SERP Live Snippet Preview Box */}
                  <div className="bg-[#181d2e] border border-slate-700/80 rounded-2xl p-5 shadow-inner">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-400">
                        <Sparkles className="w-4 h-4" />
                        Live Google Search Result Preview
                      </div>
                      <span className="text-[11px] text-slate-400">SERP Simulator</span>
                    </div>

                    {/* Google Snippet Card */}
                    <div className="bg-white rounded-xl p-4 text-left shadow-lg select-none">
                      <div className="flex items-center gap-2 text-[12px] text-[#202124] mb-1">
                        <div className="w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center text-[10px] text-white font-bold">
                          O
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium leading-none">Otaku Duo</span>
                          <span className="text-[11px] text-[#5f6368] leading-tight">
                            https://otakuduo.com › blog › {formData.slug || "your-slug"}
                          </span>
                        </div>
                      </div>

                      <div className="text-[18px] font-medium text-[#1a0dab] hover:underline leading-snug cursor-pointer line-clamp-1">
                        {formData.metaTitle || formData.title || "Otaku Duo Article Title"} | Otaku Chronicles
                      </div>

                      <div className="text-[13px] text-[#4d5156] mt-1 line-clamp-2 leading-relaxed">
                        {formData.metaDescription ||
                          formData.description ||
                          "Otaku Duo is the gamified dating platform for anime lovers and gamers. Discover guides, tips, and tier lists."}
                      </div>
                    </div>
                  </div>

                  {/* Meta Title Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Google Meta Title
                      </label>
                      <span
                        className={`text-xs ${
                          (formData.metaTitle || "").length > 60
                            ? "text-rose-400 font-bold"
                            : "text-slate-400"
                        }`}
                      >
                        {(formData.metaTitle || "").length} / 60 characters
                      </span>
                    </div>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder={formData.title || "Custom SEO title for Google"}
                      className="w-full px-3.5 py-2.5 bg-[#161a29] border border-slate-700/60 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Meta Description Field */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Google Meta Description
                      </label>
                      <span
                        className={`text-xs ${
                          (formData.metaDescription || "").length > 160
                            ? "text-rose-400 font-bold"
                            : "text-slate-400"
                        }`}
                      >
                        {(formData.metaDescription || "").length} / 160 characters
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={formData.metaDescription}
                      onChange={(e) =>
                        setFormData({ ...formData, metaDescription: e.target.value })
                      }
                      placeholder={
                        formData.description ||
                        "Compelling 150-character summary that boosts Google Click-Through-Rate (CTR)..."
                      }
                      className="w-full px-3.5 py-2.5 bg-[#161a29] border border-slate-700/60 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Focus Keywords */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Focus Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.focusKeywords}
                      onChange={(e) =>
                        setFormData({ ...formData, focusKeywords: e.target.value })
                      }
                      placeholder="anime dating app, gamer matchmaking, co-op partner"
                      className="w-full px-3.5 py-2.5 bg-[#161a29] border border-slate-700/60 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Canonical URL */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Canonical URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.canonicalUrl}
                      onChange={(e) =>
                        setFormData({ ...formData, canonicalUrl: e.target.value })
                      }
                      placeholder="https://otakuduo.com/blog/your-slug"
                      className="w-full px-3.5 py-2.5 bg-[#161a29] border border-slate-700/60 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Publish Status Checkbox */}
                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="publish-check"
                      checked={formData.isPublished}
                      onChange={(e) =>
                        setFormData({ ...formData, isPublished: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 bg-[#161a29] border-slate-700 cursor-pointer"
                    />
                    <label htmlFor="publish-check" className="text-sm font-medium text-slate-200 cursor-pointer">
                      Publish immediately to Google Index and Next.js /blog catalog
                    </label>
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-950/40 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingBlog
                    ? "Update Article"
                    : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121522] border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Delete Blog Article?</h3>
            <p className="text-xs text-slate-400 mt-2">
              Are you sure you want to delete this article? This will remove it from the blog and search engine index.
            </p>
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-lg shadow-rose-950/40"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
