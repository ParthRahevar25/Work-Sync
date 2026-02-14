import { useEffect, useState } from "react";
import api from "@/api/axios";
import { useAuth } from "@/context/AuthContext";
import AdminLeaveApproval from "@/components/AdminLeaveApproval";
import MyLeaveHistory from "@/components/MyLeaveHistory";
import { Calendar, Info, PieChart, Send, ShieldCheck } from "lucide-react";

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

  // Industry-standard: Show max days to help user visualize consumption
  const maxBalance = { casual: 12, sick: 6, paid: 6 };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/leaves/apply", formData);
      setRefreshTrigger((prev) => prev + 1);
      // Reset form on success
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
    <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 p-4 lg:p-8">
      {/* 1. Page Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            Leave <span className="text-blue-600">Management</span>
          </h1>
          <p className="text-slate-500 mt-2 font-semibold flex items-center gap-2">
            <PieChart size={18} className="text-blue-500" />
            Track your utilization and request time off
          </p>
        </div>
      </div>

      {/* 2. Midnight Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(balance).map(([key, val]) => {
          const percentage =
            (val / maxBalance[key as keyof typeof maxBalance]) * 100;
          return (
            <div
              key={key}
              className="bg-[#0F172A] p-8 rounded-[2.5rem] shadow-2xl shadow-blue-900/20 border border-slate-800 relative overflow-hidden group"
            >
              {/* Subtle background glow */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-600 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"></div>

              <div className="flex justify-between items-start relative z-10 mb-6">
                <p className="text-blue-400 text-xs font-black uppercase tracking-[0.2em]">
                  {key} Allocation
                </p>
                <div className="p-3 bg-slate-800 rounded-2xl text-blue-400">
                  <Calendar size={20} />
                </div>
              </div>

              <div className="relative z-10 flex items-baseline gap-3">
                <span className="text-5xl font-black text-white tracking-tighter">
                  {val}
                </span>
                <span className="text-slate-500 font-bold text-lg">
                  / {maxBalance[key as keyof typeof maxBalance]} Days
                </span>
              </div>

              <div className="mt-8 relative z-10">
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">
                  <span>Available Capacity</span>
                  <span className="text-blue-400">
                    {Math.round(percentage)}%
                  </span>
                </div>
                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(37,99,235,0.4)] ${percentage < 25 ? "bg-rose-500" : "bg-blue-500"}`}
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
        {/* Form Column - Deep Slate/Midnight Style */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-200 h-full flex flex-col">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-14 w-14 bg-[#0F172A] rounded-2xl flex items-center justify-center text-blue-400 shadow-xl">
                <Send size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Submit Application
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                  Draft a new leave request for approval
                </p>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex-1 flex flex-col space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                    Period Start
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-700 shadow-inner"
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                    Period End
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-700 shadow-inner"
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Leave Category
                </label>
                <select
                  value={formData.type}
                  className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold text-slate-700 appearance-none shadow-inner"
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                >
                  <option value="Casual">Casual Leave (General)</option>
                  <option value="Sick">Sick Leave (Medical)</option>
                  <option value="Paid">Paid Leave (Privileged)</option>
                </select>
              </div>

              {/* FIXED: 'flex-1' and 'min-h-[160px]' allows this box to grow and fill the gap */}
              <div className="space-y-3 flex-1 flex flex-col">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">
                  Detailed Justification
                </label>
                <textarea
                  required
                  value={formData.reason}
                  className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-3xl flex-1 min-h-[160px] focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-slate-700 shadow-inner leading-relaxed resize-none"
                  placeholder="Explain the reason for your absence..."
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                />
              </div>

              {/* Footer stays at the bottom */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-4">
                <div className="flex items-center gap-3 text-slate-400 bg-slate-50 px-6 py-4 rounded-2xl border border-dashed border-slate-300">
                  <Info size={20} className="text-blue-500" />
                  <p className="text-xs font-bold leading-tight uppercase tracking-wider">
                    Estimated Review:{" "}
                    <span className="text-slate-600">24-48 Hours</span>
                  </p>
                </div>
                <button
                  disabled={loading}
                  className="px-12 py-5 bg-[#0F172A] hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Dispatch Request"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* 4. Sidebar History */}
        <div className="lg:col-span-4 flex flex-col">
          <MyLeaveHistory refresh={refreshTrigger} />
        </div>
      </div>

      {/* 5. Admin Section - Midnight Dark Header */}
      {(user?.role === "admin" || user?.role === "manager") && (
        <div className="pt-20">
          <div className="flex items-center gap-5 mb-10 px-2">
            <div className="h-16 w-16 bg-[#0F172A] rounded-[1.5rem] flex items-center justify-center text-blue-400 shadow-2xl ring-4 ring-blue-500/10">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                Organization{" "}
                <span className="text-blue-600 text-xl font-bold italic ml-2 tracking-normal">
                  Control
                </span>
              </h2>
              <p className="text-slate-500 text-sm font-bold tracking-widest uppercase opacity-80">
                Administrative Review Portal
              </p>
            </div>
            <div className="h-px flex-1 bg-slate-200 ml-10"></div>
          </div>
          <AdminLeaveApproval />
        </div>
      )}
    </div>
  );
};

export default LeavePage;
