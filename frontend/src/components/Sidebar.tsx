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
  Bot,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LogoIcon from "/favicon.svg";
import { useState, useEffect } from "react";
import api from "@/api/axios";
import NotificationBell from "@/components/NotificationBell";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  isAdminOnly: boolean;
  badge?: number;
  group: "core" | "admin" | "tools";
}

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const { logout, user } = useAuth();

  useEffect(() => {
    if (user?.role !== "admin") return;
    api
      .get("/leaves/all")
      .then((res) => {
        const count = res.data.filter(
          (l: any) => l.status === "pending",
        ).length;
        setPendingLeaves(count);
      })
      .catch(() => {});
  }, [user]);

  const menuItems: NavItem[] = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <Home size={18} />,
      isAdminOnly: false,
      group: "core",
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: <TimerIcon size={18} />,
      isAdminOnly: false,
      group: "core",
    },
    {
      name: "Leave",
      path: "/leave",
      icon: <Calendar1Icon size={18} />,
      isAdminOnly: false,
      group: "core",
      badge: user?.role === "admin" ? pendingLeaves : undefined,
    },
    {
      name: "WorkSync AI",
      path: "/work-sync-ai",
      icon: <Bot size={18} />,
      isAdminOnly: false,
      group: "tools",
    },
    {
      name: "Employees",
      path: "/employees",
      icon: <Briefcase size={18} />,
      isAdminOnly: true,
      group: "admin",
    },
    {
      name: "Users",
      path: "/users",
      icon: <Users size={18} />,
      isAdminOnly: true,
      group: "admin",
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings size={18} />,
      isAdminOnly: false,
      group: "core",
    },
  ];

  const filtered = menuItems.filter((i) =>
    i.isAdminOnly ? user?.role === "admin" : true,
  );
  const coreItems = filtered.filter((i) => i.group === "core");
  const adminItems = filtered.filter((i) => i.group === "admin");
  const toolItems = filtered.filter((i) => i.group === "tools");

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
      navigate("/");
    }
  };

  const getInitials = (name: string) =>
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  // ── Nav item ──────────────────────────────────
  const NavLink = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.path;
    return (
      <div className="relative group/item">
        <Link
          to={item.path}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative
            ${
              isActive
                ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                : "text-slate-400 hover:bg-white/[0.05] hover:text-slate-100 border border-transparent"
            }`}
        >
          <span
            className={`shrink-0 ${isActive ? "text-blue-400" : "text-slate-500 group-hover/item:text-slate-300"}`}
          >
            {item.icon}
          </span>
          <span
            className="text-sm font-medium whitespace-nowrap overflow-hidden"
            style={{
              opacity: collapsed ? 0 : 1,
              width: collapsed ? 0 : "auto",
              transition: "opacity 0.15s ease",
            }}
          >
            {item.name}
          </span>

          {/* Badge */}
          {item.badge != null && item.badge > 0 && (
            <span
              className={`font-black text-white bg-amber-500 rounded-full
              flex items-center justify-center leading-none
              ${
                collapsed
                  ? "absolute -top-1.5 -right-1.5 h-4 min-w-4 px-0.5 text-[9px]"
                  : "ml-auto h-5 min-w-5 px-1 text-[10px]"
              }`}
            >
              {item.badge}
            </span>
          )}

          {/* Active dot */}
          {isActive && !collapsed && !item.badge && (
            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
          )}
        </Link>

        {/* Tooltip on collapsed */}
        {collapsed && (
          <div
            className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
            bg-[#1a2035] text-white text-xs font-medium px-3 py-2 rounded-lg whitespace-nowrap
            border border-white/10 shadow-xl
            opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 flex items-center gap-2"
          >
            {item.name}
            {item.badge != null && item.badge > 0 && (
              <span className="h-4 min-w-4 px-1 rounded-full bg-amber-500 text-[8px] font-black flex items-center justify-center text-white">
                {item.badge}
              </span>
            )}
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1a2035]" />
          </div>
        )}
      </div>
    );
  };

  const SectionLabel = ({ label }: { label: string }) =>
    !collapsed ? (
      <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] px-3 pb-1.5 pt-3">
        {label}
      </p>
    ) : (
      <div className="h-px bg-white/[0.06] mx-3 my-2" />
    );

  // ─────────────────────────────────────────────
  return (
    <div
      style={{
        width: collapsed ? "72px" : "240px",
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}
      className="relative h-full shrink-0 z-30"
    >
      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((p) => !p)}
        className="absolute -right-3 top-[68px] z-50 h-6 w-6 rounded-full bg-[#0a0f1e]
          border border-white/10 flex items-center justify-center
          text-slate-400 hover:text-white hover:border-blue-500/50 shadow-lg transition-all"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      <aside className="h-full w-full bg-[#0a0f1e] text-slate-300 flex flex-col border-r border-white/[0.06] shrink-0 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/40">
              <img
                src={LogoIcon}
                alt="WorkSync"
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
        <nav className="flex-1 px-3 py-3 overflow-y-auto overflow-x-hidden space-y-0.5">
          <SectionLabel label="Core" />
          {coreItems.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}

          {toolItems.length > 0 && (
            <>
              <SectionLabel label="Tools" />
              {toolItems.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </>
          )}

          {adminItems.length > 0 && (
            <>
              <SectionLabel label="Admin" />
              {adminItems.map((item) => (
                <NavLink key={item.name} item={item} />
              ))}
            </>
          )}
        </nav>

        {/* Notification bell row */}
        <div
          className={`px-3 pb-2 shrink-0 ${collapsed ? "flex justify-center" : "flex items-center px-4"}`}
        >
          <NotificationBell />
          {!collapsed && (
            <span className="ml-3 text-xs font-bold text-slate-500">
              Notifications
            </span>
          )}
        </div>

        {/* User card */}
        {user && (
          <div
            className={`mx-3 mb-2 rounded-lg bg-white/[0.03] border border-white/[0.06] overflow-hidden transition-all duration-200 ${collapsed ? "p-2" : "p-3"}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-7 w-7 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 text-[10px] font-bold text-white shadow">
                {getInitials(user.name)}
              </div>
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
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-wider leading-tight mt-0.5">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="px-3 pb-4 shrink-0">
          <div className="relative group/logout">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5
                text-slate-400 hover:text-red-400 hover:bg-red-500/10
                border border-transparent hover:border-red-500/20 transition-all duration-150"
            >
              <LogOut size={18} className="shrink-0" />
              <span
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
                style={{
                  opacity: collapsed ? 0 : 1,
                  width: collapsed ? 0 : "auto",
                  transition: "opacity 0.15s ease",
                }}
              >
                Logout
              </span>
            </button>
            {collapsed && (
              <div
                className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50
                bg-[#1a2035] text-white text-xs font-medium px-2.5 py-1.5 rounded-md whitespace-nowrap
                border border-white/10 shadow-xl opacity-0 group-hover/logout:opacity-100 transition-opacity duration-150"
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
