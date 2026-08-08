import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Wallet, Moon, Sun, Plus } from "lucide-react";
import Sidebar from "./Sidebar.jsx";
import BottomNav from "./BottomNav.jsx";
import AddTransactionModal from "./AddTransactionModal.jsx";
import FdModal from "./FdModal.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export default function Layout() {
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultType, setDefaultType] = useState("expense");
  const [fdModalOpen, setFdModalOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isFdsPage = location.pathname.startsWith("/fds");

  const openModal = (type = "expense") => {
    setDefaultType(type);
    setModalOpen(true);
  };

  // On the Fixed Deposits page, the floating mobile button adds an FD
  // instead of a transaction.
  const handleMobileAdd = () => {
    if (isFdsPage) setFdModalOpen(true);
    else openModal("expense");
  };

  return (
    <div className="min-h-screen bg-page-light dark:bg-page-dark">
      <Sidebar onAddClick={() => openModal("expense")} />

      {/* Mobile / tablet top bar */}
      <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 h-14 border-b border-black/[0.06] dark:border-white/[0.08] bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500 text-white">
            <Wallet size={16} />
          </div>
          <span className="font-semibold text-[15px] tracking-tight">Centsible</span>
        </div>
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-ink-muted hover:bg-black/[0.06] dark:hover:bg-white/[0.08] transition"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <main className="md:pl-64 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet context={{ openAddModal: openModal }} />
        </div>
      </main>

      <BottomNav />

      {/* Floating add button, mobile only — sits above the bottom nav pill */}
      <button
        onClick={handleMobileAdd}
        aria-label={isFdsPage ? "Add fixed deposit" : "Add transaction"}
        className="md:hidden fixed right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/40 active:scale-95 transition"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 5.75rem)" }}
      >
        <Plus size={26} />
      </button>

      <AddTransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultType={defaultType}
      />
      <FdModal open={fdModalOpen} onClose={() => setFdModalOpen(false)} />
    </div>
  );
}
