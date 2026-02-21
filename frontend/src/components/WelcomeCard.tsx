import { useAuth } from "@/context/AuthContext";
import { Sparkles, Calendar, TrendingUp, ShieldCheck } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

const WelcomeCard = () => {
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);

  // 1. Prevent Hydration Errors
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. Deployment-Safe Date Logic
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric' 
  });

  // If not mounted yet, return a simplified "Loading" state to prevent flicker
  if (!mounted) return <div className="h-full bg-[#0F172A] rounded-[2.5rem] animate-pulse" />;

  return (
    <div className="relative overflow-hidden bg-[#0F172A] rounded-[2.5rem] p-8 md:p-10 border border-slate-800 shadow-2xl h-full flex flex-col justify-center group transition-all duration-500 hover:shadow-blue-900/40">
      
      {/* Interactive Animated Glows */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 bg-blue-600 rounded-full blur-[100px] opacity-20 group-hover:opacity-30 transition-opacity"></div>
      
      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center gap-2">
                <Calendar size={14} className="text-blue-400" />
                <span className="text-blue-400 font-black text-[10px] uppercase tracking-[0.2em]">
                  {today}
                </span>
             </div>
             {user?.role === 'admin' && (
               <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                 <ShieldCheck size={12} className="text-emerald-400" />
                 <span className="text-emerald-400 font-black text-[10px] uppercase tracking-tighter">System Root</span>
               </div>
             )}
          </div>

          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              {greeting},<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-200 to-indigo-400">
                {user?.name?.split(' ')[0] || "Partner"}
              </span> 
              <span className="inline-block animate-bounce ml-2">
                {greeting === "Good Morning" ? "☕" : greeting === "Good Afternoon" ? "☀️" : "🌙"}
              </span>
            </h1>
            
            <p className="text-slate-400 mt-4 max-w-sm text-sm font-medium leading-relaxed">
              Everything looks great today. Your <span className="text-blue-400 font-bold underline decoration-blue-500/30 underline-offset-4">WorkSync Dashboard</span> is active and synced.
            </p>
          </div>
        </div>

        {/* Stats Widget */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 w-full lg:w-auto">
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-5 rounded-3xl flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400">
              <TrendingUp size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Efficiency</p>
              <h3 className="text-xl font-bold text-white">+12.4%</h3>
            </div>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-5 rounded-3xl flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-400">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Paid Balance</p>
              <h3 className="text-xl font-bold text-white">{user?.leaveBalance?.paid || 0} Days</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;