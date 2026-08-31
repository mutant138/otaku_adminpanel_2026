import React from "react";

export function LoadingSpinner({ size = "md", text = "Loading..." }) {
  const sizes = {
    sm: "w-4 h-4 border-2",
    md: "w-7 h-7 border-3",
    lg: "w-10 h-10 border-3",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div
        className={`${sizes[size] || sizes.md} rounded-full border-rose-500/20 border-t-rose-500 animate-spin`}
      />
      {text && <p className="text-xs font-medium text-slate-400">{text}</p>}
    </div>
  );
}

export function EmptyState({ icon, title = "No items found", description = "There are no records matching your request.", action }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center">
      {icon && (
        <div className="p-3.5 mb-3 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-slate-400">
          {icon}
        </div>
      )}
      <h4 className="text-base font-semibold text-slate-200 mb-1">{title}</h4>
      <p className="text-xs text-slate-400 max-w-sm mb-4 leading-relaxed">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

export default LoadingSpinner;
