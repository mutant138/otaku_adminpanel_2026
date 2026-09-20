import React, { useState, useEffect, useMemo, useRef } from "react";
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
  Image as ImageIcon,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  Code,
  List,
  Link as LinkIcon,
  Check,
  Copy,
  Sliders,
  Layers,
  AlertCircle,
  Lightbulb,
  Zap,
  Smartphone,
  Monitor,
  Columns,
  Maximize2,
} from "lucide-react";

// Curated anime/gamer wallpaper presets for instant 1-click cover selection
const IMAGE_PRESETS = [
  {
    name: "Cyberpunk Romance",
    url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Neon Matchmaking",
    url: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Co-op Duo Gaming",
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Tokyo Night View",
    url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80",
  },
  {
    name: "Anime Café Date",
    url: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?w=1200&auto=format&fit=crop&q=80",
  },
];

function formatInline(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-slate-200">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-[#181d2e] text-rose-300 px-1.5 py-0.5 rounded text-[11px] font-mono border border-slate-700/60">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-rose-400 hover:text-rose-300 underline font-medium">$1</a>');
}

function renderSimpleMarkdown(markdown) {
  if (!markdown) return "";
  const lines = markdown.split("\n");
  let inCodeBlock = false;
  let codeContent = [];
  const htmlLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        htmlLines.push(
          `<pre class="bg-[#0b0e17] border border-slate-800 rounded-xl p-3.5 my-3 overflow-x-auto text-xs font-mono text-rose-300"><code>${codeContent.join(
            "\n"
          )}</code></pre>`
        );
        codeContent = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent.push(
        line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      );
      continue;
    }

    if (line.startsWith("### ")) {
      htmlLines.push(
        `<h3 class="text-sm font-bold text-slate-100 mt-4 mb-1.5 flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>${formatInline(
          line.slice(4)
        )}</h3>`
      );
    } else if (line.startsWith("## ")) {
      htmlLines.push(
        `<h2 class="text-base font-extrabold text-rose-400 mt-5 mb-2 pb-1.5 border-b border-slate-800/80">${formatInline(
          line.slice(3)
        )}</h2>`
      );
    } else if (line.startsWith("# ")) {
      htmlLines.push(
        `<h1 class="text-lg font-extrabold text-white mt-5 mb-2">${formatInline(
          line.slice(2)
        )}</h1>`
      );
    } else if (line.startsWith("> 💡")) {
      htmlLines.push(
        `<div class="bg-amber-500/10 border-l-4 border-amber-400 p-3 rounded-r-xl my-2.5 text-amber-200 text-xs leading-relaxed flex items-start gap-2"><span>💡</span><div>${formatInline(
          line.slice(4)
        )}</div></div>`
      );
    } else if (line.startsWith("> ")) {
      htmlLines.push(
        `<blockquote class="border-l-4 border-rose-500 bg-rose-500/10 px-3.5 py-2 rounded-r-xl my-2.5 text-rose-200 text-xs italic leading-relaxed">${formatInline(
          line.slice(2)
        )}</blockquote>`
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      htmlLines.push(
        `<li class="ml-5 list-disc text-xs text-slate-300 my-1 leading-relaxed">${formatInline(
          line.slice(2)
        )}</li>`
      );
    } else if (line.trim() === "") {
      htmlLines.push(`<div class="h-2"></div>`);
    } else {
      htmlLines.push(
        `<p class="text-xs text-slate-300 leading-relaxed my-1">${formatInline(
          line
        )}</p>`
      );
    }
  }

  return htmlLines.join("");
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'card'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState("content"); // 'content', 'media', 'seo'
  const [editorMode, setEditorMode] = useState("write"); // 'write', 'split', 'preview'
  const [serpDevice, setSerpDevice] = useState("desktop"); // 'desktop', 'mobile'
  const [editingBlog, setEditingBlog] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const contentTextareaRef = useRef(null);

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        setIsModalOpen(false);
      }
    };
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

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

  const insertMarkdown = (prefix, suffix = "", defaultText = "") => {
    const textarea = contentTextareaRef.current;
    if (!textarea) {
      setFormData((prev) => ({
        ...prev,
        content: (prev.content || "") + prefix + defaultText + suffix,
      }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentVal = formData.content || "";
    const selectedText = currentVal.substring(start, end) || defaultText;
    const replacement = prefix + selectedText + suffix;

    const newVal =
      currentVal.substring(0, start) + replacement + currentVal.substring(end);

    setFormData((prev) => ({ ...prev, content: newVal }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 10);
  };

  const wordCount = useMemo(() => {
    if (!formData.content) return 0;
    return formData.content.trim().split(/\s+/).filter(Boolean).length;
  }, [formData.content]);

  const calculatedReadTime = useMemo(() => {
    const mins = Math.max(1, Math.ceil(wordCount / 200));
    return `${mins} min read`;
  }, [wordCount]);

  const seoScore = useMemo(() => {
    let score = 0;
    const title = formData.metaTitle || formData.title || "";
    const desc = formData.metaDescription || formData.description || "";
    const keywords = formData.focusKeywords || "";
    const slug = formData.slug || "";
    const hasCover = !!formData.coverImage;
    const hasContent = (formData.content || "").length > 150;

    if (title.length >= 25 && title.length <= 65) score += 20;
    else if (title.length > 0) score += 10;

    if (desc.length >= 70 && desc.length <= 165) score += 25;
    else if (desc.length > 0) score += 10;

    if (slug.length > 3) score += 15;
    if (keywords.length > 3) score += 15;
    if (hasCover) score += 10;
    if (hasContent) score += 15;

    return Math.min(100, score);
  }, [formData]);

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

      {/* CREATE / EDIT BLOG MODAL WITH LIVE GOOGLE SERP PREVIEW & CYBER WRITING SUITE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0f121d] border border-slate-700/80 rounded-2xl md:rounded-3xl w-full max-w-5xl h-[88vh] max-h-[860px] flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden">
            <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0 overflow-hidden">
              {/* Modal Header Bar (Fixed / Shrink-0) */}
              <div className="px-5 sm:px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#141828] shrink-0">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500/20 to-purple-600/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-base font-bold text-white truncate">
                        {editingBlog ? "Edit Article & SEO" : "Create New Blog Article"}
                      </h2>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border ${
                          formData.isPublished
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        }`}
                      >
                        {formData.isPublished ? "Live Indexing" : "Draft Mode"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {formData.title ? formData.title : "Draft a high-ranking anime & gaming transmission"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Header Quick Telemetry */}
                  <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-[#0a0d16] border border-slate-800 rounded-xl text-[11px] font-mono text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-400" />
                      {formData.readTime || calculatedReadTime}
                    </span>
                    <span className="text-slate-700">|</span>
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      SEO: <strong className={seoScore >= 70 ? "text-emerald-400" : "text-amber-400"}>{seoScore}%</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Tab Navigation (Fixed / Shrink-0) */}
              <div className="flex border-b border-slate-800/80 bg-[#0b0e17] px-4 sm:px-6 gap-2 shrink-0 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setModalTab("content")}
                  className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    modalTab === "content"
                      ? "border-rose-500 text-rose-400 bg-rose-500/5"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>1. Article Content & Editor</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab("media")}
                  className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    modalTab === "media"
                      ? "border-rose-500 text-rose-400 bg-rose-500/5"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>2. Media & Metadata</span>
                </button>

                <button
                  type="button"
                  onClick={() => setModalTab("seo")}
                  className={`py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                    modalTab === "seo"
                      ? "border-rose-500 text-rose-400 bg-rose-500/5"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                  }`}
                >
                  <Globe className="w-4 h-4" />
                  <span>3. Google SERP & SEO</span>
                  <span className={`ml-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${
                    seoScore >= 70 ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                  }`}>
                    {seoScore}%
                  </span>
                </button>
              </div>

              {/* Modal Body (Scrollable / Flex-1) */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* ── TAB 1: ARTICLE CONTENT & WRITING SUITE ── */}
              {modalTab === "content" && (
                <div className="space-y-5 animate-fade-in">
                  {/* Article Title & Auto Slug */}
                  <div className="space-y-3 bg-[#131726]/60 border border-slate-800/80 rounded-2xl p-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-rose-400" />
                          Article Title *
                        </label>
                        <span className="text-[11px] font-mono text-slate-400">
                          {formData.title.length} characters
                        </span>
                      </div>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={handleTitleChange}
                        placeholder="e.g. 7 Anime Dating Tips Every Gamer Duo Needs to Know"
                        required
                        className="w-full px-4 py-3 bg-[#0a0d16] border border-slate-700/80 rounded-xl text-base font-bold text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/40 transition-all"
                      />
                    </div>

                    {/* Slug pill with copy trigger */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                      <span className="text-[11px] font-mono text-slate-400 uppercase font-bold shrink-0">
                        Canonical Slug:
                      </span>
                      <div className="flex-1 flex items-center gap-1.5 bg-[#080a11] border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-rose-300 overflow-hidden">
                        <span className="text-slate-500 shrink-0 select-none">/blog/</span>
                        <input
                          type="text"
                          value={formData.slug}
                          onChange={(e) =>
                            setFormData({ ...formData, slug: handleSlugGenerate(e.target.value) })
                          }
                          placeholder="article-url-slug"
                          required
                          className="flex-1 bg-transparent text-rose-300 font-mono text-xs focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.slug) {
                              navigator.clipboard.writeText(`https://otakuduo.com/blog/${formData.slug}`);
                              setCopiedSlug(true);
                              setTimeout(() => setCopiedSlug(false), 2000);
                              toast.info("Blog URL copied to clipboard!");
                            }
                          }}
                          className="p-1 hover:text-white text-slate-400 transition-colors cursor-pointer"
                          title="Copy Full URL"
                        >
                          {copiedSlug ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary / Excerpt */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Short Excerpt / Deck (Appears in Card & Google snippets)
                      </label>
                      <span className="text-[11px] font-mono text-slate-400">
                        {formData.description.length} / 250
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief 1-2 sentence hook explaining what readers and matchmaking hopefuls will discover..."
                      className="w-full px-4 py-2.5 bg-[#131726] border border-slate-700/70 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all leading-relaxed"
                    />
                  </div>

                  {/* Writing Area with Markdown Toolbar & Live Split Preview */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
                      <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-rose-400" />
                        Article Body (Markdown Supported) *
                      </label>

                      {/* View Mode Selector */}
                      <div className="flex items-center bg-[#0a0d16] border border-slate-800 rounded-xl p-1 gap-1">
                        <button
                          type="button"
                          onClick={() => setEditorMode("write")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            editorMode === "write"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          ✍️ Write
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorMode("split")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            editorMode === "split"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          🌗 Split Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorMode("preview")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            editorMode === "preview"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          👁️ Full Preview
                        </button>
                      </div>
                    </div>

                    {/* Markdown Formatting Toolbar */}
                    {editorMode !== "preview" && (
                      <div className="flex flex-wrap items-center gap-1 bg-[#141828] border border-slate-800 rounded-t-xl px-3 py-2 text-slate-300">
                        <button
                          type="button"
                          onClick={() => insertMarkdown("## ", "", "Major Section Heading")}
                          className="p-1.5 hover:bg-slate-700/50 hover:text-rose-400 rounded-lg text-xs font-bold font-mono transition-colors"
                          title="Heading 2 (## )"
                        >
                          <Heading2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("### ", "", "Sub-section Heading")}
                          className="p-1.5 hover:bg-slate-700/50 hover:text-rose-400 rounded-lg text-xs font-bold font-mono transition-colors"
                          title="Heading 3 (### )"
                        >
                          <Heading3 className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-4 bg-slate-800 mx-1" />
                        <button
                          type="button"
                          onClick={() => insertMarkdown("**", "**", "bold text")}
                          className="p-1.5 hover:bg-slate-700/50 hover:text-white rounded-lg transition-colors"
                          title="Bold (**text**)"
                        >
                          <Bold className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("*", "*", "italic text")}
                          className="p-1.5 hover:bg-slate-700/50 hover:text-white rounded-lg transition-colors"
                          title="Italic (*text*)"
                        >
                          <Italic className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-4 bg-slate-800 mx-1" />
                        <button
                          type="button"
                          onClick={() => insertMarkdown("> ", "", "Important quote or highlight")}
                          className="p-1.5 hover:bg-slate-700/50 hover:text-rose-400 rounded-lg transition-colors"
                          title="Blockquote (> )"
                        >
                          <Quote className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("> 💡 **Pro-Tip:** ", "", "Connect with verified anime enthusiasts on Otaku Duo radar.")}
                          className="p-1.5 hover:bg-slate-700/50 hover:text-amber-400 rounded-lg transition-colors"
                          title="Cyber Callout Box (> 💡 )"
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("```\n", "\n```", "// Code or telemetry")}
                          className="p-1.5 hover:bg-slate-700/50 hover:text-cyan-400 rounded-lg transition-colors"
                          title="Code Block"
                        >
                          <Code className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("- ", "", "List item")}
                          className="p-1.5 hover:bg-slate-700/50 hover:text-white rounded-lg transition-colors"
                          title="Bullet List (- )"
                        >
                          <List className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("[", "](https://otakuduo.com)", "Otaku Duo Lobby")}
                          className="p-1.5 hover:bg-slate-700/50 hover:text-rose-400 rounded-lg transition-colors"
                          title="Hyperlink ([text](url))"
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => insertMarkdown("![", "](https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800)", "Anime Duo Banner")}
                          className="p-1.5 hover:bg-slate-700/50 hover:text-purple-400 rounded-lg transition-colors"
                          title="Image Tag (![alt](url))"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Editor & Preview Display Grid */}
                    <div
                      className={`grid gap-3 ${
                        editorMode === "split" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
                      }`}
                    >
                      {/* Editor Textarea */}
                      {editorMode !== "preview" && (
                        <textarea
                          ref={contentTextareaRef}
                          rows={14}
                          value={formData.content}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          placeholder="## 1. Introduction&#10;&#10;Finding a genuine co-op gaming partner and anime soulmate isn't just luck—it requires knowing where true fans gather.&#10;&#10;> 💡 **Pro-Tip:** Fill in your favorite anime tier list on your profile for 85%+ compatibility.&#10;&#10;## 2. Key Strategies for Gamers..."
                          required
                          className={`w-full px-4 py-3 bg-[#0d101a] border border-slate-700/80 ${
                            editorMode !== "preview" ? "rounded-b-xl" : "rounded-xl"
                          } text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all leading-relaxed`}
                        />
                      )}

                      {/* Live Markdown Preview Box */}
                      {editorMode !== "write" && (
                        <div className="bg-[#0b0e17] border border-slate-800 rounded-xl p-4 overflow-y-auto max-h-[380px] shadow-inner text-slate-200">
                          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                            <span className="flex items-center gap-1.5 text-rose-400 font-bold">
                              <Eye className="w-3.5 h-3.5" /> Live Render Preview
                            </span>
                            <span>{wordCount} words</span>
                          </div>
                          {formData.content ? (
                            <div
                              className="space-y-1"
                              dangerouslySetInnerHTML={{
                                __html: renderSimpleMarkdown(formData.content),
                              }}
                            />
                          ) : (
                            <div className="py-12 text-center text-slate-600 text-xs font-mono">
                              Start typing markdown on the left to see live cyber formatting here...
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Word and Time Counters */}
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 px-1 pt-1">
                      <span>{wordCount} Words Total</span>
                      <span>Estimated Reading Time: <strong className="text-slate-300">{calculatedReadTime}</strong></span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 2: MEDIA & METADATA ── */}
              {modalTab === "media" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Cover Image Section */}
                  <div className="bg-[#131726]/60 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                        Article Cover Banner URL
                      </label>
                      <span className="text-[11px] text-slate-400">16:9 Recommended (1200x675)</span>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={formData.coverImage}
                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="flex-1 px-4 py-2.5 bg-[#0a0d16] border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30"
                      />
                      {formData.coverImage && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, coverImage: "" })}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* 1-Click Anime Wallpaper Presets */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase tracking-wider font-mono text-slate-400 font-bold">
                        ⚡ Quick Anime &amp; Gamer Presets:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {IMAGE_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setFormData({ ...formData, coverImage: preset.url })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                              formData.coverImage === preset.url
                                ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-sm"
                                : "bg-[#0b0e17] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                            }`}
                          >
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Live Image Frame Preview */}
                    {formData.coverImage ? (
                      <div className="relative w-full h-44 sm:h-56 rounded-2xl overflow-hidden border border-slate-700 shadow-lg bg-[#080a11]">
                        <img
                          src={formData.coverImage}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                          <span className="text-xs font-bold text-white bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                            Cover Image Active
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-32 rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                        <ImageIcon className="w-6 h-6 text-slate-600" />
                        <span>No image URL entered. Choose a preset above or paste a link.</span>
                      </div>
                    )}
                  </div>

                  {/* Category, Read Time, Tags Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-rose-400" />
                        Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 bg-[#131726] border border-slate-700/70 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                      >
                        {categories.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Read Time */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-cyan-400" />
                          Read Time
                        </label>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, readTime: calculatedReadTime })}
                          className="text-[10px] font-mono text-rose-400 hover:underline cursor-pointer"
                        >
                          Auto Sync ({calculatedReadTime})
                        </button>
                      </div>
                      <input
                        type="text"
                        value={formData.readTime}
                        onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                        placeholder="5 min read"
                        className="w-full px-4 py-2.5 bg-[#131726] border border-slate-700/70 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* Tags Pill Manager */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-purple-400" />
                      Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="Anime Dating, Gamer Duo, Matchmaking, Discord Partner"
                      className="w-full px-4 py-2.5 bg-[#131726] border border-slate-700/70 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                    {formData.tags && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {formData.tags.split(",").map((tag, idx) => {
                          const clean = tag.trim();
                          if (!clean) return null;
                          return (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-[#171b2d] border border-slate-700 rounded-lg text-[10.5px] font-mono text-purple-300 flex items-center gap-1"
                            >
                              #{clean}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Author Profile Information */}
                  <div className="bg-[#131726]/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                      <User className="w-3.5 h-3.5 text-rose-400" />
                      Author Credentials
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Author Name</label>
                        <input
                          type="text"
                          value={formData.authorName}
                          onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                          placeholder="Otaku Guildmaster"
                          className="w-full px-3.5 py-2 bg-[#0a0d16] border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">Author Title / Role</label>
                        <input
                          type="text"
                          value={formData.authorTitle}
                          onChange={(e) => setFormData({ ...formData, authorTitle: e.target.value })}
                          placeholder="Senior Matchmaker"
                          className="w-full px-3.5 py-2 bg-[#0a0d16] border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: GOOGLE SERP & SEO SUITE ── */}
              {modalTab === "seo" && (
                <div className="space-y-6 animate-fade-in">
                  {/* Google SERP Live Snippet Simulator */}
                  <div className="bg-[#151928] border border-slate-700/80 rounded-2xl p-5 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Live Google Search Result Preview
                      </div>
                      {/* Device switch */}
                      <div className="flex items-center bg-[#0a0d16] border border-slate-800 rounded-xl p-1 gap-1">
                        <button
                          type="button"
                          onClick={() => setSerpDevice("desktop")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            serpDevice === "desktop"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <Monitor className="w-3.5 h-3.5" /> Desktop
                        </button>
                        <button
                          type="button"
                          onClick={() => setSerpDevice("mobile")}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                            serpDevice === "mobile"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          <Smartphone className="w-3.5 h-3.5" /> Mobile
                        </button>
                      </div>
                    </div>

                    {/* Google SERP Card */}
                    <div
                      className={`bg-white rounded-2xl p-4 text-left shadow-2xl select-none transition-all ${
                        serpDevice === "mobile" ? "max-w-sm mx-auto border-2 border-slate-300" : "w-full"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-[12px] text-[#202124] mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-[#10131f] flex items-center justify-center text-[10px] text-white font-bold">
                          O
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-[#202124] leading-none">Otaku Duo</span>
                          <span className="text-[11px] text-[#4d5156] leading-tight mt-0.5 truncate">
                            https://otakuduo.com › blog › {formData.slug || "anime-dating-tips"}
                          </span>
                        </div>
                      </div>

                      <div className="text-[17px] sm:text-[19px] font-medium text-[#1a0dab] hover:underline leading-snug cursor-pointer line-clamp-2">
                        {formData.metaTitle || formData.title || "7 Anime Dating Tips for Gamer Couples"} | Otaku Chronicles
                      </div>

                      <div className="text-[13px] text-[#4d5156] mt-1.5 line-clamp-2 leading-relaxed">
                        {formData.metaDescription ||
                          formData.description ||
                          "Discover how to meet like-minded anime lovers and co-op gaming partners on Otaku Duo with verified affinity scores and matchmaking guides."}
                      </div>
                    </div>

                    {/* SEO Health Bar */}
                    <div className="bg-[#0b0e17] rounded-xl p-3.5 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${
                            seoScore >= 80 ? "bg-emerald-400 animate-pulse" : seoScore >= 50 ? "bg-amber-400" : "bg-rose-400"
                          }`}
                        />
                        <span className="text-xs font-bold text-slate-200">
                          Search Optimization Score: <strong className={seoScore >= 80 ? "text-emerald-400" : "text-amber-400"}>{seoScore}/100</strong>
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {seoScore >= 80 ? "🔥 Excellent CTR Potential" : "💡 Add keywords & title length to improve"}
                      </span>
                    </div>
                  </div>

                  {/* Meta Title Field with Meter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Google Meta Title (Max 60 chars)
                      </label>
                      <span
                        className={`text-xs font-mono font-bold ${
                          (formData.metaTitle || "").length > 60
                            ? "text-rose-400"
                            : (formData.metaTitle || "").length >= 35
                            ? "text-emerald-400"
                            : "text-slate-400"
                        }`}
                      >
                        {(formData.metaTitle || "").length} / 60
                      </span>
                    </div>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder={formData.title || "Custom high-CTR search title"}
                      className="w-full px-4 py-2.5 bg-[#131726] border border-slate-700/70 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Meta Description Field with Meter */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Google Meta Description (Max 160 chars)
                      </label>
                      <span
                        className={`text-xs font-mono font-bold ${
                          (formData.metaDescription || "").length > 160
                            ? "text-rose-400"
                            : (formData.metaDescription || "").length >= 100
                            ? "text-emerald-400"
                            : "text-slate-400"
                        }`}
                      >
                        {(formData.metaDescription || "").length} / 160
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder={
                        formData.description ||
                        "Compelling summary with focus keywords that prompts Google searchers to click through..."
                      }
                      className="w-full px-4 py-2.5 bg-[#131726] border border-slate-700/70 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 leading-relaxed"
                    />
                  </div>

                  {/* Focus Keywords */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                      Focus Target Keywords (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.focusKeywords}
                      onChange={(e) => setFormData({ ...formData, focusKeywords: e.target.value })}
                      placeholder="anime dating app, gamer matchmaking, co-op romance"
                      className="w-full px-4 py-2.5 bg-[#131726] border border-slate-700/70 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  {/* Canonical URL & Publishing Checkbox */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1">
                        Canonical URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.canonicalUrl}
                        onChange={(e) => setFormData({ ...formData, canonicalUrl: e.target.value })}
                        placeholder="https://otakuduo.com/blog/..."
                        className="w-full px-3.5 py-2 bg-[#131726] border border-slate-700/70 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="flex items-center justify-start sm:justify-center pt-4">
                      <label className="flex items-center gap-3 p-3 bg-[#131726] border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors w-full">
                        <input
                          type="checkbox"
                          checked={formData.isPublished}
                          onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                          className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500 bg-[#0a0d16] border-slate-700 cursor-pointer"
                        />
                        <div>
                          <span className="text-xs font-bold text-white block">
                            Publish Live Immediately
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            Visible on /blog &amp; crawled by search bots
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              </div>

              {/* Modal Footer (Fixed / Shrink-0) */}
              <div className="px-5 sm:px-6 py-3.5 border-t border-slate-800 bg-[#121524] flex items-center justify-between gap-3 shrink-0">
                <div className="text-xs font-mono text-slate-400 hidden sm:flex items-center gap-2">
                  <span>Active Tab:</span>
                  <span className="text-rose-400 font-bold uppercase">{modalTab}</span>
                </div>

                <div className="flex items-center gap-3 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-[0_4px_20px_rgba(225,29,72,0.35)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isSubmitting
                      ? "Processing..."
                      : editingBlog
                      ? "Update Article"
                      : "Publish Article 🚀"}
                  </button>
                </div>
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
