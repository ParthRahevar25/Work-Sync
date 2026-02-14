import api from "@/api/axios";
import { useEffect, useState, useMemo } from "react";
import { Search, Download,User, ArrowRightLeft, Timer, Calendar, Mail } from "lucide-react";

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

  // 1. Filter logic for Search
  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => 
      log.employeeId.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.employeeId.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allLogs, searchTerm]);

  return (
   <div className="space-y-8 animate-in fade-in duration-700">
      {/* 1. Action Bar matching the Dark Theme */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-[#0F172A] p-6 rounded-[2.5rem] border border-slate-800 shadow-2xl shadow-blue-900/20">
        <div className="relative w-full md:w-[500px]">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-400" size={20} />
          <input 
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-14 pr-6 py-4 bg-slate-900/50 border border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-slate-500 font-medium"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20">
          <Download size={18} /> Export Data
        </button>
      </div>

      {/* 2. Unified Data Grid Container */}
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            {/* --- Matching Midnight Dark Header --- */}
            <thead className="bg-[#0F172A] border-b border-slate-800">
              <tr>
                <th className="px-8 py-6 text-xs font-black text-blue-100/80 uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-blue-400" /> Team Member
                  </div>
                </th>
                <th className="px-8 py-6 text-xs font-black text-blue-100/80 uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-blue-400" /> Session Timeline
                  </div>
                </th>
                <th className="px-8 py-6 text-xs font-black text-blue-100/80 uppercase tracking-[0.2em]">
                  <div className="flex items-center gap-2">
                    <Timer size={14} className="text-blue-400" /> Duration
                  </div>
                </th>
                <th className="px-8 py-6 text-xs font-black text-blue-100/80 uppercase tracking-[0.2em] text-right">Activity Status</th>
              </tr>
            </thead>

            {/* --- Matching Body Style --- */}
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log._id} className="group hover:bg-blue-50/40 transition-colors duration-200">
                  
                  {/* Employee Info Cell */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-800 to-blue-900 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-900/20 ring-2 ring-white">
                        {log.employeeId.name?.charAt(0) || "U"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-base font-bold text-slate-900 leading-none mb-1 group-hover:text-blue-700 transition-colors">
                          {log.employeeId.name || "Unknown User"}
                        </span>
                        <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                          <Mail size={12} className="text-blue-400" /> {log.employeeId.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Timeline Cell */}
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                       <span className="inline-flex w-fit px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-wider border border-slate-200">
                        {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                        <span className="text-blue-600">
                          {new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <ArrowRightLeft size={12} className="text-slate-300" />
                        <span className="text-blue-600">
                          {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "---"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Work Duration Cell */}
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-2">
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full w-fit border ring-1 ring-inset ${
                        log.workHours >= 8 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-600/10' 
                        : 'bg-amber-50 text-amber-700 border-amber-100 ring-amber-600/10'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${log.workHours >= 8 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span className="text-xs font-black uppercase tracking-tighter">{log.workHours.toFixed(1)}h Logged</span>
                      </div>
                    </div>
                  </td>

                  {/* Status Cell */}
                  <td className="px-8 py-6 text-right">
                    {!log.checkOut ? (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm animate-pulse">
                        <span className="h-2 w-2 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-100">
                        <span className="h-2 w-2 rounded-full bg-slate-400"></span>
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