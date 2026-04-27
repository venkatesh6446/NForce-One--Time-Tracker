import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Layout
import { DashboardLayout } from "../components/layout/DashboardLayout";

// Pages
import { Login } from "../pages/Login";
import Register from "../pages/Register";
import { ForgotPassword } from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import { Dashboard } from "../pages/Dashboard";
import { MyTimesheet } from "../pages/MyTimesheet";
import { Approvals } from "../pages/Approvals";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Role check
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  const { token } = useAuth();

  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route
          path="/login"
          element={token ? <Navigate to="/" /> : <Login />}
        />

        <Route
          path="/register"
          element={token ? <Navigate to="/" /> : <Register />}
        />

        <Route
          path="/forgot-password"
          element={token ? <Navigate to="/" /> : <ForgotPassword />}
        />

        {/* RESET PASSWORD */}
        <Route
          path="/reset-password/:token"
          element={<ResetPassword />}
        />

        {/* PROTECTED ROUTES */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* DEFAULT DASHBOARD */}
          <Route index element={<Dashboard />} />

          {/* ✅ FIX: SUPPORT BOTH PATHS */}
          <Route path="timesheet" element={<MyTimesheet />} />
          <Route path="my-timesheet" element={<MyTimesheet />} />

          {/* APPROVALS (MANAGER / ADMIN ONLY) */}
          <Route
            path="approvals"
            element={
              <ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}>
                <Approvals />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  );
};