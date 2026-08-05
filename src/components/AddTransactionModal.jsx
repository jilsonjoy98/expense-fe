import React, { useEffect, useRef, useState } from "react";
import { X, Image as ImageIcon, Loader2, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import api from "../api/axios";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, ACCOUNTS } from "../utils/format";

const TODAY = () => new Date().toISOString().slice(0, 10);

const emptyForm = (type) => ({
  type,
  amount: "",
  description: "",
  category: type === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
  date: TODAY(),
  account: ACCOUNTS[0],
});

export default function AddTransactionModal({ open, onClose, defaultType = "expense" }) {
  const [form, setForm] = useState(emptyForm(defaultType));
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(emptyForm(defaultType));
      setReceiptFile(null);
      setReceiptPreview(null);
      setError("");
    }
  }, [open, defaultType]);

  if (!open) return null;

  const categories = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (type) => {
    setForm((f) => ({
      ...f,
      type,
      category: type === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
    }));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReceiptFile(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.amount || Number(form.amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (receiptFile) fd.append("receiptImage", receiptFile);

      await api.post("/transactions", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      window.dispatchEvent(new CustomEvent("transaction-saved"));
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save transaction");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-surface-light dark:bg-surface-dark border border-black/[0.06] dark:border-white/[0.08] shadow-xl">
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08] bg-surface-light dark:bg-surface-dark">
          <h2 className="text-base font-semibold">Add Transaction</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-muted hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] p-1">
            <button
              type="button"
              onClick={() => handleTypeChange("expense")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition ${
                form.type === "expense"
                  ? "bg-surface-light dark:bg-surface-dark shadow-card text-status-critical"
                  : "text-ink-muted"
              }`}
            >
              <ArrowUpCircle size={16} /> Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("income")}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition ${
                form.type === "income"
                  ? "bg-surface-light dark:bg-surface-dark shadow-card text-status-good"
                  : "text-ink-muted"
              }`}
            >
              <ArrowDownCircle size={16} /> Income
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-sm">₹</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                required
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                className="input-field pl-7"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="e.g. Grocery run"
              className="input-field"
            />
          </div>

          {/* Category + Account */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="input-field"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
                Account
              </label>
              <select
                value={form.account}
                onChange={(e) => setForm((f) => ({ ...f, account: e.target.value }))}
                className="input-field"
              >
                {ACCOUNTS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
              Date
            </label>
            <input
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="input-field"
            />
          </div>

          {/* Receipt image */}
          <div>
            <label className="block text-xs font-medium text-ink-secondary-light dark:text-ink-secondary-dark mb-1.5">
              Receipt image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
            {receiptPreview ? (
              <div className="relative">
                <img
                  src={receiptPreview}
                  alt="Receipt preview"
                  className="h-32 w-full rounded-xl object-cover border border-black/10 dark:border-white/10"
                />
                <button
                  type="button"
                  onClick={() => {
                    setReceiptFile(null);
                    setReceiptPreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-black/15 dark:border-white/15 py-6 text-ink-muted hover:border-brand-500/50 hover:text-brand-500 transition"
              >
                <ImageIcon size={20} />
                <span className="text-xs font-medium">Upload receipt</span>
              </button>
            )}
          </div>

          {error && (
            <p className="text-sm text-status-critical bg-status-critical/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? "Saving..." : "Save Transaction"}
          </button>
        </form>
      </div>
    </div>
  );
}
