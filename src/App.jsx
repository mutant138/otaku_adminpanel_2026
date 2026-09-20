import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/useAuthStore.js";
import ToastContainer from "./components/common/ToastContainer.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";

// Pages
import LoginPage from "./pages/LoginPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import CategoriesPage from "./pages/CategoriesPage.jsx";
import TitlesPage from "./pages/TitlesPage.jsx";
import PlansPage from "./pages/PlansPage.jsx";
import PaymentsPage from "./pages/PaymentsPage.jsx";
import ReportsPage from "./pages/ReportsPage.jsx";
import LocationsPage from "./pages/LocationsPage.jsx";
import EmailTemplatesPage from "./pages/EmailTemplatesPage.jsx";
import BlogsPage from "./pages/BlogsPage.jsx";
import FeedbacksPage from "./pages/FeedbacksPage.jsx";
import LoginHistoryPage from "./pages/LoginHistoryPage.jsx";

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Public Authentication Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Admin Routes */}
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/login-history" element={<LoginHistoryPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/titles" element={<TitlesPage />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/feedbacks" element={<FeedbacksPage />} />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/emails" element={<EmailTemplatesPage />} />
          <Route path="/blogs" element={<BlogsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
