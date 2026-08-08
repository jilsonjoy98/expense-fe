import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import api from "../api/axios";

const TODAY = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  bankName: "",
  accountNumber: "",
  depositAmount: "",
  interestRate: "",
  depositPeriod: "",
  depositPeriodDays: "",
  startDate: TODAY(),
  endDate: "",
  matureAmount: "",
  description: "",
});

// Add whole months + days to a yyyy-mm-dd string, returned as yyyy-mm-dd.
function addPeriod(dateStr, months, days) {
  if (!dateStr || (!months && !days)) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  if (months) d.setMonth(d.getMonth() + Number(months));
  if (days) d.setDate(d.getDate() + Number(days));
  return d.toISOString().slice(0, 10);
}

// Simple-interest maturity estimate over the actual start→end span.
function estimateMaturity(principal, rate, startDate, endDate) {
  const p = Number(principal);
  const r = Number(rate);
  if (!p || !r || !startDate || !endDate) return "";
  const spanDays = (new Date(endDate) - new Date(startDate)) / 86400000;
  if (!spanDays || spanDays <= 0) return "";
  return (p * (1 + (r / 100) * (spanDays / 365))).toFixed(2);
}

export default function FdModal({ open, onClose, fd = null }) {
  const isEdit = Boolean(fd);
  const [form, setForm] = useState(emptyForm());
  const [touched, setTouched] = useState({ endDate: false, matureAmount: false });
  const [banks, setBanks] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    api
      .get("/fds/banks")
      .then(({ data }) => setBanks(data.banks || []))
      .catch(() => {});
    if (fd) {
      setForm({
        bankName: fd.bankName || "",
        accountNumber: fd.accountNumber || "",
        depositAmount: fd.depositAmount ?? "",
        interestRate: fd.interestRate ?? "",
        depositPeriod: fd.depositPeriod || "",
        depositPeriodDays: fd.depositPeriodDays || "",
        startDate: fd.startDate ? fd.startDate.slice(0, 10) : TODAY(),
        endDate: fd.endDate ? fd.endDate.slice(0, 10) : "",
        matureAmount: fd.matureAmount ?? "",
        description: fd.description || "",
      });
      setTouched({ endDate: true, matureAmount: true });
    } else {
      setForm(emptyForm());
      setTouched({ endDate: false, matureAmount: false });
    }
  }, [open, fd]);

  if (!open) return null;

  const update = (patch) =>
    setForm((f) => {
      const next = { ...f, ...patch };
      if (!touched.endDate) {
        next.endDate =
          addPeriod(next.startDate, next.depositPeriod, next.depositPeriodDays) || next.endDate;
      }
      if (!touched.matureAmount) {
        next.matureAmount =
          estimateMaturity(next.depositAmount, next.interestRate, next.startDate, next.endDate) ||
          next.matureAmount;
      }
      return next;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.depositPeriod && !form.depositPeriodDays) {
      setError("Enter a period of at least one month or day");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        depositAmount: Number(form.depositAmount),
        matureAmount: Number(form.matureAmount),
        interestRate: Number(form.interestRate),
        depositPeriod: Number(form.depositPeriod) || 0,
        depositPeriodDays: Number(form.depositPeriodDays) || 0,
      };
      if (isEdit) {
        await api.put(`/fds/${fd._id}`, payload);
      } else {
        await api.post("/fds", payload);
      }
      window.dispatchEvent(new CustomEvent("fd-saved"));
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save fixed deposit");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-surface-light dark:bg-surface-dark border border-black/[0.06] dark:border-white/[0.08] shadow-xl">
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08] bg-surface-light dark:bg-surface-dark">
          <h2 className="text-base font-semibold">{isEdit ? "Edit Fixed Deposit" : "Add Fixed Deposit"}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Bank + Account number (both optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
                Bank name
              </label>
              <input
                type="text"
                list="fd-bank-names"
                value={form.bankName}
                onChange={(e) => update({ bankName: e.target.value })}
                placeholder="e.g. HDFC Bank"
                className="input-field"
              />
              <datalist id="fd-bank-names">
                {banks.map((b) => (
                  <option key={b} value={b} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
                Account number
              </label>
              <input
                type="text"
                value={form.accountNumber}
                onChange={(e) => update({ accountNumber: e.target.value })}
                placeholder="e.g. 1234567890"
                className="input-field"
              />
            </div>
          </div>

          {/* Deposit amount + Interest rate */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
                Deposit amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-sm">₹</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  required
                  value={form.depositAmount}
                  onChange={(e) => update({ depositAmount: e.target.value })}
                  placeholder="0.00"
                  className="input-field pl-7"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
                Interest rate
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  required
                  value={form.interestRate}
                  onChange={(e) => update({ interestRate: e.target.value })}
                  placeholder="7.5"
                  className="input-field pr-7"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-sm">%</span>
              </div>
            </div>
          </div>

          {/* Deposit period: months + days */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
                Period (months)
              </label>
              <input
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                value={form.depositPeriod}
                onChange={(e) => update({ depositPeriod: e.target.value })}
                placeholder="12"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
                Period (days)
              </label>
              <input
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                value={form.depositPeriodDays}
                onChange={(e) => update({ depositPeriodDays: e.target.value })}
                placeholder="0"
                className="input-field"
              />
            </div>
          </div>

          {/* Start date + End date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
                Start date
              </label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => update({ startDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
                End date
              </label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => {
                  setTouched((t) => ({ ...t, endDate: true }));
                  setForm((f) => ({ ...f, endDate: e.target.value }));
                }}
                className="input-field"
              />
            </div>
          </div>

          {/* Maturity amount */}
          <div>
            <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
              Maturity amount
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-sm">₹</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                required
                value={form.matureAmount}
                onChange={(e) => {
                  setTouched((t) => ({ ...t, matureAmount: true }));
                  setForm((f) => ({ ...f, matureAmount: e.target.value }));
                }}
                placeholder="0.00"
                className="input-field pl-7"
              />
            </div>
          </div>
          <p className="text-xs text-ink-muted -mt-2">
            End date and maturity amount are estimated from the period and rate — edit either to override.
          </p>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              placeholder="Optional note"
              className="input-field"
            />
          </div>

          {error && (
            <p className="text-sm text-status-critical bg-status-critical/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? "Saving..." : isEdit ? "Update Fixed Deposit" : "Save Fixed Deposit"}
          </button>
        </form>
      </div>
    </div>
  );
}
