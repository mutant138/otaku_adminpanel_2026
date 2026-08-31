import React from "react";

export default function Badge({ children, variant = "default", size = "sm", className = "" }) {
  const variants = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    primary: "bg-rose-950/50 text-rose-300 border-rose-800/40",
    purple: "bg-purple-950/50 text-purple-300 border-purple-800/40",
    success: "bg-emerald-950/50 text-emerald-300 border-emerald-800/40",
    warning: "bg-amber-950/50 text-amber-300 border-amber-800/40",
    danger: "bg-rose-950/60 text-rose-300 border-rose-800/50",
    info: "bg-sky-950/50 text-sky-300 border-sky-800/40",
  };

  const sizes = {
    xs: "text-[11px] px-2 py-0.5",
    sm: "text-xs px-2.5 py-0.5",
    md: "text-sm px-3 py-1",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border ${
        variants[variant] || variants.default
      } ${sizes[size] || sizes.sm} ${className}`}
    >
      {children}
    </span>
  );
}
