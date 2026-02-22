import { useEffect, useState } from "react";
import api from "@/api/axios";
import {
  Users,
  CalendarOff,
  ClockAlert,
  PartyPopper,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface DashboardStats {
  attendance: { percentage: string; label: string };
  leaves: { count: string; label: string };
  late: { count: string; label: string };
}

const TodaySummary = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/summary");
        setStats(res.data);
        setError(false);
      } catch (err) {
        console.error("Dashboard Sync Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-64 bg-slate-900/20 animate-pulse rounded-[2.5rem] border border-white/5"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400 flex items-center gap-3">
        <ClockAlert /> Failed to synchronize real-time data. Please check
        connection.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {/* 1. Active Attendance */}
      <SummaryCard
        title="Active Attendance"
        value={`${stats?.attendance.percentage}%`}
        label={stats?.attendance.label}
        icon={<Users size={24} />}
        trend="+2.1%" // Static trend for now, or add to backend
        trendUp={true}
        color="blue"
        progress={parseFloat(stats?.attendance.percentage || "0")}
      />

      {/* 2. On Leave Today */}
      <SummaryCard
        title="On Leave Today"
        value={stats?.leaves.count || "00"}
        label={stats?.leaves.label}
        icon={<CalendarOff size={24} />}
        trend="Stable"
        trendUp={null}
        color="rose"
        progress={stats?.leaves.count !== "00" ? 15 : 0}
      />

      {/* 3. Late Check-ins */}
      <SummaryCard
        title="Late Check-ins"
        value={stats?.late.count || "00"}
        label={stats?.late.label}
        icon={<ClockAlert size={24} />}
        trend="-12%"
        trendUp={false}
        color="amber"
        progress={stats?.late.count !== "00" ? 40 : 0}
      />

      {/* 4. Next Holiday */}
      <SummaryCard
        title="Next Holiday"
        value="Aug 15"
        label="Independence Day"
        icon={<PartyPopper size={24} />}
        trend="In 14 Days"
        trendUp={null}
        color="indigo"
        progress={100}
      />
    </div>
  );
};

/* --- The Card Component  --- */
const SummaryCard = ({
  title,
  value,
  label,
  icon,
  trend,
  trendUp,
  color,
  progress,
}: any) => {
  const themes: any = {
    blue: { text: "text-blue-400", bg: "bg-blue-600" },
    rose: { text: "text-rose-400", bg: "bg-rose-600" },
    amber: { text: "text-amber-400", bg: "bg-amber-600" },
    indigo: { text: "text-indigo-400", bg: "bg-indigo-600" },
  };
  const t = themes[color] || themes.blue;

  return (
    <div className="group relative bg-slate-900/40 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white/10 shadow-2xl hover:border-white/20 hover:-translate-y-2 transition-all duration-500 ease-out overflow-hidden">
      <div
        className={`absolute -right-6 -top-6 w-32 h-30 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 ${t.bg}`}
      ></div>

      <div className="flex justify-between items-start relative z-10">
        <div
          className={`p-4 rounded-2xl bg-white/5 border border-white/10 ${t.text} transition-transform duration-500 group-hover:scale-110`}
        >
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase border transition-colors ${
              trendUp === true
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : trendUp === false
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : "bg-white/5 text-slate-400 border-white/10"
            }`}
          >
            {trendUp === true && <ArrowUpRight size={12} />}
            {trendUp === false && <ArrowDownRight size={12} />}
            {trend}
          </div>
        )}
      </div>

      <div className="mt-8 relative z-10">
        <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">
          {title}
        </h3>
        <span className="text-5xl font-black tracking-tighter text-white">
          {value}
        </span>
        <p className="text-slate-400 text-xs mt-3 font-bold flex items-center gap-2">
          <span
            className={`h-1.5 w-1.5 rounded-full animate-pulse ${t.bg}`}
          ></span>
          {label}
        </p>
      </div>

      <div className="mt-8">
        <div className="flex justify-between text-[9px] font-black text-slate-500 mb-2 uppercase tracking-widest">
          <span>Capacity</span>
          <span className={t.text}>{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-in-out ${t.bg}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TodaySummary;
