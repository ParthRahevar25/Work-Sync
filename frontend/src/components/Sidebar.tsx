import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Settings, LogOut, Briefcase, TimerIcon, Calendar1Icon } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth(); // 👈 Grab user here

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} />, isAdminOnly: false },
    { name: 'Employees', path: '/employees', icon: <Briefcase size={20} />, isAdminOnly: true }, // 👈 Restricted
    { name: 'Users', path: '/users', icon: <Users size={20} />, isAdminOnly: true }, // 👈 Restricted
    { name: 'Attendance', path: '/attendance', icon: <TimerIcon size={20} />, isAdminOnly: false },
    { name: 'Leave', path: '/leave', icon: <Calendar1Icon size={20} />, isAdminOnly: false },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} />, isAdminOnly: false },
  ];

  // 1. Filter items based on user role
  const filteredItems = menuItems.filter(item => {
    if (item.isAdminOnly) {
      return user?.role === 'admin';
    }
    return true; // Show public items to everyone
  });

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/");
    }
  };

  return (
    <aside className="h-screen w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 sticky top-0">
      {/* Logo Section */}
      <div className="p-6 flex items-center gap-3">
        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">WS</span>
        </div>
        <span className="text-xl font-bold text-white tracking-tight text-nowrap">WorkSync HR</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"} transition-colors`}>
                {item.icon}
              </span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info Section (Optional but Professional) */}
      {user && (
        <div className="px-6 py-4 border-t border-slate-800 flex flex-col gap-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Logged in as</p>
          <p className="text-sm font-medium text-white truncate">{user.name}</p>
          <p className="text-[10px] text-blue-400 font-bold uppercase">{user.role}</p>
        </div>
      )}

      {/* Footer Section */}
      <div className="p-4 border-t border-slate-800">
        <button className="flex w-full items-center gap-4 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 group"
          onClick={handleLogout}>
          <LogOut size={20} className="text-slate-400 group-hover:text-red-500" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}