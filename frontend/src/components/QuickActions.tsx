import { useNavigate } from "react-router-dom";
import { CalendarDays, Clock, Bot, UserCircle, ArrowUpRight } from "lucide-react";

const actions = [
  { 
    title: "Apply Leave", 
    desc: "Request time off work",
    icon: <CalendarDays size={32} />, 
    color: "blue",
    path: "/leave" 
  },
  { 
    title: "Attendance", 
    desc: "Review your work logs",
    icon: <Clock size={32} />, 
    color: "emerald",
    path: "/attendance" 
  },
  { 
    title: "Nexus AI", 
    desc: "Chat with HR Assistant",
    icon: <Bot size={32} />, 
    color: "purple",
    path: "/ai-chat" 
  },
  { 
    title: "Settings", 
    desc: "Update your profile",
    icon: <UserCircle size={32} />, 
    color: "slate",
    path: "/settings" 
  },
];

const QuickActions = () => {
  const navigate = useNavigate();

  const themes: any = {
    blue: "from-blue-600 to-blue-700 text-blue-600 shadow-blue-100 bg-blue-50/50 hover:border-blue-200",
    emerald: "from-emerald-600 to-emerald-700 text-emerald-600 shadow-emerald-100 bg-emerald-50/50 hover:border-emerald-200",
    purple: "from-violet-600 to-violet-700 text-violet-600 shadow-purple-100 bg-purple-50/50 hover:border-purple-200",
    slate: "from-slate-700 to-slate-800 text-slate-700 shadow-slate-100 bg-slate-50/50 hover:border-slate-300",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {actions.map((action) => {
        const theme = themes[action.color];
        
        return (
          <button
            key={action.title}
            onClick={() => navigate(action.path)}
            className={`group relative flex flex-col items-start p-8 bg-white border border-slate-100 rounded-[2.5rem] transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200/60 hover:-translate-y-3 ${theme.split(' ').pop()}`}
          >
            {/* Top Right Arrow Indicator */}
            <div className="absolute top-8 right-8 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300">
              <ArrowUpRight size={24} />
            </div>

            {/* Icon Box */}
            <div className={`p-5 rounded-3xl mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${theme.split(' ').slice(4, 5).join(' ')} ${theme.split(' ').slice(2, 3).join(' ')}`}>
              {action.icon}
            </div>

            {/* Content */}
            <div className="text-left">
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
                {action.title}
              </h3>
              <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-[150px]">
                {action.desc}
              </p>
            </div>

            {/* Visual Decorative Bar */}
            <div className="mt-8 w-12 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div className={`h-full w-0 group-hover:w-full transition-all duration-700 bg-gradient-to-r ${theme.split(' ').slice(0, 2).join(' ')}`}></div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;