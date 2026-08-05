import React from "react";
import { NavLink } from "react-router-dom";
import { Plus, LogOut, Moon, Sun, Wallet } from "lucide-react";
import { NAV_ITEMS } from "./navConfig.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Sidebar({ onAddClick }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-black/[0.06] dark:border-white/[0.08] bg-surface-light dark:bg-surface-dark">
      <div className="flex items-center gap-2 px-6 h-16 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-white">
          <Wallet size={18} />
        </div>
        <span className="font-semibold text-[15px] tracking-tight">Centsible</span>
      </div>

      <div className="px-4 mt-2">
        <button onClick={onAddClick} className="btn-primary w-full">
          <Plus size={18} />
          Add Transaction
        </button>
      </div>

      <nav className="flex-1 px-3 mt-6 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-brand-500/10 text-brand-600 dark:text-brand-300"
                  : "text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-black/[0.06] dark:border-white/[0.08] space-y-1">
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-secondary-light dark:text-ink-secondary-dark hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-300 text-sm font-semibold">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-ink-muted">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            title="Log out"
            className="shrink-0 rounded-lg p-1.5 text-ink-muted hover:bg-black/[0.06] dark:hover:bg-white/[0.08] hover:text-status-critical transition"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
