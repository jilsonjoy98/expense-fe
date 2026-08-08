import React, { useCallback, useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Wallet, TrendingUp, TrendingDown, PiggyBank, X } from "lucide-react";
import api from "../api/axios";
import StatCard from "../components/StatCard.jsx";
import TransactionList from "../components/TransactionList.jsx";
import ChartTooltip from "../components/ChartTooltip.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { formatCurrency, formatDate, colorForIndex, formatCompactINR, currentMonthValue } from "../utils/format";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState(currentMonthValue());
  const { theme } = useTheme();

  const gridColor = theme === "dark" ? "#2c2c2a" : "#e1e0d9";
  const axisColor = "#898781";
  const seriesIncome = theme === "dark" ? "#3987e5" : "#2a78d6";
  const seriesExpense = theme === "dark" ? "#d95926" : "#eb6834";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/dashboard", { params: { month: monthFilter || undefined } });
      setData(data);
    } finally {
      setLoading(false);
    }
  }, [monthFilter]);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("transaction-saved", handler);
    return () => window.removeEventListener("transaction-saved", handler);
  }, [load]);

  const {
    month: dataMonth,
    totalBalance = 0,
    monthlyIncome = 0,
    monthlyExpenses = 0,
    expensesByCategory = [],
    cashFlow = [],
    deposits = [],
    recentTransactions = [],
  } = data || {};

  const activeMonth = monthFilter || dataMonth;
  const monthLabel = activeMonth
    ? new Date(`${activeMonth}-01`).toLocaleString("default", { month: "short", year: "numeric" })
    : "This month";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-ink-muted mt-0.5">Your financial overview</p>
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
              title="Clear filter"
              className="rounded-lg p-1.5 text-ink-muted hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:text-brand-500 transition"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Balance"
              value={formatCurrency(totalBalance)}
              icon={Wallet}
              tone="default"
            />
            <StatCard
              label="Monthly Income"
              value={formatCurrency(monthlyIncome)}
              icon={TrendingUp}
              tone="good"
              sub={monthLabel}
            />
            <StatCard
              label="Monthly Expenses"
              value={formatCurrency(monthlyExpenses)}
              icon={TrendingDown}
              tone="critical"
              sub={monthLabel}
            />
          </div>

          {/* Cash flow */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold">Cash Flow</h2>
              <span className="text-xs text-ink-muted">6 months ending {monthLabel}</span>
            </div>
            <div className="h-64 mt-3 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashFlow} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={seriesIncome} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={seriesIncome} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={seriesExpense} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={seriesExpense} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke={gridColor} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: axisColor, fontSize: 12 }}
                    axisLine={{ stroke: gridColor }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: axisColor, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                    tickFormatter={formatCompactINR}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: gridColor }} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 12, color: axisColor }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke={seriesIncome}
                    strokeWidth={2}
                    fill="url(#incomeGrad)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Expense"
                    stroke={seriesExpense}
                    strokeWidth={2}
                    fill="url(#expenseGrad)"
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly expenses by category */}
            <div className="card p-5">
              <h2 className="text-sm font-semibold mb-3">Expenses by Category — {monthLabel}</h2>
              {expensesByCategory.length === 0 ? (
                <div className="py-12 text-center text-sm text-ink-muted">No expenses this month yet</div>
              ) : (
                <div style={{ height: Math.max(160, expensesByCategory.length * 40) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={expensesByCategory}
                      layout="vertical"
                      margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
                      barCategoryGap={10}
                    >
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
                        dataKey="_id"
                        tick={{ fill: axisColor, fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        width={110}
                      />
                      <Tooltip
                        content={({ active, payload }) =>
                          active && payload?.length ? (
                            <ChartTooltip
                              active={active}
                              payload={[{ ...payload[0], name: payload[0].payload._id }]}
                            />
                          ) : null
                        }
                        cursor={{ fill: "rgba(137,135,129,0.08)" }}
                      />
                      <Bar dataKey="total" name="Amount" radius={[0, 4, 4, 0]} barSize={18}>
                        {expensesByCategory.map((entry, i) => (
                          <Cell key={entry._id} fill={colorForIndex(i)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Deposits */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <PiggyBank size={16} className="text-status-good" />
                <h2 className="text-sm font-semibold">{monthFilter ? `Deposits — ${monthLabel}` : "Recent Deposits"}</h2>
              </div>
              {deposits.length === 0 ? (
                <div className="py-12 text-center text-sm text-ink-muted">
                  {monthFilter ? "No income recorded this month" : "No income recorded yet"}
                </div>
              ) : (
                <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                  {deposits.map((d) => (
                    <li key={d._id} className="flex items-center justify-between py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{d.description || d.category}</p>
                        <p className="text-xs text-ink-muted">{formatDate(d.date)}</p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-status-good shrink-0">
                        +{formatCurrency(d.amount)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Recent transactions */}
          <div className="card p-5">
            <h2 className="text-sm font-semibold mb-1">
              {monthFilter ? `Transactions — ${monthLabel}` : "Recent Transactions"}
            </h2>
            <TransactionList
              transactions={recentTransactions}
              emptyMessage={monthFilter ? "No transactions this month" : "No transactions yet"}
            />
          </div>
        </>
      )}
    </div>
  );
}
