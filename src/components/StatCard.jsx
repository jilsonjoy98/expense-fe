import React from "react";

export default function StatCard({ label, value, icon: Icon, tone = "default", sub }) {
  const toneClasses = {
    default: "bg-brand-500/10 text-brand-600 dark:text-brand-300",
    good: "bg-status-good/10 text-status-good",
    critical: "bg-status-critical/10 text-status-critical",
  };

  return (
    <div className="card p-5 flex items-start justify-between">
      <div className="min-w-0">
        <p className="text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark">
          {label}
        </p>
        <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums truncate">
          {value}
        </p>
        {sub && <p className="mt-1 text-xs text-ink-muted">{sub}</p>}
      </div>
      {Icon && (
        <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
          <Icon size={20} />
        </div>
      )}
    </div>
  );
}
