import React from "react";
import { Menu, ExternalLink, ShieldCheck } from "lucide-react";
import useAuthStore from "../../store/useAuthStore.js";

export default function Header({ onToggleSidebar }) {
  const { admin } = useAuthStore();

  return (
    <header className="h-16 px-4 sm:px-6 bg-[#0f121d]/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl border border-slate-800 bg-[#161a29] text-slate-300 hover:text-white"
          title="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 hidden sm:inline" />
          <span className="text-xs text-slate-400 font-medium">
            System Online &bull; Protected Environment
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-[#141724] text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
        >
          <span>View Public App</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-7 h-7 rounded-lg bg-linear-to-tr from-rose-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">
            {admin?.fullname?.[0] || "A"}
          </div>
          <span className="text-xs font-medium text-slate-200 hidden md:inline">
            {admin?.username || "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
