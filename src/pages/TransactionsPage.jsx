import React, { useCallback, useEffect, useState } from "react";
import { Plus, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import api from "../api/axios";
import TransactionList from "../components/TransactionList.jsx";
import StatCard from "../components/StatCard.jsx";
import { formatCurrency } from "../utils/format";

export default function TransactionsPage({ type }) {
  const { openAddModal } = useOutletContext() || {};
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const isIncome = type === "income";
  const title = isIncome ? "Income" : "Expenses";
  const Icon = isIncome ? ArrowDownCircle : ArrowUpCircle;

  const load = useCallback(async () => {
    const { data } = await api.get("/transactions", { params: { type } });
    setTransactions(data.transactions);
    setLoading(false);
  }, [type]);

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
            emptyMessage={`No ${title.toLowerCase()} recorded yet`}
          />
        )}
      </div>
    </div>
  );
}
