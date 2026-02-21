import api from "@/api/axios";
import { useEffect, useState, useMemo } from "react";
import { Search, Download, User, ArrowRightLeft, Timer, Calendar, Mail } from "lucide-react";

interface AdminAttendanceRecord {
  _id: string;
  employeeId: {
    email: string;
    name?: string;
    role?: string;
  };
  date: string;
  checkIn: string;
  checkOut?: string;
  workHours: number;
}

const AdminAttendanceView = () => {
  const [allLogs, setAllLogs] = useState<AdminAttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchAllLogs = async () => {
      try {
        const res = await api.get('/attendance/all');
        setAllLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      }
    };
    fetchAllLogs();
  }, []);

  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => 
      log.employeeId.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.employeeId.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allLogs, searchTerm]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* 1. Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl">
        <div className="relative w-full md:w-[500px]">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
          <input 
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-slate-500 font-medium"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 w-full md:w-auto">
          <Download size={18} /> Export Data
        </button>
      </div>

      {/* 2. Data Grid */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/[0.03] border-b border-white/10">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-2">
                    <User size={14} /> Team Member
                  </div>
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} /> Session Timeline
                  </div>
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-2">
                    <Timer size={14} /> Duration
                  </div>
                </th>
                <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] text-right">Activity Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {filteredLogs.map((log) => (
                <tr key={log._id} className="group hover:bg-white/[0.02] transition-colors duration-200">
                  
                  {/* Employee Info Cell */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                        {log.employeeId.name?.charAt(0) || "U"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                          {log.employeeId.name || "Unknown User"}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                          <Mail size={10} className="text-blue-500" /> {log.employeeId.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Timeline Cell */}
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1.5">
                       <span className="inline-flex w-fit px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-[9px] font-black uppercase tracking-widest border border-white/5">
                        {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <span className="text-blue-400">
                          {new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <ArrowRightLeft size={10} className="text-slate-600" />
                        <span className="text-blue-400">
                          {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "---"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Work Duration Cell */}
                  <td className="px-8 py-6">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit border ${
                      log.workHours >= 8 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${log.workHours >= 8 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-[10px] font-black uppercase tracking-wider">{log.workHours.toFixed(1)}h Logged</span>
                    </div>
                  </td>

                  {/* Status Cell */}
                  <td className="px-8 py-6 text-right">
                    {!log.checkOut ? (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 animate-pulse">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-white/5">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-600"></span>
                        Finished
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendanceView;