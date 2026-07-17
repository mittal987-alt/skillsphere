import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAuth();

  // Show loader while auth is being initialized
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect if not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect if role is not allowed
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case "client":
        return <Navigate to="/client/dashboard" replace />;
      case "freelancer":
        return <Navigate to="/freelancer/dashboard" replace />;
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
}