import React, { useCallback, useEffect, useState } from "react";
import { Plus, ArrowDownCircle, ArrowUpCircle, X } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import api from "../api/axios";
import TransactionList from "../components/TransactionList.jsx";
import StatCard from "../components/StatCard.jsx";
import { formatCurrency, monthRangeFromValue, currentMonthValue } from "../utils/format";

export default function TransactionsPage({ type }) {
  const { openAddModal } = useOutletContext() || {};
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState(currentMonthValue());

  const isIncome = type === "income";
  const title = isIncome ? "Income" : "Expenses";
  const Icon = isIncome ? ArrowDownCircle : ArrowUpCircle;

  const load = useCallback(async () => {
    setLoading(true);
    const { from, to } = monthRangeFromValue(monthFilter);
    const params = { type };
    if (from) params.from = from.toISOString();
    if (to) params.to = to.toISOString();
    const { data } = await api.get("/transactions", { params });
    setTransactions(data.transactions);
    setLoading(false);
  }, [type, monthFilter]);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("transaction-saved", handler);
    return () => window.removeEventListener("transaction-saved", handler);
  }, [load]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    await api.delete(`/transactions/${id}`);
    setTransactions((prev) => prev.filter((t) => t._id !== id));
  };

  const total = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => openAddModal?.(type)} className="hidden sm:inline-flex btn-primary">
          <Plus size={18} />
          Add {title}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="input-field w-auto"
        />
        {monthFilter && (
          <button
            onClick={() => setMonthFilter("")}
            title="Show all time"
            className="rounded-lg p-1.5 text-ink-muted hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:text-brand-500 transition"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <StatCard
        label={`Total ${title}`}
        value={formatCurrency(total)}
        icon={Icon}
        tone={isIncome ? "good" : "critical"}
      />

      <div className="card p-5">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        ) : (
          <TransactionList
            transactions={transactions}
            onDelete={handleDelete}
            emptyMessage={
              monthFilter ? `No ${title.toLowerCase()} in this month` : `No ${title.toLowerCase()} recorded yet`
            }
          />
        )}
      </div>
    </div>
  );
}
