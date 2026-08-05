import { LayoutDashboard, ArrowDownCircle, ArrowUpCircle, FileBarChart2 } from "lucide-react";

export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/income", label: "Income", icon: ArrowDownCircle },
  { to: "/expenses", label: "Expenses", icon: ArrowUpCircle },
  { to: "/reports", label: "Reports", icon: FileBarChart2 },
];
