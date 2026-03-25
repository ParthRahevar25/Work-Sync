import { useEffect, useState, useMemo, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  CalendarOff,
  ClockAlert,
  Activity,
  CheckCircle2,
  Clock,
  Download,
  RefreshCw,
  Bell,
  Shield,
  Zap,
  Award,
  AlertTriangle,
  ChevronRight,
  Mail,
  Check,
  X,
  MoreHorizontal,
} from "lucide-react";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";

interface Summary {
  attendance: { percentage: string; label: string };
  leaves: { count: string; label: string };
  late: { count: string; label: string };
}
interface WeeklyDay {
  day: string;
  date: string;
  present: number;
  absent: number;
  late: number;
}
interface DeptData {
  name: string;
  value: number;
}
interface Performer {
  name: string;
  dept: string;
  hours: number;
  streak: number;
}
interface LogRecord {
  _id: string;
  employeeId: { name?: string; email: string };
  date: string;
  checkIn: string;
  checkOut?: string;
  workHours: number;
}
interface LeaveReq {
  _id: string;
  employeeId: { name: string; email: string };
  type: string;
  startDate: string;
  endDate: string;
  status: "Pending" | "Approved" | "Rejected";
}

const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];
const C = {
  blue: {
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    solid: "bg-blue-600",
  },
  emerald: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    solid: "bg-emerald-600",
  },
  amber: {
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    solid: "bg-amber-500",
  },
  rose: {
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    solid: "bg-rose-600",
  },
} as const;

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-white/10 rounded-xl px-4 py-3 shadow-2xl text-xs space-y-1">
      <p className="font-black text-white uppercase tracking-wider mb-2">
        {label}
      </p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-bold" style={{ color: p.fill }}>
          {p.name}: <span className="text-white">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

const Empty = ({ text }: { text: string }) => (
  <div className="flex items-center justify-center py-12 text-slate-600 text-sm font-bold">
    {text}
  </div>
);

const downloadCSV = (rows: Record<string, any>[], filename: string) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const v = String(r[h] ?? "").replace(/"/g, '""');
          return v.includes(",") || v.includes('"') ? `"${v}"` : v;
        })
        .join(","),
    ),
  ].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
};

