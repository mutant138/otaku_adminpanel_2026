import React from "react";
import { LayoutGrid, List } from "lucide-react";

export default function ViewToggle({ view = "table", onViewChange }) {
  return (
    <div className="flex items-center bg-[#161a29] border border-slate-700/60 rounded-xl p-1 shrink-0">
      <button
        type="button"
        onClick={() => onViewChange("table")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
          view === "table"
            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
            : "text-slate-400 hover:text-slate-200"
        }`}
        title="Table View"
      >
        <List className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Table</span>
      </button>
      <button
        type="button"
        onClick={() => onViewChange("card")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
          view === "card"
            ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
            : "text-slate-400 hover:text-slate-200"
        }`}
        title="Card View"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Cards</span>
      </button>
    </div>
  );
}
