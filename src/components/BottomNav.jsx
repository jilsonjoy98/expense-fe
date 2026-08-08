import React from "react";
import { NavLink } from "react-router-dom";
import { NAV_ITEMS } from "./navConfig.js";

export default function BottomNav() {
  const renderLink = ({ to, label, icon: Icon, end }) => (
    <NavLink
      key={to}
      to={to}
      end={end}
      className="flex flex-1 items-center justify-center py-2.5 text-[11px] font-medium transition"
    >
      {({ isActive }) => (
        <span
          className={`flex flex-col items-center justify-center gap-0.5 rounded-2xl px-3 py-1 transition ${
            isActive ? "bg-brand-500/15 dark:bg-brand-400/20" : ""
          }`}
        >
          <Icon size={19} className={isActive ? "text-brand-600 dark:text-brand-300" : "text-ink-muted"} />
          {isActive && <span className="text-brand-600 dark:text-brand-300">{label}</span>}
        </span>
      )}
    </NavLink>
  );

  return (
    <div
      className="md:hidden fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pointer-events-none"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
    >
      <nav className="pointer-events-auto w-full max-w-md rounded-[28px] border border-white/60 dark:border-white/10 bg-surface-light/70 dark:bg-surface-dark/60 backdrop-blur-xl backdrop-saturate-150 shadow-[0_8px_30px_rgba(11,11,11,0.14)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
        <div className="flex items-center px-1">{NAV_ITEMS.map(renderLink)}</div>
      </nav>
    </div>
  );
}
