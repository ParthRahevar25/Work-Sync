import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock, Bot, UserCircle, ArrowUpRight } from "lucide-react";

const actions = [
  { 
    title: "Apply Leave", 
    desc: "Request time off work",
    icon: <CalendarDays size={28} />, 
    color: "blue",
    glow: "group-hover:shadow-blue-500/40",
    path: "/leave" 
  },
  { 
    title: "Attendance", 
    desc: "Review your work logs",
    icon: <Clock size={28} />, 
    color: "emerald",
    glow: "group-hover:shadow-emerald-500/40",
    path: "/attendance" 
  },
  { 
    title: "Nexus AI", 
    desc: "Chat with HR Assistant",
    icon: <Bot size={28} />, 
    color: "purple",
    glow: "group-hover:shadow-purple-500/40",
    path: "/ai-chat" 
  },
  { 
    title: "Settings", 
    desc: "Update your profile",
    icon: <UserCircle size={28} />, 
    color: "amber",
    glow: "group-hover:shadow-amber-500/40",
    path: "/settings" 
  },
];

const QuickActions = () => {
  const navigate = useNavigate();

  const themes: any = {
    blue: {
      iconDefault: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      iconActive: "group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-400",
      bar: "from-blue-400 via-blue-500 to-cyan-400",
      text: "group-hover:text-blue-400",
      border: "group-hover:border-blue-500/50"
    },
    emerald: {
      iconDefault: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      iconActive: "group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-400",
      bar: "from-emerald-400 via-emerald-500 to-teal-400",
      text: "group-hover:text-emerald-400",
      border: "group-hover:border-emerald-500/50"
    },
    purple: {
      iconDefault: "bg-purple-500/10 text-purple-400 border-purple-500/30",
      iconActive: "group-hover:bg-purple-500 group-hover:text-white group-hover:border-purple-400",
      bar: "from-purple-400 via-purple-500 to-fuchsia-400",
      text: "group-hover:text-purple-400",
      border: "group-hover:border-purple-500/50"
    },
    amber: {
      iconDefault: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      iconActive: "group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-400",
      bar: "from-amber-400 via-amber-500 to-orange-400",
      text: "group-hover:text-amber-400",
      border: "group-hover:border-amber-500/50"
    },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {actions.map((action) => {
        const theme = themes[action.color];
        
        return (
          <button
            key={action.title}
            onClick={() => navigate(action.path)}
            className={`group relative flex flex-col items-start p-8 bg-[#0F172A] border border-slate-800 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-3 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${theme.border} ${action.glow}`}
          >
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none"></div>

            {/* Floating Arrow */}
            <div className={`absolute top-8 right-8 text-slate-700 transition-all duration-300 ${theme.text} group-hover:translate-x-1 group-hover:-translate-y-1`}>
              <ArrowUpRight size={24} strokeWidth={3} />
            </div>

            {/* High-Contrast Icon Box */}
            <div className={`p-5 rounded-2xl mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 border shadow-lg ${theme.iconDefault} ${theme.iconActive}`}>
              {action.icon}
            </div>

            {/* Text Content */}
            <div className="text-left relative z-10">
              <h3 className="text-xl font-black text-white tracking-tight mb-2 group-hover:scale-105 transition-transform origin-left">
                {action.title}
              </h3>
              <p className="text-sm font-bold text-slate-500 leading-relaxed group-hover:text-slate-300 transition-colors">
                {action.desc}
              </p>
            </div>

            {/* Vivid Animated Bar */}
            <div className="mt-8 w-full h-[3px] bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full w-0 group-hover:w-full transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) bg-gradient-to-r ${theme.bar} shadow-[0_0_15px_rgba(59,130,246,0.5)]`}></div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;