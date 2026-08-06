import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { Download, TrendingUp, TrendingDown, Scale } from "lucide-react";
import api from "../api/axios";
import StatCard from "../components/StatCard.jsx";
import ChartTooltip from "../components/ChartTooltip.jsx";
import TransactionList from "../components/TransactionList.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { formatCurrency, formatCompactINR, formatDate, colorForIndex } from "../utils/format";

const RANGES = [
  { key: "this-month", label: "This Month" },
  { key: "3m", label: "Last 3 Months" },
  { key: "6m", label: "Last 6 Months" },
  { key: "year", label: "This Year" },
  { key: "all", label: "All Time" },
];

function getRangeDates(key) {
  const now = new Date();
  switch (key) {
    case "this-month":
      return { from: new Date(now.getFullYear(), now.getMonth(), 1) };
    case "3m":
      return { from: new Date(now.getFullYear(), now.getMonth() - 2, 1) };
    case "6m":
      return { from: new Date(now.getFullYear(), now.getMonth() - 5, 1) };
    case "year":
      return { from: new Date(now.getFullYear(), 0, 1) };
    default:
      return {};
  }
}

export default function Reports() {
  const [range, setRange] = useState("this-month");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const gridColor = theme === "dark" ? "#2c2c2a" : "#e1e0d9";
  const axisColor = "#898781";

  const load = useCallback(async () => {
    setLoading(true);
    const { from } = getRangeDates(range);
    const params = {};
    if (from) params.from = from.toISOString();
    const { data } = await api.get("/transactions", { params });
    setTransactions(data.transactions);
    setLoading(false);
  }, [range]);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("transaction-saved", handler);
    return () => window.removeEventListener("transaction-saved", handler);
  }, [load]);

  const { totalIncome, totalExpense, byExpenseCategory, byIncomeCategory } = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;
    const expenseMap = new Map();
    const incomeMap = new Map();

    for (const t of transactions) {
      if (t.type === "income") {
        totalIncome += t.amount;
        incomeMap.set(t.category, (incomeMap.get(t.category) || 0) + t.amount);
      } else {
        totalExpense += t.amount;
        expenseMap.set(t.category, (expenseMap.get(t.category) || 0) + t.amount);
      }
    }

    const toSorted = (map) =>
      [...map.entries()]
        .map(([category, total]) => ({ category, total }))
        .sort((a, b) => b.total - a.total);

    return {
      totalIncome,
      totalExpense,
      byExpenseCategory: toSorted(expenseMap),
      byIncomeCategory: toSorted(incomeMap),
    };
  }, [transactions]);

  const net = totalIncome - totalExpense;

  const handleExportCsv = () => {
    const header = ["Date", "Type", "Category", "Account", "Description", "Amount"];
    const rows = transactions.map((t) => [
      formatDate(t.date),
      t.type,
      t.category,
      t.account,
      (t.description || "").replace(/,/g, " "),
      t.amount,
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Reports</h1>
          <p className="text-sm text-ink-muted mt-0.5">Analyze your spending and income</p>
        </div>
        <button onClick={handleExportCsv} className="btn-secondary self-start sm:self-auto">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Range selector */}
      <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-1 px-1">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium border transition ${
              range === r.key
                ? "bg-brand-500 text-white border-brand-500"
                : "border-black/10 dark:border-white/10 text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total Income" value={formatCurrency(totalIncome)} icon={TrendingUp} tone="good" />
            <StatCard label="Total Expenses" value={formatCurrency(totalExpense)} icon={TrendingDown} tone="critical" />
            <StatCard
              label="Net Savings"
              value={formatCurrency(net)}
              icon={Scale}
              tone={net >= 0 ? "good" : "critical"}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReportBarCard title="Expenses by Category" data={byExpenseCategory} gridColor={gridColor} axisColor={axisColor} />
            <ReportBarCard title="Income by Category" data={byIncomeCategory} gridColor={gridColor} axisColor={axisColor} />
          </div>

          <div className="card p-5">
            <h2 className="text-sm font-semibold mb-1">All Transactions</h2>
            <TransactionList transactions={transactions} emptyMessage="No transactions in this range" />
          </div>
        </>
      )}
    </div>
  );
}

function ReportBarCard({ title, data, gridColor, axisColor }) {
  return (
    <div className="card p-5">
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      {data.length === 0 ? (
        <div className="py-12 text-center text-sm text-ink-muted">No data for this range</div>
      ) : (
        <div style={{ height: Math.max(160, data.length * 40) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }} barCategoryGap={10}>
              <CartesianGrid horizontal={false} stroke={gridColor} />
              <XAxis
                type="number"
                tick={{ fill: axisColor, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={formatCompactINR}
              />
              <YAxis
                type="category"
                dataKey="category"
                tick={{ fill: axisColor, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                width={110}
              />
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <ChartTooltip active={active} payload={[{ ...payload[0], name: payload[0].payload.category }]} />
                  ) : null
                }
                cursor={{ fill: "rgba(137,135,129,0.08)" }}
              />
              <Bar dataKey="total" name="Amount" radius={[0, 4, 4, 0]} barSize={18}>
                {data.map((entry, i) => (
                  <Cell key={entry.category} fill={colorForIndex(i)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
