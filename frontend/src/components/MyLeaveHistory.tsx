import {useEffect, useState, type JSX } from "react";
import api from "@/api/axios";
import { Activity,Clock, CheckCircle2, XCircle, CalendarDays } from "lucide-react";

interface MyLeaveHistoryProps {
  refresh: number;
}

const MyLeaveHistory = ({ refresh }: MyLeaveHistoryProps) => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchMyHistory = async () => {
      try {
        const res = await api.get("/leaves/my");
        setHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch personal leave history");
      }
    };
    fetchMyHistory();
  }, [refresh]);

  const getStatusConfig = (status: string): { bg: string; dot: string; icon: JSX.Element } => {
    switch (status) {
      case "Approved":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
          dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
          icon: <CheckCircle2 size={12} />,
        };
      case "Rejected":
        return {
          bg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
          dot: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
          icon: <XCircle size={12} />,
        };
      default:
        return {
          bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
          dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
          icon: <Clock size={12} />,
        };
    }
  };

  return (
  <div className="bg-[#0F172A] rounded-[2.5rem] border border-slate-800 shadow-2xl shadow-blue-900/20 flex flex-col h-full overflow-hidden transition-all duration-500">
      
      {/* Header */}
      <div className="p-10 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <span className="text-blue-500 bg-blue-500/10 p-2 rounded-xl">
              <Activity size={24} />
            </span>
            <h3 className="font-black text-white text-lg uppercase tracking-[0.1em]">History Log</h3>
        </div>
        <span className="text-xs font-black bg-blue-600 px-4 py-1.5 rounded-full text-white uppercase tracking-wider shadow-lg">
          {history.length}
        </span>
      </div>

      {/* History List - Scrollable area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {history.length > 0 ? (
          <div className="relative space-y-6">
            {/* Timeline Line */}
            <div className="absolute left-[17px] top-4 bottom-4 w-[2px] bg-slate-800 hidden sm:block"></div>

            {history.map((item) => {
              const config = getStatusConfig(item.status);
              return (
                <div key={item._id} className="group relative pl-10 transition-all duration-300">
                  {/* Status Dot */}
                  <div className={`absolute left-0 top-2 h-4.5 w-4.5 rounded-full border-[3px] border-[#0F172A] z-10 ${config.dot}`} />
                  
                  <div className="p-6 bg-slate-900/40 border border-slate-800/50 hover:border-blue-500/50 hover:bg-slate-800/60 rounded-3xl transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="text-base font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                          {item.type} Leave
                        </span>
                        <div className="flex items-center gap-2 mt-2 text-slate-400 font-bold text-sm">
                          <CalendarDays size={14} className="text-blue-500" />
                          <span>{new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${config.bg}`}>
                        {config.icon}
                        {item.status}
                      </div>
                    </div>

                    {item.reason && (
                      <div className="bg-black/20 p-4 rounded-2xl border border-slate-800/40">
                        <p className="text-sm text-slate-400 leading-relaxed italic font-medium">
                          "{item.reason}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
            <Activity size={48} className="text-slate-700 mb-4" />
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No Records Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLeaveHistory;