import { Users, CalendarOff, ClockAlert, PartyPopper, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react";

const TodaySummary = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      <SummaryCard 
        title="Active Attendance" 
        value="94.2%" 
        label="82 of 88 employees"
        icon={<Users size={28} />}
        trend="+2.1%"
        trendUp={true}
        color="blue"
        progress={94}
      />
      <SummaryCard 
        title="On Leave Today" 
        value="06" 
        label="4 Planned • 2 Sick"
        icon={<CalendarOff size={28} />}
        trend="Stable"
        trendUp={null}
        color="rose"
        progress={15}
      />
      <SummaryCard 
        title="Late Check-ins" 
        value="03" 
        label="Immediate attention"
        icon={<ClockAlert size={28} />}
        trend="-12%"
        trendUp={false}
        color="amber"
        progress={40}
      />
      <SummaryCard 
        title="Next Holiday" 
        value="Aug 15" 
        label="Independence Day"
        icon={<PartyPopper size={28} />}
        trend="In 14 Days"
        trendUp={null}
        color="indigo"
        progress={100}
      />
    </div>
  );
};

const SummaryCard = ({ title, value, label, icon, trend, trendUp, color, progress }: any) => {
  // Enhanced theme mapping with full card gradients
  const themes: any = {
    blue: {
      text: "text-blue-700",
      bg: "bg-blue-600",
      lightBg: "bg-blue-50/50",
      gradient: "from-blue-50/50 to-white",
      border: "border-blue-100",
      iconBg: "bg-blue-100/80 text-blue-700"
    },
    rose: {
      text: "text-rose-700",
      bg: "bg-rose-600",
      lightBg: "bg-rose-50/50",
      gradient: "from-rose-50/50 to-white",
      border: "border-rose-100",
      iconBg: "bg-rose-100/80 text-rose-700"
    },
    amber: {
      text: "text-amber-700",
      bg: "bg-amber-600",
      lightBg: "bg-amber-50/50",
      gradient: "from-amber-50/50 to-white",
      border: "border-amber-100",
      iconBg: "bg-amber-100/80 text-amber-700"
    },
    indigo: {
      text: "text-indigo-700",
      bg: "bg-indigo-600",
      lightBg: "bg-indigo-50/50",
      gradient: "from-indigo-50/50 to-white",
      border: "border-indigo-100",
      iconBg: "bg-indigo-100/80 text-indigo-700"
    },
  };

  const t = themes[color] || themes.blue;

  return (
    <div className={`group relative bg-gradient-to-br ${t.gradient} rounded-[2.5rem] p-10 border ${t.border} shadow-sm hover:shadow-2xl hover:shadow-slate-300/40 hover:-translate-y-3 transition-all duration-500 ease-out overflow-hidden`}>
      
      {/* Dynamic Animated Glow (Hover Effect) */}
      <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 ${t.bg}`}></div>

      <div className="flex justify-between items-start relative z-10">
        <div className={`p-5 rounded-3xl shadow-sm ${t.iconBg} transition-transform duration-500 group-hover:scale-110`}>
          {icon}
        </div>
        
        {trend && (
          <div className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-black tracking-tighter border shadow-sm ${
            trendUp === true ? 'bg-emerald-100/80 text-emerald-700 border-emerald-200' : 
            trendUp === false ? 'bg-rose-100/80 text-rose-700 border-rose-200' : 'bg-white/80 text-slate-500 border-slate-200'
          }`}>
            {trendUp === true && <ArrowUpRight size={14} />}
            {trendUp === false && <ArrowDownRight size={14} />}
            {trend}
          </div>
        )}
      </div>

      <div className="mt-10 relative z-10">
        <h3 className="text-slate-500 text-[12px] font-bold uppercase tracking-[0.2em] mb-3 opacity-80">{title}</h3>
        <div className="flex items-baseline gap-2">
          <span className={`text-6xl font-black tracking-tighter transition-all duration-300 ${t.text}`}>
            {value}
          </span>
        </div>
        <p className="text-slate-500 text-base mt-4 font-semibold flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full animate-pulse ${t.bg}`}></span>
          {label}
        </p>
      </div>
      
      {/* Big Visual Progress Indicator */}
      <div className="mt-10">
        <div className="flex justify-between text-[11px] font-black text-slate-400 mb-3 uppercase tracking-widest">
          <span>Daily Goal</span>
          <span className={t.text}>{progress}%</span>
        </div>
        <div className="h-3 w-full bg-white/60 backdrop-blur-sm rounded-full overflow-hidden border border-white/40">
          <div 
            className={`h-full rounded-full transition-all duration-1000 ease-in-out group-hover:brightness-105 ${t.bg}`} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default TodaySummary;