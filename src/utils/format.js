export const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function formatCurrency(amount) {
  return currencyFormatter.format(amount || 0);
}

// Compact axis labels using Indian numbering (thousand/lakh/crore).
export function formatCompactINR(value) {
  const v = Number(value) || 0;
  const abs = Math.abs(v);
  if (abs >= 1e7) return `₹${(v / 1e7).toFixed(abs % 1e7 === 0 ? 0 : 1)}Cr`;
  if (abs >= 1e5) return `₹${(v / 1e5).toFixed(abs % 1e5 === 0 ? 0 : 1)}L`;
  if (abs >= 1e3) return `₹${(v / 1e3).toFixed(abs % 1e3 === 0 ? 0 : 1)}k`;
  return `₹${v}`;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Groceries",
  "Transport",
  "Housing",
  "Utilities",
  "Entertainment",
  "Health",
  "Shopping",
  "Education",
  "Travel",
  "Other",
];

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Refund",
  "Other",
];

export const ACCOUNTS = ["Cash", "Bank", "Credit Card", "Wallet", "Savings"];

// Fixed categorical palette order (dataviz skill) — never cycle/reorder.
export const CATEGORY_COLORS = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
  "#e34948", // red
];

export function colorForIndex(i) {
  return CATEGORY_COLORS[i % CATEGORY_COLORS.length];
}
