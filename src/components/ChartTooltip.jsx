import React from "react";
import { formatCurrency } from "../utils/format";

export default function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-black/10 dark:border-white/10 bg-surface-light dark:bg-surface-dark px-3 py-2 shadow-card text-xs">
      {label && <p className="font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1">{label}</p>}
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 whitespace-nowrap">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: p.color || p.fill }} />
          <span className="text-ink-secondary-light dark:text-ink-secondary-dark">{p.name}:</span>
          <span className="font-semibold tabular-nums">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
}
