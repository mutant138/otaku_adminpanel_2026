import React from "react";
import { NavLink } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore.js";
import {
  LayoutDashboard,
  Users,
  Tags,
  Film,
  Sparkles,
  CreditCard,
  Flag,
  MapPin,
  Mail,
  LogOut,
  Shield,
  X,
  BookOpen,
  MessageSquareHeart,
} from "lucide-react";

export default function Sidebar({ onClose }) {
  const { admin, logout } = useAuthStore();

  const navItems = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    { label: "Users", path: "/users", icon: <Users className="w-4 h-4" /> },
    {
      label: "Categories",
      path: "/categories",
      icon: <Tags className="w-4 h-4" />,
    },
    { label: "Titles", path: "/titles", icon: <Film className="w-4 h-4" /> },
    {
      label: "Plans & Refills",
      path: "/plans",
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      label: "Payments",
      path: "/payments",
      icon: <CreditCard className="w-4 h-4" />,
    },
    { label: "Reports", path: "/reports", icon: <Flag className="w-4 h-4" /> },
    {
      label: "Feedbacks",
      path: "/feedbacks",
      icon: <MessageSquareHeart className="w-4 h-4" />,
    },
    {
      label: "Locations",
      path: "/locations",
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      label: "Email Templates",
      path: "/emails",
      icon: <Mail className="w-4 h-4" />,
    },
    {
      label: "Blogs & SEO",
      path: "/blogs",
      icon: <BookOpen className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-64 h-full flex flex-col bg-[#0e1019] border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800/80 bg-[#121522]">
        <div className="flex items-center gap-2.5">
          <img
            src="/otakuLogo.jpg"
            alt="OtakuDuo"
            className="w-8 h-8 rounded-xl object-cover border border-slate-700/60 shadow-md shadow-rose-950/40 shrink-0"
          />
          <div>
            <div className="font-bold text-sm text-slate-100 tracking-wide flex items-center gap-1.5">
              <span>OtakuDuo</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-rose-500/20 text-rose-400 rounded">
                Admin
              </span>
            </div>
            <div className="text-[11px] text-slate-500">Control Center</div>
          </div>
        </div>

        {/* Close Button for mobile drawer */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Management
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-linear-to-r from-rose-600/90 to-rose-700 text-white shadow-md shadow-rose-950/40"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Admin Profile Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#121522]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/30 flex items-center justify-center font-bold text-rose-300 text-xs shrink-0">
              {admin?.fullname?.[0] || "A"}
            </div>
            <div className="truncate text-left">
              <div className="text-xs font-semibold text-slate-200 truncate">
                {admin?.fullname || "Admin"}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {admin?.email}
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
