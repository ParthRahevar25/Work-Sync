import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Users from "@/pages/Users/Users";
import Employees from "@/pages/Employee/Employee";
import Login from "@/pages/Login/Login";
import Sidebar from "@/components/Sidebar";
import Attendance from "@/pages/Attendance/Attendance";
import LeavePage from "@/pages/Leaves/Leave";
import AdminRoute from "./AdminRoute";
import Particles from "@/components/Particles";
import EditEmployee from "@/pages/Employee/EditEmployees";
import WorkSyncAI from "@/pages/WorkSyncAi";

const AppRoutes = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#0F172A] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  return (
    <BrowserRouter>
      {/* 1. Main Wrapper */}
      <div className="relative flex h-screen w-full bg-[#030712] overflow-hidden">
        {/* 2. GLOBAL BACKGROUND LAYER  */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Particles
            particleColors={["#3b82f6", "#ffffff"]}
            particleCount={500}
            particleSpread={12}
            speed={0.1}
            particleBaseSize={100}
            moveParticlesOnHover={true}
            alphaParticles={true}
            disableRotation={false}
          />
          {/* Subtle dark gradient overlay to keep text readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030712]/20 to-[#030712]/80" />
        </div>
        {/* <div className="fixed inset-0 z-0 pointer-events-none">
          <WorkSyncBackground /> */}
        {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030712]/20 to-[#030712]/80" />
        </div> */}

        {/* 3. Sidebar */}
        {user && (
          <div className="relative z-40 shrink-0">
            <Sidebar />
          </div>
        )}

        {/* 4. CONTENT AREA  */}
        <div className="relative z-10 flex-1 h-full overflow-y-auto">
          <Routes>
            <Route
              path="/"
              element={user ? <Navigate to="/dashboard" /> : <Login />}
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leave"
              element={
                <ProtectedRoute>
                  <LeavePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <Attendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <AdminRoute>
                  <Users />
                </AdminRoute>
              }
            />
            <Route
              path="/employees"
              element={
                <AdminRoute>
                  <Employees />
                </AdminRoute>
              }
            />

            <Route
              path="/employees/edit/:id"
              element={
                <AdminRoute>
                  <EditEmployee />
                </AdminRoute>
              }
            />
            <Route
              path="/work-sync-ai"
              element={
                <ProtectedRoute>
                  <WorkSyncAI />
                </ProtectedRoute>
              }
            />
            <Route
              path="*"
              element={<Navigate to={user ? "/dashboard" : "/"} />}
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
};

export default AppRoutes;
