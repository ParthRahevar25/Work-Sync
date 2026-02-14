import api from "@/api/axios";
import { useEffect, useState } from "react";
import { Check, X, Mail, Calendar, User, ClipboardList, AlertCircle, Info, ArrowRightLeft } from "lucide-react";

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
        return "bg-emerald-50 text-emerald-700 border-emerald-100 ring-emerald-600/10";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-100 ring-rose-600/10";
      default:
        return "bg-amber-50 text-amber-700 border-amber-100 ring-amber-600/10";
    }
  };

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await api.get("/leaves/all");
        // Sort to show Pending at the top
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
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden transition-all duration-300">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* Header*/}
          <thead className="bg-[#0F172A] border-b border-slate-800">
            <tr>
              <th className="px-8 py-6 text-xs font-black text-blue-100/80 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-blue-400" /> Employee Details
                </div>
              </th>
              <th className="px-8 py-6 text-xs font-black text-blue-100/80 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-400" /> Schedule
                </div>
              </th>
              <th className="px-8 py-6 text-xs font-black text-blue-100/80 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2">
                  <Info size={14} className="text-blue-400" /> Justification
                </div>
              </th>
              <th className="px-8 py-6 text-xs font-black text-blue-100/80 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-6 text-xs font-black text-blue-100/80 uppercase tracking-[0.2em] text-right">Decision</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {requests.map((req) => (
              <tr key={req._id} className="group hover:bg-blue-50/40 transition-colors duration-200">
                {/* 1. Employee Info */}
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-800 to-blue-900 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-900/20 ring-2 ring-white">
                      {req.employeeId?.name?.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-slate-900 leading-none mb-1 group-hover:text-blue-700 transition-colors">
                        {req.employeeId?.name}
                      </span>
                      <span className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                        <Mail size={12} className="text-blue-400" /> {req.employeeId?.email}
                      </span>
                    </div>
                  </div>
                </td>

                {/* 2. Schedule */}
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-2">
                    <span className="inline-flex w-fit px-2.5 py-1 rounded-lg bg-blue-900 text-blue-50 text-[10px] font-black uppercase tracking-wider shadow-sm">
                      {req.type}
                    </span>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <span className="text-blue-600">{new Date(req.startDate).toLocaleDateString()}</span>
                      <ArrowRightLeft size={12} className="text-slate-300" />
                      <span className="text-blue-600">{new Date(req.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </td>

                {/* 3. Reason */}
                <td className="px-8 py-6">
                  <div className="max-w-xs relative group">
                    <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-2 italic border-l-2 border-blue-100 pl-3">
                      "{req.reason}"
                    </p>
                  </div>
                </td>

                {/* 4. Status */}
                <td className="px-8 py-6">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black border uppercase tracking-wider ring-1 ring-inset ${getStatusStyle(req.status)}`}>
                    <span className={`h-2 w-2 rounded-full ${req.status === 'Approved' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : req.status === 'Rejected' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'}`} />
                    {req.status}
                  </span>
                </td>

                {/* 5. Actions */}
                <td className="px-8 py-6 text-right">
                  {req.status === "Pending" ? (
                    <div className="flex justify-end items-center gap-3">
                      <button 
                        disabled={processingId === req._id}
                        onClick={() => updateStatus(req._id, "Approved")}
                        className="p-3 text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-sm border border-transparent hover:border-emerald-100"
                        title="Approve Request"
                      >
                        <Check size={22} className="stroke-[3]" />
                      </button>
                      <button 
                        disabled={processingId === req._id}
                        onClick={() => updateStatus(req._id, "Rejected")}
                        className="p-3 text-rose-600 hover:bg-rose-50 rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-sm border border-transparent hover:border-rose-100"
                        title="Reject Request"
                      >
                        <X size={22} className="stroke-[3]" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end pr-4">
                      <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                        <AlertCircle size={18} className="text-slate-300" />
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