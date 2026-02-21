import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Settings,
  LogOut,
  Briefcase,
  TimerIcon,
  Calendar1Icon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LogoIcon from "/favicon.svg";
import { useState } from "react";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const { logout, user } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home size={18} />,
      isAdminOnly: false,
    },
    {
      name: "Employees",
      path: "/employees",
      icon: <Briefcase size={18} />,
      isAdminOnly: true,
    },
    {
      name: "Users",
      path: "/users",
      icon: <Users size={18} />,
      isAdminOnly: true,
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: <TimerIcon size={18} />,
      isAdminOnly: false,
    },
    {
      name: "Leave",
      path: "/leave",
      icon: <Calendar1Icon size={18} />,
      isAdminOnly: false,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings size={18} />,
      isAdminOnly: false,
    },
  ];

  const filteredItems = menuItems.filter((item) => {
    if (item.isAdminOnly) return user?.role === "admin";
    return true;
  });

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/");
    }
  };

  // Get initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      style={{
        width: collapsed ? "72px" : "240px",
        transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
      className="relative h-full shrink-0 z-30"
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed((prev) => !prev)}
        className="absolute -right-3 top-[68px] z-50
          h-6 w-6 rounded-full bg-[#0a0f1e] border border-white/10
          flex items-center justify-center
          text-slate-400 hover:text-white hover:border-blue-500/50
          shadow-lg transition-all duration-150"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      <aside className="h-full w-full bg-[#0a0f1e] text-slate-300 flex flex-col border-r border-white/[0.06] shrink-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        {/* Logo Section */}
        <div className="flex items-center h-16 px-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/40">
              <img
                src={LogoIcon}
                alt="WorkSync Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <span
              className="text-lg font-bold text-white tracking-tight whitespace-nowrap overflow-hidden"
              style={{
                opacity: collapsed ? 0 : 1,
                width: collapsed ? 0 : "auto",
                transition: "opacity 0.2s ease, width 0.25s ease",
              }}
            >
              WorkSync HR
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {/* Section label */}
          {!collapsed && (
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest px-3 pb-2">
              Menu
            </p>
          )}

          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <div key={item.name} className="relative group/item">
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                    isActive
                      ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                      : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100 border border-transparent"
                  }`}
                >
                  {/* Icon */}
                  <span
                    className={`shrink-0 transition-colors ${
                      isActive
                        ? "text-blue-400"
                        : "text-slate-500 group-hover/item:text-slate-300"
                    }`}
                  >
                    {item.icon}
                  </span>

                  {/* Label */}
                  <span
                    className="text-lg font-medium whitespace-nowrap overflow-hidden"
                    style={{
                      opacity: collapsed ? 0 : 1,
                      width: collapsed ? 0 : "auto",
                      transition: "opacity 0.15s ease",
                    }}
                  >
                    {item.name}
                  </span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <span
                      className="ml-auto shrink-0 h-1.5 w-1.5 rounded-full bg-blue-400"
                      style={{ display: collapsed ? "none" : "block" }}
                    />
                  )}
                </Link>

                {/* Tooltip on collapsed */}
                {collapsed && (
                  <div
                    className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
                  bg-[#1a2035] text-white text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap
                  border border-white/10 shadow-xl
                  opacity-0 group-hover/item:opacity-100 transition-opacity duration-150"
                  >
                    {item.name}
                    <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1a2035]" />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Info Section */}
        {user && (
          <div
            className={`mx-3 mb-3 rounded-lg bg-white/[0.03] border border-white/[0.06] overflow-hidden transition-all duration-200 ${
              collapsed ? "p-2" : "p-3"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div className="h-7 w-7 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 text-[10px] font-bold text-white shadow">
                {getInitials(user.name)}
              </div>

              {/* User details */}
              <div
                className="min-w-0 overflow-hidden"
                style={{
                  opacity: collapsed ? 0 : 1,
                  width: collapsed ? 0 : "auto",
                  transition: "opacity 0.15s ease",
                }}
              >
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider leading-tight mt-0.5">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="px-3 pb-4 shrink-0">
          <div className="relative group/logout">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 w-full rounded-lg px-3 py-2.5
              text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20
              transition-all duration-150`}
            >
              <LogOut size={18} className="shrink-0" />
              <span
                className="text-lg font-medium whitespace-nowrap overflow-hidden"
                style={{
                  opacity: collapsed ? 0 : 1,
                  width: collapsed ? 0 : "auto",
                  transition: "opacity 0.15s ease",
                }}
              >
                Logout
              </span>
            </button>

            {/* Tooltip on collapsed */}
            {collapsed && (
              <div
                className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
              bg-[#1a2035] text-white text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap
              border border-white/10 shadow-xl
              opacity-0 group-hover/logout:opacity-100 transition-opacity duration-150"
              >
                Logout
                <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1a2035]" />
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
