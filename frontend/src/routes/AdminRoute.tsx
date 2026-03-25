import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // 1. Wait for the Auth check to complete
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0F172A]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  // 2. If not logged in or not an admin, redirect
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  // 3. Authorized
  return <>{children}</>;
}