import { useAuth } from "@/context/AuthContext"; 
import AttendanceCard from "@/components/AttendanceCard";
import EmployeeAttendanceHistory from "@/components/EmployeeAttendanceHistory";
import AdminAttendanceView from "@/components/AdminAttendanceView";

const Attendance = () => {
  const { user } = useAuth(); 

  return (
    <div className="max-w-[1600px] mx-auto p-6 lg:p-10 space-y-10 animate-in fade-in duration-700">
      {/* 1. Header Section */}
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          Attendance <span className="text-blue-600">Portal</span>
        </h1>
        <p className="text-slate-500 mt-2 font-semibold">Monitor real-time sessions and historical performance.</p>
      </div>

      {/* 2. Top Grid: Timer & History matched in height */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Timer (Check-in Card) */}
        <div className="lg:col-span-4 flex flex-col">
          <AttendanceCard />
        </div>

        {/* Right Column: Personal History Logs */}
        <div className="lg:col-span-8 flex flex-col">
          <EmployeeAttendanceHistory />
        </div>
      </div>

      {/* 3. Admin Section: Organization Overview */}
      {(user?.role === "admin" || user?.role === "manager") && (
        <div className="pt-12">
          <div className="flex items-center gap-4 mb-8 px-2">
            <div className="h-12 w-1 shadow-xl bg-blue-600 rounded-full"></div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Organization Overview</h2>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest opacity-70">Administrative Session Control</p>
            </div>
          </div>
          <AdminAttendanceView />
        </div>
      )}
    </div>
  );
};

export default Attendance;