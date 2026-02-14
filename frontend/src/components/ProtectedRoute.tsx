import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: any) {
  const { user } = useAuth();

  // 1. If not logged in at all, go to login
  if (!user) {
    return <Navigate to="/" />;
  }

  // 2. Allow any logged-in user to see the children
  // We handle specific role-based UI inside the components themselves
  return children;
}