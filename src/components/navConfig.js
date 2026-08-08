import { LayoutDashboard, ArrowDownCircle, ArrowUpCircle, FileBarChart2, Landmark, LineChart } from "lucide-react";

export const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/income", label: "Income", icon: ArrowDownCircle },
  { to: "/expenses", label: "Expenses", icon: ArrowUpCircle },
  { to: "/fds", label: "FDs", icon: Landmark },
  { to: "/mfs", label: "MFs", icon: LineChart },
  { to: "/reports", label: "Reports", icon: FileBarChart2 },
];
