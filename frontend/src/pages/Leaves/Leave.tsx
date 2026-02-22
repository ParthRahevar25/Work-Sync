import { useEffect, useState } from "react";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import AdminLeaveApproval from "@/components/AdminLeaveApproval";
import MyLeaveHistory from "@/components/MyLeaveHistory";
import { Calendar, Info, PieChart, Send } from "lucide-react";

const LeavePage = () => {
  const { user } = useAuth();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    type: "Casual",
  });
  const [balance, setBalance] = useState({ casual: 0, sick: 0, paid: 0 });

  const maxBalance = { casual: 12, sick: 6, paid: 6 };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/leaves/apply", formData);
      setRefreshTrigger((prev) => prev + 1);
      setFormData({ startDate: "", endDate: "", reason: "", type: "Casual" });
      alert("Application submitted successfully!");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to apply");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data.leaveBalance) setBalance(res.data.leaveBalance);
      } catch (err) {
        console.error("Failed to fetch balance");
      }
    };
    fetchBalance();
  }, [refreshTrigger]);

  return (
    <div className="relative z-10 p-6 lg:p-10 min-h-screen">
      <div className="mx-auto max-w-[1600px] space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* 1. Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Leave <span className="text-blue-500">Management</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1 flex items-center gap-2">
              <PieChart size={16} className="text-blue-500" />
              Track utilization and request time off
            </p>
          </div>
          <div className="h-[1px] flex-1 bg-white/10 mx-8 hidden md:block"></div>
        </div>

        {/* 2. Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.entries(balance).map(([key, val]) => {
            const percentage = (val / maxBalance[key as keyof typeof maxBalance]) * 100;
            return (
              <div key={key} className="bg-slate-900/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group shadow-2xl">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600 rounded-full blur-3xl opacity-10 group-hover:opacity-25 transition-opacity"></div>
                
                <div className="flex justify-between items-start relative z-10 mb-6">
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                    {key} Allocation
                  </p>
                  <div className="p-3 bg-white/5 rounded-2xl text-blue-400 border border-white/5">
                    <Calendar size={18} />
                  </div>
                </div>

                <div className="relative z-10 flex items-baseline gap-3">
                  <span className="text-5xl font-black text-white tracking-tighter">{val}</span>
                  <span className="text-slate-500 font-bold text-lg">/ {maxBalance[key as keyof typeof maxBalance]}</span>
                </div>

                <div className="mt-8 relative z-10">
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">
                    <span>Available Capacity</span>
                    <span className="text-blue-400">{Math.round(percentage)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(59,130,246,0.3)] ${percentage < 25 ? "bg-rose-500" : "bg-blue-600"}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Main Form & History Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Form Column */}
          <div className="lg:col-span-8 flex flex-col">
            <div className="bg-slate-900/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/10 h-full flex flex-col shadow-2xl">
              <div className="flex items-center gap-4 mb-10">
                <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-900/40">
                  <Send size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight uppercase">Submit Application</h2>
                  <p className="text-slate-400 text-sm font-medium">Draft a new leave request for approval</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-500 uppercase ml-2 tracking-widest">Period Start</label>
                    <input type="date" required value={formData.startDate} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 transition-all font-bold"
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-blue-500 uppercase ml-2 tracking-widest">Period End</label>
                    <input type="date" required value={formData.endDate} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 transition-all font-bold"
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-500 uppercase ml-2 tracking-widest">Leave Category</label>
                  <select value={formData.type} className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 transition-all font-bold appearance-none"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                    <option value="Casual" className="bg-[#0b1120]">Casual Leave (General)</option>
                    <option value="Sick" className="bg-[#0b1120]">Sick Leave (Medical)</option>
                    <option value="Paid" className="bg-[#0b1120]">Paid Leave (Privileged)</option>
                  </select>
                </div>

                <div className="space-y-2 flex-1 flex flex-col">
                  <label className="text-[10px] font-black text-blue-500 uppercase ml-2 tracking-widest">Justification</label>
                  <textarea required value={formData.reason} className="w-full p-5 bg-white/5 border border-white/10 rounded-3xl flex-1 min-h-[140px] text-white outline-none focus:border-blue-500 transition-all font-medium leading-relaxed resize-none"
                    placeholder="Reason for absence..." onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
                  <div className="flex items-center gap-3 text-slate-400 bg-white/5 px-6 py-4 rounded-2xl border border-white/10">
                    <Info size={18} className="text-blue-500" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Review: <span className="text-white">24-48 Hours</span></p>
                  </div>
                  <button disabled={loading} className="px-12 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-95">
                    {loading ? <span className="animate-pulse">Processing...</span> : "Dispatch Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col">
            <MyLeaveHistory refresh={refreshTrigger} />
          </div>
        </div>

        {/* 5. Admin Section */}
        {(user?.role === "admin" || user?.role === "manager") && (
          <section className="pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-4">
                <div className="h-10 w-1 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]"></div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                    Organization <span className="text-blue-500">Control</span>
                  </h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                    Administrative Review Portal
                  </p>
                </div>
              </div>
              <div className="h-[1px] flex-1 bg-white/5 mx-8 hidden md:block"></div>
            </div>
            <AdminLeaveApproval />
          </section>
        )}
      </div>
    </div>
  );
};

export default LeavePage;