  import { useAuth } from "@/context/AuthContext";

  const WelcomeCard = () => {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', month: 'long', day: 'numeric' 
  });

  return (
    <div className="relative overflow-hidden bg-white rounded-3xl p-8 border border-slate-200 shadow-sm h-full flex flex-col justify-center">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <p className="text-blue-600 font-semibold text-sm mb-1 uppercase tracking-wider">{today}</p>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Good day, {user?.name?.split(' ')[0] || "Team Member"} <span className="animate-pulse">👋</span>
          </h1>
          <p className="text-slate-500 mt-2 max-w-md">
            Your performance this week is 12% higher than average. Keep up the great work!
          </p>
        </div>

        <div className="mt-6 md:mt-0 flex flex-col items-end">
          <div className="px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-tighter">
              Account: {user?.role || "Staff"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

  export default WelcomeCard