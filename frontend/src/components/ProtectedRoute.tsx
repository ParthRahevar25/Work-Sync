import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading)
    return <Loader2 className="animate-spin mx-auto mt-20" size={48} />;

  // 2. Only if loading is done and user is still null, redirect.
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
