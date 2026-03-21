import { useState, useRef, useEffect } from "react";
import {
  Bell,
  CheckCheck,
  X,
  CalendarOff,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import {
  useNotifications,
  type AppNotification,
} from "@/context/NotificationContext";

const timeAgo = (iso: string) => {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const TypeIcon = ({ type }: { type: AppNotification["type"] }) => {
  switch (type) {
    case "leave_applied":
      return <CalendarOff size={14} className="text-blue-400" />;
    case "leave_approved":
      return <CheckCircle2 size={14} className="text-emerald-400" />;
    case "leave_rejected":
      return <XCircle size={14} className="text-rose-400" />;
    default:
      return <Info size={14} className="text-slate-400" />;
  }
};

const iconBg: Record<AppNotification["type"], string> = {
  leave_applied: "bg-blue-500/10 border-blue-500/20",
  leave_approved: "bg-emerald-500/10 border-emerald-500/20",
  leave_rejected: "bg-rose-500/10 border-rose-500/20",
  general: "bg-slate-700/40 border-slate-700",
};

export default function NotificationBell() {
  const { notifications, unreadCount, markOneRead, markAllRead } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = async (n: AppNotification) => {
    if (!n.read) await markOneRead(n._id);
  };

  return (
    <div ref={ref} className="relative">
      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative flex items-center justify-center h-9 w-9 rounded-xl
          text-slate-400 hover:text-white hover:bg-white/[0.06]
          border border-transparent hover:border-white/10 transition-all duration-150"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1 -right-1 h-4 min-w-4 px-0.5 rounded-full
            bg-rose-500 text-[9px] font-black flex items-center justify-center
            text-white leading-none shadow-lg pointer-events-none"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div
          className="absolute left-full top-0 ml-3 z-[200]
          w-[340px] rounded-2xl border border-white/10
          bg-[#0d1425]/95 backdrop-blur-xl shadow-2xl
          overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
            <div className="flex items-center gap-2.5">
              <Bell size={14} className="text-blue-400" />
              <span className="text-sm font-black text-white uppercase tracking-tight">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span
                  className="px-2 py-0.5 rounded-full bg-blue-600
                  text-[10px] font-black text-white leading-none"
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[10px] font-black
                    text-blue-400 hover:text-white uppercase tracking-wider transition-colors"
                >
                  <CheckCheck size={12} /> All read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-slate-600 hover:text-slate-300 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14">
                <Bell size={28} className="text-slate-700 mb-3" />
                <p className="text-xs font-black text-slate-600 uppercase tracking-widest">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleClick(n)}
                  className={`w-full flex items-start gap-3 px-5 py-4 text-left
                    border-b border-white/[0.04] last:border-0
                    hover:bg-white/[0.03] transition-colors
                    ${!n.read ? "bg-blue-500/[0.05]" : ""}`}
                >
                  {/* Icon */}
                  <span
                    className={`mt-0.5 shrink-0 p-2 rounded-xl border ${iconBg[n.type]}`}
                  >
                    <TypeIcon type={n.type} />
                  </span>

                  {/* Text */}
                  <div className="flex-1 min-w-0 text-left">
                    <p
                      className={`text-sm font-bold leading-snug
                      ${!n.read ? "text-white" : "text-slate-300"}`}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 leading-relaxed line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-600 font-black uppercase tracking-wider mt-1.5">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
