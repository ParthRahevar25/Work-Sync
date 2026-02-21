import api from "@/api/axios";
import { useEffect, useState } from "react";
import { Check, X, Mail, Calendar, User, Info, AlertCircle, ArrowRightLeft } from "lucide-react";

interface LeaveRequest {
  _id: string;
  employeeId: {
    name: string;
    email: string;
  };
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

const AdminLeaveApproval = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "Rejected":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await api.get("/leaves/all");
        const sorted = res.data.sort((a: any, b: any) => 
          a.status === 'Pending' ? -1 : 1
        );
        setRequests(sorted);
      } catch (err) {
        console.error("Failed to fetch leaves:", err);
      }
    };
    fetchLeaves();
  }, []);

  const updateStatus = async (id: string, newStatus: "Approved" | "Rejected") => {
    setProcessingId(id);
    try {
      await api.put(`/leaves/update/${id}`, { status: newStatus });
      setRequests(prev => prev.map(req => 
        req._id === id ? { ...req, status: newStatus } : req
      ));
    } catch (err) {
      alert("Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Header */}
          <thead className="bg-white/[0.03] border-b border-white/10">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2">
                  <User size={14} /> Employee Details
                </div>
              </th>
              <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2">
                  <Calendar size={14} /> Schedule
                </div>
              </th>
              <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2">
                  <Info size={14} /> Justification
                </div>
              </th>
              <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] text-right">Decision</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {requests.map((req) => (
              <tr key={req._id} className="group hover:bg-white/[0.02] transition-colors duration-200">
                {/* 1. Employee Info */}
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-sm font-bold shadow-inner">
                      {req.employeeId?.name?.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        {req.employeeId?.name}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                        <Mail size={10} className="text-blue-500" /> {req.employeeId?.email}
                      </span>
                    </div>
                  </div>
                </td>

                {/* 2. Schedule */}
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="inline-flex w-fit px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                      {req.type}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                      <span className="text-blue-400">{new Date(req.startDate).toLocaleDateString()}</span>
                      <ArrowRightLeft size={10} className="text-slate-600" />
                      <span className="text-blue-400">{new Date(req.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </td>

                {/* 3. Reason */}
                <td className="px-8 py-6">
                  <div className="max-w-xs">
                    <p className="text-[13px] text-slate-400 font-medium leading-relaxed line-clamp-2 italic border-l-2 border-white/10 pl-3">
                      "{req.reason}"
                    </p>
                  </div>
                </td>

                {/* 4. Status */}
                <td className="px-8 py-6">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black border uppercase tracking-widest ${getStatusStyle(req.status)}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${req.status === 'Approved' ? 'bg-emerald-500' : req.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'}`} />
                    {req.status}
                  </span>
                </td>

                {/* 5. Actions */}
                <td className="px-8 py-6 text-right">
                  {req.status === "Pending" ? (
                    <div className="flex justify-end items-center gap-2">
                      <button 
                        disabled={processingId === req._id}
                        onClick={() => updateStatus(req._id, "Approved")}
                        className="p-2.5 text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all border border-transparent hover:border-emerald-500/20"
                        title="Approve"
                      >
                        <Check size={20} className="stroke-[3]" />
                      </button>
                      <button 
                        disabled={processingId === req._id}
                        onClick={() => updateStatus(req._id, "Rejected")}
                        className="p-2.5 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20"
                        title="Reject"
                      >
                        <X size={20} className="stroke-[3]" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end pr-4">
                      <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                        <AlertCircle size={16} className="text-slate-600" />
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLeaveApproval;