import { useEffect, useState } from 'react';
import api from '@/api/axios';
import {Clock, BarChart3, TrendingUp, Info } from 'lucide-react';

interface AttendanceRecord {
  _id: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  workHours: number;
  status: string;
}

const EmployeeAttendanceHistory = () => {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/attendance/my');
        const sorted = res.data.sort((a: any, b: any) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setHistory(sorted);
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="bg-[#0F172A] p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/20 border border-slate-800 transition-all duration-500">
      {/* 1. Header with Midnight Aesthetic */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 border-b border-slate-800 pb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/40">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight uppercase">Attendance <span className="text-blue-500">Analytics</span></h2>
              <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-1 opacity-80">Performance & Hour Distribution</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/50 px-5 py-2.5 rounded-2xl border border-slate-800">
          <TrendingUp className="text-emerald-500" size={18} />
          <span className="text-sm font-black text-slate-300 uppercase tracking-tighter">Target: 8.0h</span>
          <Info size={14} className="text-slate-600 cursor-help hover:text-blue-400 transition-colors" />
        </div>
      </div>

      {/* 2. Responsive Grid with Midnight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
        {history.length > 0 ? (
          history.slice(0, 14).map((record) => {
            const isTargetMet = record.workHours >= 8;
            const weekday = new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = new Date(record.date).toLocaleDateString('en-US', { day: 'numeric' });
            const month = new Date(record.date).toLocaleDateString('en-US', { month: 'short' });

            return (
              <div 
                key={record._id} 
                className="group relative bg-slate-900/40 rounded-3xl p-6 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all duration-300 overflow-hidden"
              >
                {/* Glowing Status Indicator */}
                <div className={`absolute top-4 right-4 h-2 w-2 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${
                  isTargetMet 
                  ? 'bg-emerald-500 shadow-emerald-500/40' 
                  : 'bg-amber-500 shadow-amber-500/40'
                }`}></div>

                <div className="flex flex-col items-center relative z-10">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 group-hover:text-blue-400 transition-colors">
                    {weekday}
                  </span>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-2xl font-black text-white tracking-tighter">{dayNum}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{month}</span>
                  </div>
                  
                  {/* Midnight Work Gauge */}
                  <div className={`relative flex items-center justify-center h-16 w-16 rounded-full border-[3px] mb-6 transition-transform group-hover:scale-110 ${
                    isTargetMet ? 'border-emerald-500/20' : 'border-amber-500/20'
                  }`}>
                    <span className={`text-base font-black ${isTargetMet ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {record.workHours?.toFixed(1) || 0}
                    </span>
                    <span className="absolute -bottom-2 text-[8px] font-black bg-[#0F172A] px-2 py-0.5 rounded-md uppercase text-slate-500 border border-slate-800">Hrs</span>
                  </div>

                  {/* Micro Timeline */}
                  <div className="w-full space-y-3">
                    <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
                      <span>In: {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.3)] ${
                          isTargetMet ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} 
                        style={{ width: `${Math.min((record.workHours / 8) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center bg-slate-900/50 rounded-[2.5rem] border border-dashed border-slate-800">
            <Clock className="mx-auto text-slate-700 mb-4 animate-pulse" size={48} />
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">No Activity Records Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAttendanceHistory;