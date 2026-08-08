import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, LineChart, TrendingUp, TrendingDown, Wallet, Pencil, Trash2 } from "lucide-react";
import api from "../api/axios";
import StatCard from "../components/StatCard.jsx";
import MfModal from "../components/MfModal.jsx";
import { formatCurrency, formatDate } from "../utils/format";

export default function MutualFunds() {
  const [mfs, setMfs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMf, setEditingMf] = useState(null);

  const load = useCallback(async () => {
    const { data } = await api.get("/mfs");
    setMfs(data.mfs);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("mf-saved", handler);
    return () => window.removeEventListener("mf-saved", handler);
  }, [load]);

  const openAdd = () => {
    setEditingMf(null);
    setModalOpen(true);
  };

  const openEdit = (mf) => {
    setEditingMf(mf);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this mutual fund entry?")) return;
    await api.delete(`/mfs/${id}`);
    setMfs((prev) => prev.filter((m) => m._id !== id));
  };

  const totalInvested = mfs.reduce((sum, m) => sum + m.investedAmount, 0);
  const totalCurrent = mfs.reduce((sum, m) => sum + m.currentValue, 0);
  const totalGain = totalCurrent - totalInvested;
  const gainPct = totalInvested ? (totalGain / totalInvested) * 100 : 0;

  const gainFor = (mf) => mf.currentValue - mf.investedAmount;
  const gainPctFor = (mf) => (mf.investedAmount ? (gainFor(mf) / mf.investedAmount) * 100 : 0);

  // Group by fund (untitled ones bucket under "Other"); each group keeps the
  // API's investmentDate-descending order, and groups are ordered by
  // whichever fund has the most invested overall.
  const fundGroups = useMemo(() => {
    const byFund = new Map();
    for (const mf of mfs) {
      const key = mf.fundName || "Other";
      if (!byFund.has(key)) byFund.set(key, []);
      byFund.get(key).push(mf);
    }
    return [...byFund.entries()]
      .map(([fundName, items]) => ({
        fundName,
        items,
        invested: items.reduce((sum, m) => sum + m.investedAmount, 0),
        current: items.reduce((sum, m) => sum + m.currentValue, 0),
      }))
      .sort((a, b) => b.invested - a.invested);
  }, [mfs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Mutual Funds</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {mfs.length} investment{mfs.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={openAdd} className="hidden sm:inline-flex btn-primary">
          <Plus size={18} />
          Add Mutual Fund
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Invested" value={formatCurrency(totalInvested)} icon={Wallet} tone="default" />
        <StatCard
          label="Current Value"
          value={formatCurrency(totalCurrent)}
          icon={LineChart}
          tone="good"
          sub={`${mfs.length} holding${mfs.length !== 1 ? "s" : ""}`}
        />
        <StatCard
          label="Gain / Loss"
          value={`${totalGain >= 0 ? "+" : ""}${formatCurrency(totalGain)}`}
          icon={totalGain >= 0 ? TrendingUp : TrendingDown}
          tone={totalGain >= 0 ? "good" : "critical"}
          sub={`${totalGain >= 0 ? "+" : ""}${gainPct.toFixed(1)}%`}
        />
      </div>

      {loading ? (
        <div className="card p-5 flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : mfs.length === 0 ? (
        <div className="card p-5 py-12 text-center text-sm text-ink-muted">No mutual funds added yet</div>
      ) : (
        <div className="space-y-5">
          {fundGroups.map((group) => {
            const groupGain = group.current - group.invested;
            return (
              <div key={group.fundName} className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <LineChart size={16} className="text-brand-600 dark:text-brand-300 shrink-0" />
                    <h2 className="text-sm font-semibold truncate">{group.fundName}</h2>
                    <span className="text-xs text-ink-muted shrink-0">
                      {group.items.length} entr{group.items.length !== 1 ? "ies" : "y"}
                    </span>
                  </div>
                  <div
                    className={`text-xs shrink-0 text-right font-medium ${
                      groupGain >= 0 ? "text-status-good" : "text-status-critical"
                    }`}
                  >
                    {formatCurrency(group.invested)} → {formatCurrency(group.current)}
                  </div>
                </div>

                <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                  {group.items.map((mf) => {
                    const gain = gainFor(mf);
                    const pct = gainPctFor(mf);
                    return (
                      <li key={mf._id} className="flex items-center gap-3 py-3.5">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {mf.description || (mf.folioNumber ? `Folio ${mf.folioNumber}` : mf.investmentType)}
                            </p>
                            <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium bg-brand-500/10 text-brand-600 dark:text-brand-300">
                              {mf.investmentType}
                            </span>
                          </div>
                          <p className="text-xs text-ink-muted truncate">
                            {[
                              mf.folioNumber && `Folio ${mf.folioNumber}`,
                              mf.category,
                              mf.units ? `${mf.units} units` : null,
                              formatDate(mf.investmentDate),
                            ]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-0.5 shrink-0">
                          <span className="text-sm font-semibold tabular-nums">
                            {formatCurrency(mf.currentValue)}
                          </span>
                          <span
                            className={`text-xs tabular-nums ${
                              gain >= 0 ? "text-status-good" : "text-status-critical"
                            }`}
                          >
                            {gain >= 0 ? "+" : ""}
                            {formatCurrency(gain)} ({gain >= 0 ? "+" : ""}
                            {pct.toFixed(1)}%)
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEdit(mf)}
                            title="Edit"
                            className="rounded-lg p-1.5 text-ink-muted hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:text-brand-500 transition"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(mf._id)}
                            title="Delete"
                            className="rounded-lg p-1.5 text-ink-muted hover:bg-status-critical/10 hover:text-status-critical transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      <MfModal open={modalOpen} onClose={() => setModalOpen(false)} mf={editingMf} />
    </div>
  );
}
