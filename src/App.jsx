import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Income from "./pages/Income.jsx";
import Expenses from "./pages/Expenses.jsx";
import FixedDeposits from "./pages/FixedDeposits.jsx";
import Reports from "./pages/Reports.jsx";
import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/income" element={<Income />} />
        <Route path="/expenses" element={<Expenses />} />
        <Route path="/fds" element={<FixedDeposits />} />
        <Route path="/reports" element={<Reports />} />
      </Route>

      <Route path="*" element={<Login />} />
    </Routes>
  );
}
