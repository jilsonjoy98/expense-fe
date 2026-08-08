import React, { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import api from "../api/axios";

const TODAY = () => new Date().toISOString().slice(0, 10);

const emptyForm = () => ({
  fundName: "",
  folioNumber: "",
  investmentType: "Lumpsum",
  category: "",
  investmentDate: TODAY(),
  investedAmount: "",
  currentValue: "",
  units: "",
  description: "",
});

const CATEGORIES = ["Equity", "Debt", "Hybrid", "Index", "ELSS", "Liquid", "Other"];

export default function MfModal({ open, onClose, mf = null }) {
  const isEdit = Boolean(mf);
  const [form, setForm] = useState(emptyForm());
  const [funds, setFunds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    api
      .get("/mfs/funds")
      .then(({ data }) => setFunds(data.funds || []))
      .catch(() => {});
    if (mf) {
      setForm({
        fundName: mf.fundName || "",
        folioNumber: mf.folioNumber || "",
        investmentType: mf.investmentType || "Lumpsum",
        category: mf.category || "",
        investmentDate: mf.investmentDate ? mf.investmentDate.slice(0, 10) : TODAY(),
        investedAmount: mf.investedAmount ?? "",
        currentValue: mf.currentValue ?? "",
        units: mf.units || "",
        description: mf.description || "",
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, mf]);

  if (!open) return null;

  const update = (patch) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        investedAmount: Number(form.investedAmount),
        currentValue: Number(form.currentValue),
        units: Number(form.units) || 0,
      };
      if (isEdit) {
        await api.put(`/mfs/${mf._id}`, payload);
      } else {
        await api.post("/mfs", payload);
      }
      window.dispatchEvent(new CustomEvent("mf-saved"));
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save mutual fund");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-surface-light dark:bg-surface-dark border border-black/[0.06] dark:border-white/[0.08] shadow-xl">
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08] bg-surface-light dark:bg-surface-dark">
          <h2 className="text-base font-semibold">{isEdit ? "Edit Mutual Fund" : "Add Mutual Fund"}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Fund name (optional, existing-or-new) */}
          <div>
            <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
              Fund name
            </label>
            <input
              type="text"
              list="mf-fund-names"
              value={form.fundName}
              onChange={(e) => update({ fundName: e.target.value })}
              placeholder="e.g. Parag Parikh Flexi Cap Fund"
              className="input-field"
            />
            <datalist id="mf-fund-names">
              {funds.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </div>

          {/* Folio number + Investment type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
                Folio number
              </label>
              <input
                type="text"
                value={form.folioNumber}
                onChange={(e) => update({ folioNumber: e.target.value })}
                placeholder="e.g. 123456/78"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
                Investment type
              </label>
              <select
                value={form.investmentType}
                onChange={(e) => update({ investmentType: e.target.value })}
                className="input-field"
              >
                <option value="Lumpsum">Lumpsum</option>
                <option value="SIP">SIP</option>
              </select>
            </div>
          </div>

          {/* Category + Investment date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => update({ category: e.target.value })}
                className="input-field"
              >
                <option value="">—</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
                Investment date
              </label>
              <input
                type="date"
                required
                value={form.investmentDate}
                onChange={(e) => update({ investmentDate: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          {/* Invested amount + Current value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
                Invested amount
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-sm">₹</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  required
                  value={form.investedAmount}
                  onChange={(e) => update({ investedAmount: e.target.value })}
                  placeholder="0.00"
                  className="input-field pl-7"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
                Current value
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-sm">₹</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  required
                  value={form.currentValue}
                  onChange={(e) => update({ currentValue: e.target.value })}
                  placeholder="0.00"
                  className="input-field pl-7"
                />
              </div>
            </div>
          </div>
          <p className="text-xs text-ink-muted -mt-2">
            Update current value anytime to keep gain/loss accurate — mutual funds don't mature like FDs.
          </p>

          {/* Units */}
          <div>
            <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
              Units (optional)
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.0001"
              min="0"
              value={form.units}
              onChange={(e) => update({ units: e.target.value })}
              placeholder="0"
              className="input-field"
            />
          </div>

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
            {submitting ? "Saving..." : isEdit ? "Update Mutual Fund" : "Save Mutual Fund"}
          </button>
        </form>
      </div>
    </div>
  );
}
