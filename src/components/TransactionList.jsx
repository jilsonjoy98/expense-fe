import React from "react";
import { Trash2, Receipt, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { formatCurrency, formatDate } from "../utils/format";

export default function TransactionList({ transactions, onDelete, emptyMessage = "No transactions yet" }) {
  if (!transactions?.length) {
    return (
      <div className="py-12 text-center text-sm text-ink-muted">{emptyMessage}</div>
    );
  }

  return (
    <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
      {transactions.map((t) => (
        <li key={t._id} className="flex items-center gap-3 py-3.5">
          <div
            className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-full ${
              t.type === "income"
                ? "bg-status-good/10 text-status-good"
                : "bg-status-critical/10 text-status-critical"
            }`}
          >
            {t.type === "income" ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate">
              {t.description || t.category}
            </p>
            <p className="text-xs text-ink-muted truncate">
              {t.category} · {t.account} · {formatDate(t.date)}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {t.receiptImage && (
              <a
                href={t.receiptImage}
                target="_blank"
                rel="noreferrer"
                title="View receipt"
                className="rounded-lg p-1.5 text-ink-muted hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:text-brand-500 transition"
              >
                <Receipt size={16} />
              </a>
            )}
            <span
              className={`text-sm font-semibold tabular-nums ${
                t.type === "income" ? "text-status-good" : "text-status-critical"
              }`}
            >
              {t.type === "income" ? "+" : "-"}
              {formatCurrency(t.amount)}
            </span>
            {onDelete && (
              <button
                onClick={() => onDelete(t._id)}
                title="Delete"
                className="rounded-lg p-1.5 text-ink-muted hover:bg-status-critical/10 hover:text-status-critical transition"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
