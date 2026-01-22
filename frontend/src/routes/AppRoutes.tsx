import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "@/pages/Home"
import { AuthProvider } from "@/context/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"
import Users from "@/pages/Users/Users"
import Employees from "@/pages/Employee/Employee"
import Login from "@/pages/Login/Login"
import Sidebar from "@/components/Sidebar"

const AppRoutes = () => {
  return (
    // <BrowserRouter>
    //   <Routes>
    //     <Route path="/" element={<Home />} />
    //   </Routes>
    // </BrowserRouter>

    <AuthProvider>
      <BrowserRouter>
        <div className="flex">
          <Sidebar />
          <div className="p-6 flex-1">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default AppRoutes
