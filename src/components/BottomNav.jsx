import React from "react";
import { NavLink } from "react-router-dom";
import { Plus } from "lucide-react";
import { NAV_ITEMS } from "./navConfig.js";

export default function BottomNav({ onAddClick }) {
  const [left, right] = [NAV_ITEMS.slice(0, 2), NAV_ITEMS.slice(2)];

  const linkClass = ({ isActive }) =>
    `flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition ${
      isActive ? "text-brand-600 dark:text-brand-300" : "text-ink-muted"
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 safe-bottom border-t border-black/[0.06] dark:border-white/[0.08] bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur">
      <div className="flex items-center px-1">
        {left.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass}>
            <Icon size={20} />
            {label}
          </NavLink>
        ))}

        <div className="flex flex-1 items-center justify-center">
          <button
            onClick={onAddClick}
            aria-label="Add transaction"
            className="-translate-y-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/30 active:scale-95 transition"
          >
            <Plus size={26} />
          </button>
        </div>

        {right.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass}>
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
