import { useAuth } from "@/context/AuthContext"; 
import AttendanceCard from "@/components/AttendanceCard";
import EmployeeAttendanceHistory from "@/components/EmployeeAttendanceHistory";
import AdminAttendanceView from "@/components/AdminAttendanceView";
import { useState } from "react";

const Attendance = () => {
  const { user } = useAuth(); 
  const [refresh, setRefresh] = useState(0);
const triggerRefresh = () => setRefresh((prev) => prev + 1);
  return (
    <div className="relative z-10 p-6 lg:p-10 min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* 1. Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Attendance <span className="text-blue-500">Portal</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1">
              Monitor real-time sessions and historical performance.
            </p>
          </div>
          <div className="h-[1px] flex-1 bg-white/10 mx-8 hidden md:block"></div>
        </div>

        {/* 2. Top Grid: Timer & History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Timer (Check-in Card) */}
          <div className="lg:col-span-4 flex flex-col">
            <AttendanceCard onActionSuccess={triggerRefresh}/>
          </div>

          {/* Right Column: Personal History Logs */}
          <div className="lg:col-span-8 flex flex-col">
            <EmployeeAttendanceHistory refresh={refresh} />
          </div>
        </div>

        {/* 3. Admin Section: Organization Overview */}
        {(user?.role === "admin" || user?.role === "manager") && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 pt-8">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-4">
                <div className="h-10 w-1 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                    Organization <span className="text-blue-500">Overview</span>
                  </h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                    Administrative Session Control
                  </p>
                </div>
              </div>
              <div className="h-[1px] flex-1 bg-white/5 mx-8 hidden md:block"></div>
            </div>
            
            <AdminAttendanceView />
          </section>
        )}
      </div>
    </div>
  );
};

export default Attendance;