import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Home from "@/pages/Home"
import { useAuth } from "@/context/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import Users from "@/pages/Users/Users"
import Employees from "@/pages/Employee/Employee"
import Login from "@/pages/Login/Login"
import Sidebar from "@/components/Sidebar"
import Attendance from "@/pages/Attendance/Attendance"
import LeavePage from "@/pages/Leaves/Leave"
import AdminRoute from "./AdminRoute"

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        {/* 1. Only show Sidebar if user is logged in */}
        {user && <Sidebar />}

        <div className={`flex-1 ${user ? "p-6" : ""}`}>
          <Routes>
            {/* 2. Public Route: If logged in, redirect away from Login */}
            <Route 
              path="/" 
              element={user ? <Navigate to="/dashboard" /> : <Login />} 
            />

            {/* 3. Protected Routes: Wrap everything that needs a token */}
            <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/leave" element={<ProtectedRoute><LeavePage /></ProtectedRoute>} />
            <Route path="/attendance" element={<ProtectedRoute><Attendance /></ProtectedRoute>} />
            {/* <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} /> */}
            {/* <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} /> */}
            <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />
            <Route path="/employees" element={<AdminRoute><Employees /></AdminRoute>} />
            {/* 4. Fallback: Redirect unknown paths */}
            <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default AppRoutes;