const sortLeaves = (data: LeaveReq[]): LeaveReq[] =>
  [...data].sort((a, b) => {
    // Pending always floats to the top
    if (a.status === "Pending" && b.status !== "Pending") return -1;
    if (a.status !== "Pending" && b.status === "Pending") return 1;
    // Within the same status: newest startDate first
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

// ════════════════════════════════════════════
export default function AdminDashboard() {
  const { user } = useAuth();

  const [summary, setSummary] = useState<Summary | null>(null);
  const [weekly, setWeekly] = useState<WeeklyDay[]>([]);
  const [depts, setDepts] = useState<DeptData[]>([]);
  const [performers, setPerformers] = useState<Performer[]>([]);
  const [logs, setLogs] = useState<LogRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatedAt, setUpdatedAt] = useState(new Date());

  
  const fetchLeaves = useCallback(async () => {
    try {
      const res = await api.get("/leaves/all");
      setLeaves(sortLeaves(res.data));
    } catch {
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      api.get("/dashboard/summary"),
      api.get("/dashboard/weekly"),
      api.get("/dashboard/departments"),
      api.get("/dashboard/performers"),
      api.get("/attendance/all"),
      api.get("/leaves/all"),
    ]).then(([s, w, d, p, l, lv]) => {
      if (s.status === "fulfilled") setSummary(s.value.data);
      if (w.status === "fulfilled") setWeekly(w.value.data);
      if (d.status === "fulfilled") setDepts(d.value.data);
      if (p.status === "fulfilled") setPerformers(p.value.data);
      if (l.status === "fulfilled") setLogs(l.value.data);
      if (lv.status === "fulfilled") setLeaves(sortLeaves(lv.value.data));
      setUpdatedAt(new Date());
      setLoading(false);
    });
  }, [refreshKey]);

  useEffect(() => {
    const interval = setInterval(fetchLeaves, 30_000);
    return () => clearInterval(interval);
  }, [fetchLeaves]);

  const pending = useMemo(
    () => leaves.filter((l) => l.status === "Pending"),
    [leaves],
  );
  const empCount = useMemo(
    () => new Set(logs.map((l) => l.employeeId?.email)).size,
    [logs],
  );

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  const updateLeave = async (id: string, status: "Approved" | "Rejected") => {
    try {
      await api.put(`/leaves/update/${id}`, { status });
      // Update local state immediately, then re-sort
      setLeaves((prev) =>
        sortLeaves(prev.map((l) => (l._id === id ? { ...l, status } : l))),
      );
    } catch {
      /* silent */
    }
  };

  const exportCSV = () =>
    downloadCSV(
      logs.map((l) => ({
        Employee: l.employeeId?.name ?? "Unknown",
        Email: l.employeeId?.email,
        Date: new Date(l.date).toLocaleDateString(),
        CheckIn: new Date(l.checkIn).toLocaleTimeString(),
        CheckOut: l.checkOut
          ? new Date(l.checkOut).toLocaleTimeString()
          : "Active",
        WorkHours: l.workHours?.toFixed(2) ?? "0.00",
      })),
      "attendance_report",
    );

  if (loading)
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-16 bg-slate-800/40 rounded-2xl w-1/3" />
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-slate-800/40 rounded-[1.75rem]" />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 h-72 bg-slate-800/40 rounded-[1.75rem]" />
          <div className="h-72 bg-slate-800/40 rounded-[1.75rem]" />
        </div>
      </div>
    );

  return (
    <div className="relative z-10 p-6 lg:p-10 min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Shield size={13} className="text-white" />
              </div>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                Admin Control Centre
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {greeting},{" "}
              <span className="text-blue-400">{user?.name?.split(" ")[0]}</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-600 hidden md:block">
              Updated{" "}
              {updatedAt.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all"
            >
              <RefreshCw size={16} />
            </button>
            <button className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition-all">
              <Bell size={16} />
              {pending.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[9px] font-black flex items-center justify-center text-white">
                  {pending.length}
                </span>
              )}
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-lg shadow-blue-900/30"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {(
            [
              {
                title: "Total Employees",
                value: empCount || "—",
                sub: `${depts.length} departments`,
                icon: <Users size={22} />,
                color: "blue",
              },
              {
                title: "Attendance Rate",
                value: summary ? `${summary.attendance.percentage}%` : "—",
                sub: summary?.attendance.label ?? "Today",
                icon: <Activity size={22} />,
                color: "emerald",
              },
              {
                title: "On Leave Today",
                value: summary?.leaves.count ?? "—",
                sub: summary?.leaves.label ?? "Approved",
                icon: <CalendarOff size={22} />,
                color: "amber",
              },
              {
                title: "Late Check-ins",
                value: summary?.late.count ?? "—",
                sub: summary?.late.label ?? "After 9:30 AM",
                icon: <ClockAlert size={22} />,
                color: "rose",
              },
            ] as const
          ).map(({ title, value, sub, icon, color }) => {
            const c = C[color];
            return (
              <div
                key={title}
                className="group relative bg-slate-900/50 backdrop-blur-sm rounded-[1.75rem] p-7 border border-white/[0.07] hover:border-white/[0.15] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden shadow-xl"
              >
                <div
                  className={`absolute -right-8 -top-8 w-28 h-28 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${c.solid}`}
                />
                <div className="relative z-10 flex justify-between items-start mb-6">
                  <div
                    className={`p-3.5 rounded-2xl border ${c.bg} ${c.border} ${c.text} transition-transform duration-500 group-hover:scale-110`}
                  >
                    {icon}
                  </div>
                </div>
                <div className="relative z-10">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5">
                    {title}
                  </p>
                  <span className="text-4xl font-black tracking-tighter text-white">
                    {value}
                  </span>
                  <p
                    className={`text-xs mt-2.5 font-bold flex items-center gap-2 ${c.text}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full animate-pulse ${c.solid}`}
                    />
                    {sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Bar chart — /dashboard/weekly */}
          <div className="xl:col-span-2 bg-slate-900/50 backdrop-blur border border-white/[0.07] rounded-[1.75rem] p-7 shadow-xl">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">
                  Weekly <span className="text-blue-400">Attendance</span>
                </h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5 uppercase tracking-widest">
                  {weekly.length > 0
                    ? `${weekly[0].date} – ${weekly[weekly.length - 1].date}`
                    : "Last 7 days"}
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-wider">
                {[
                  ["Present", "#3b82f6"],
                  ["Absent", "#f43f5e"],
                  ["Late", "#f59e0b"],
                ].map(([l, c]) => (
                  <span
                    key={l}
                    className="flex items-center gap-1.5 text-slate-400"
                  >
                    <span
                      className="h-2 w-2 rounded-sm"
                      style={{ background: c }}
                    />
                    {l}
                  </span>
                ))}
              </div>
            </div>
            {weekly.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={weekly} barGap={4} barCategoryGap="30%">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                    allowDecimals={false}
                  />
                  <Tooltip
                    content={<ChartTooltip />}
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                  />
                  <Bar
                    dataKey="present"
                    fill="#3b82f6"
                    radius={[5, 5, 0, 0]}
                    name="Present"
                  />
                  <Bar
                    dataKey="absent"
                    fill="#f43f5e"
                    radius={[5, 5, 0, 0]}
                    name="Absent"
                  />
                  <Bar
                    dataKey="late"
                    fill="#f59e0b"
                    radius={[5, 5, 0, 0]}
                    name="Late"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty text="No attendance data for the past 7 days" />
            )}
          </div>

          {/* Donut — /dashboard/departments */}
          <div className="bg-slate-900/50 backdrop-blur border border-white/[0.07] rounded-[1.75rem] p-7 shadow-xl">
            <h3 className="text-base font-black text-white uppercase tracking-tight mb-1">
              Dept <span className="text-blue-400">Breakdown</span>
            </h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">
              Headcount by department
            </p>
            {depts.length > 0 ? (
              <>
                <div className="flex justify-center">
                  <PieChart width={180} height={180}>
                    <Pie
                      data={depts}
                      cx={90}
                      cy={90}
                      innerRadius={52}
                      outerRadius={82}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {depts.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </div>
                <div className="flex flex-col gap-2.5 mt-4">
                  {depts.map((d, i) => {
                    const total = depts.reduce((s, x) => s + x.value, 0);
                    return (
                      <div key={d.name} className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{
                            background: CHART_COLORS[i % CHART_COLORS.length],
                          }}
                        />
                        <span className="text-slate-400 text-xs font-medium flex-1 truncate">
                          {d.name}
                        </span>
                        <span className="text-white text-xs font-black">
                          {d.value}
                        </span>
                        <span className="text-slate-600 text-[10px] font-bold w-8 text-right">
                          {total > 0 ? Math.round((d.value / total) * 100) : 0}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <Empty text="No department data found" />
            )}
          </div>
        </div>

        {/* Bottom 3 cards */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Live Feed — /attendance/all */}
          <div className="bg-slate-900/50 backdrop-blur border border-white/[0.07] rounded-[1.75rem] shadow-xl flex flex-col overflow-hidden">
            <div className="px-7 pt-7 pb-5 border-b border-white/[0.06] flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live <span className="text-blue-400 ml-1">Feed</span>
                </h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                  Latest attendance events
                </p>
              </div>
              <span className="text-xs font-black bg-blue-600 px-3 py-1 rounded-full text-white">
                {Math.min(logs.length, 10)}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-2">
              {logs.slice(0, 10).map((log) => {
                const name =
                  log.employeeId?.name ?? log.employeeId?.email ?? "Unknown";
                const active = !log.checkOut;
                const short = !active && log.workHours < 4;
                const { icon, cls, label } = active
                  ? {
                      icon: <CheckCircle2 size={13} />,
                      cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                      label: "Checked in",
                    }
                  : short
                    ? {
                        icon: <AlertTriangle size={13} />,
                        cls: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                        label: "Short shift",
                      }
                    : {
                        icon: <Clock size={13} />,
                        cls: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                        label: "Checked out",
                      };
                return (
                  <div
                    key={log._id}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/[0.025] transition-colors group"
                  >
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                        {name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                        {label}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className={`inline-flex items-center justify-center h-6 w-6 rounded-full border ${cls}`}
                      >
                        {icon}
                      </span>
                      <span className="text-[9px] text-slate-600 font-black uppercase">
                        {new Date(log.checkIn).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {logs.length === 0 && <Empty text="No activity yet" />}
            </div>
          </div>

          {/* Top Performers — /dashboard/performers */}
          <div className="bg-slate-900/50 backdrop-blur border border-white/[0.07] rounded-[1.75rem] shadow-xl flex flex-col overflow-hidden">
            <div className="px-7 pt-7 pb-5 border-b border-white/[0.06]">
              <h3 className="text-base font-black text-white uppercase tracking-tight flex items-center gap-2">
                <Award size={16} className="text-amber-400" />
                Top <span className="text-blue-400 ml-1">Performers</span>
              </h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                This month · by work hours
              </p>
            </div>
            <div className="p-5 space-y-3 flex-1">
              {performers.length > 0 ? (
                performers.map((p, i) => (
                  <div
                    key={p.name}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.09] transition-all group"
                  >
                    <span
                      className={`text-lg font-black shrink-0 w-5 text-center ${i === 0 ? "text-amber-400" : i === 1 ? "text-slate-300" : i === 2 ? "text-orange-600" : "text-slate-600"}`}
                    >
                      {i + 1}
                    </span>
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {p.name?.charAt(0) ?? "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mt-0.5 truncate">
                        {p.dept}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-white">
                        {p.hours}h
                      </p>
                      <p className="text-[10px] text-emerald-400 font-black uppercase">
                        {p.streak}d
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <Empty text="No data for this month yet" />
              )}
            </div>
            {performers.length > 0 && (
              <div className="mx-5 mb-5 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                <Zap size={15} className="text-blue-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-400 font-medium leading-relaxed">
                  {performers[0]?.name} leads with{" "}
                  <span className="text-white font-bold">
                    {performers[0]?.hours}h
                  </span>{" "}
                  this month in {performers[0]?.dept}.
                </p>
              </div>
            )}
          </div>

          {/* Leave Queue — /leaves/all (auto-refreshes every 30s) */}
          <div className="bg-slate-900/50 backdrop-blur border border-white/[0.07] rounded-[1.75rem] shadow-xl flex flex-col overflow-hidden">
            <div className="px-7 pt-7 pb-5 border-b border-white/[0.06] flex justify-between items-center">
              <div>
                <h3 className="text-base font-black text-white uppercase tracking-tight">
                  Leave <span className="text-blue-400">Queue</span>
                </h3>
                {/* Subtle indicator that this refreshes automatically */}
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  Live · refreshes every 30s
                </p>
              </div>
              {pending.length > 0 && (
                <span className="text-xs font-black bg-amber-500 px-3 py-1 rounded-full text-white animate-pulse">
                  {pending.length} pending
                </span>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {pending.length > 0 ? (
                pending.slice(0, 5).map((req) => (
                  <div
                    key={req._id}
                    className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.09] transition-all group"
                  >
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {req.employeeId?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                        {req.employeeId?.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-wider mt-0.5">
                        {req.type} ·{" "}
                        {new Date(req.startDate).toLocaleDateString()} –{" "}
                        {new Date(req.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateLeave(req._id, "Approved")}
                        className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-xl border border-transparent hover:border-emerald-500/20 transition-all"
                      >
                        <Check size={15} className="stroke-[3]" />
                      </button>
                      <button
                        onClick={() => updateLeave(req._id, "Rejected")}
                        className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 transition-all"
                      >
                        <X size={15} className="stroke-[3]" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2
                    size={32}
                    className="text-emerald-500/40 mb-3"
                  />
                  <p className="text-xs font-black text-slate-600 uppercase tracking-widest">
                    All caught up!
                  </p>
                </div>
              )}
            </div>
            {leaves.length > 0 && (
              <div className="p-5 border-t border-white/[0.06]">
                <button className="w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black text-blue-400 uppercase tracking-[0.15em] hover:bg-blue-500/10 rounded-2xl border border-blue-500/20 transition-all">
                  View All Requests <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Table — /attendance/all ── */}
        <div className="bg-slate-900/50 backdrop-blur border border-white/[0.07] rounded-[1.75rem] overflow-hidden shadow-xl">
          <div className="px-8 py-6 border-b border-white/[0.06] flex justify-between items-center">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-tight">
                Recent <span className="text-blue-400">Attendance</span>
              </h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                {logs.length} total records
              </p>
            </div>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-wider border border-white/10 hover:border-white/20 px-4 py-2 rounded-xl transition-all"
            >
              <MoreHorizontal size={14} /> Export All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.02]">
                <tr>
                  {[
                    "Employee",
                    "Date",
                    "Check In",
                    "Check Out",
                    "Hours",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {logs.slice(0, 10).map((log) => {
                  const active = !log.checkOut;
                  const met = log.workHours >= 8;
                  const name = log.employeeId?.name ?? "Unknown";
                  return (
                    <tr
                      key={log._id}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-8 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                              {name}
                            </p>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <Mail size={9} className="text-blue-500" />
                              {log.employeeId?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-4 text-xs text-slate-400 font-bold">
                        {new Date(log.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-8 py-4 text-xs font-black text-blue-400">
                        {new Date(log.checkIn).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-8 py-4 text-xs font-black text-slate-400">
                        {log.checkOut ? (
                          new Date(log.checkOut).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        ) : (
                          <span className="text-blue-400 animate-pulse">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase
                          ${met ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${met ? "bg-emerald-500" : "bg-amber-500"}`}
                          />
                          {log.workHours?.toFixed(1) ?? "0.0"}h
                        </span>
                      </td>
                      <td className="px-8 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border uppercase
                          ${active ? "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse" : "bg-white/5 text-slate-500 border-white/5"}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${active ? "bg-blue-500" : "bg-slate-600"}`}
                          />
                          {active ? "Active" : "Done"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
