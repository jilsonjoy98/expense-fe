import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, Landmark, TrendingUp, Wallet, Pencil, Trash2 } from "lucide-react";
import api from "../api/axios";
import StatCard from "../components/StatCard.jsx";
import FdModal from "../components/FdModal.jsx";
import { formatCurrency, formatDate } from "../utils/format";

export default function FixedDeposits() {
  const [fds, setFds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFd, setEditingFd] = useState(null);

  const load = useCallback(async () => {
    const { data } = await api.get("/fds");
    setFds(data.fds);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener("fd-saved", handler);
    return () => window.removeEventListener("fd-saved", handler);
  }, [load]);

  const openAdd = () => {
    setEditingFd(null);
    setModalOpen(true);
  };

  const openEdit = (fd) => {
    setEditingFd(fd);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this fixed deposit?")) return;
    await api.delete(`/fds/${id}`);
    setFds((prev) => prev.filter((f) => f._id !== id));
  };

  const totalInvested = fds.reduce((sum, f) => sum + f.depositAmount, 0);
  const totalMaturity = fds.reduce((sum, f) => sum + f.matureAmount, 0);
  const totalInterest = totalMaturity - totalInvested;
  const isMatured = (fd) => new Date(fd.endDate) < new Date();

  const formatPeriod = (fd) => {
    const parts = [];
    if (fd.depositPeriod) parts.push(`${fd.depositPeriod}mo`);
    if (fd.depositPeriodDays) parts.push(`${fd.depositPeriodDays}d`);
    return parts.join(" ") || "—";
  };

  // Group by bank (untitled ones bucket under "Other"); each group keeps the
  // API's endDate-ascending order, and groups are ordered by their
  // soonest-maturing FD.
  const bankGroups = useMemo(() => {
    const byBank = new Map();
    for (const fd of fds) {
      const key = fd.bankName || "Other";
      if (!byBank.has(key)) byBank.set(key, []);
      byBank.get(key).push(fd);
    }
    return [...byBank.entries()]
      .map(([bankName, items]) => ({
        bankName,
        items,
        invested: items.reduce((sum, f) => sum + f.depositAmount, 0),
        maturity: items.reduce((sum, f) => sum + f.matureAmount, 0),
        soonestEndDate: items[0]?.endDate,
      }))
      .sort((a, b) => new Date(a.soonestEndDate) - new Date(b.soonestEndDate));
  }, [fds]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Fixed Deposits</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {fds.length} deposit{fds.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={openAdd} className="hidden sm:inline-flex btn-primary">
          <Plus size={18} />
          Add Fixed Deposit
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Invested" value={formatCurrency(totalInvested)} icon={Wallet} tone="default" />
        <StatCard
          label="Maturity Value"
          value={formatCurrency(totalMaturity)}
          icon={Landmark}
          tone="good"
          sub={`${fds.length} FD${fds.length !== 1 ? "s" : ""}`}
        />
        <StatCard
          label="Interest Earned"
          value={formatCurrency(totalInterest)}
          icon={TrendingUp}
          tone="good"
          sub="At maturity"
        />
      </div>

      {loading ? (
        <div className="card p-5 flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : fds.length === 0 ? (
        <div className="card p-5 py-12 text-center text-sm text-ink-muted">No fixed deposits added yet</div>
      ) : (
        <div className="space-y-5">
          {bankGroups.map((group) => (
            <div key={group.bankName} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Landmark size={16} className="text-brand-600 dark:text-brand-300 shrink-0" />
                  <h2 className="text-sm font-semibold truncate">{group.bankName}</h2>
                  <span className="text-xs text-ink-muted shrink-0">
                    {group.items.length} FD{group.items.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="text-xs text-ink-muted shrink-0 text-right">
                  {formatCurrency(group.invested)} → {formatCurrency(group.maturity)}
                </div>
              </div>

              <ul className="divide-y divide-black/[0.06] dark:divide-white/[0.08]">
                {group.items.map((fd) => {
                  const matured = isMatured(fd);
                  const metaParts = [
                    fd.accountNumber && `A/C ${fd.accountNumber}`,
                    `${fd.interestRate}%`,
                    formatPeriod(fd),
                    `${formatDate(fd.startDate)} – ${formatDate(fd.endDate)}`,
                  ].filter(Boolean);
                  return (
                    <li key={fd._id} className="flex items-center gap-3 py-3.5">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {fd.description || (fd.accountNumber ? `A/C ${fd.accountNumber}` : "Fixed Deposit")}
                          </p>
                          <span
                            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              matured
                                ? "bg-status-good/10 text-status-good"
                                : "bg-brand-500/10 text-brand-600 dark:text-brand-300"
                            }`}
                          >
                            {matured ? "Matured" : "Active"}
                          </span>
                        </div>
                        <p className="text-xs text-ink-muted truncate">{metaParts.join(" · ")}</p>
                      </div>

                      <div className="flex flex-col items-end gap-0.5 shrink-0">
                        <span className="text-sm font-semibold tabular-nums text-status-good">
                          {formatCurrency(fd.matureAmount)}
                        </span>
                        <span className="text-xs text-ink-muted tabular-nums">
                          from {formatCurrency(fd.depositAmount)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => openEdit(fd)}
                          title="Edit"
                          className="rounded-lg p-1.5 text-ink-muted hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:text-brand-500 transition"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(fd._id)}
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
          ))}
        </div>
      )}

      <FdModal open={modalOpen} onClose={() => setModalOpen(false)} fd={editingFd} />
    </div>
  );
}
