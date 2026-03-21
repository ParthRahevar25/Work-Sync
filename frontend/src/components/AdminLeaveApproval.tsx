import api from "@/api/axios";
import { useEffect, useState, useMemo } from "react";
import {
  Check, X, Mail, Calendar, User, Info,
  AlertCircle, ArrowRightLeft, ChevronLeft, ChevronRight,
} from "lucide-react";

interface LeaveRequest {
  _id: string;
  employeeId: { name: string; email: string };
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
}

const PAGE_SIZE = 10;

const AdminLeaveApproval = () => {
  const [requests,     setRequests]     = useState<LeaveRequest[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [page,         setPage]         = useState(1);

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "rejected": return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:         return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
  };

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        const res = await api.get("/leaves/all");

        // FIX: proper two-argument sort comparator, case-insensitive status check
        const sorted = [...res.data].sort((a: LeaveRequest, b: LeaveRequest) => {
          const aP = a.status?.toLowerCase() === "pending";
          const bP = b.status?.toLowerCase() === "pending";
          if (aP && !bP) return -1;
          if (!aP && bP) return  1;
          // Within same status group: newest start date first
          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
        });

        setRequests(sorted);
        setPage(1); // reset to first page on fresh fetch
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
      setRequests(prev =>
        prev.map(req => req._id === id ? { ...req, status: newStatus } : req)
      );
    } catch {
      alert("Action failed");
    } finally {
      setProcessingId(null);
    }
  };

  // ── Pagination math ──────────────────────────
  const totalPages  = Math.max(1, Math.ceil(requests.length / PAGE_SIZE));
  const currentRows = useMemo(
    () => requests.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [requests, page]
  );

  const pendingCount = requests.filter(r => r.status?.toLowerCase() === "pending").length;

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-white/[0.03] border-b border-white/10">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2"><User size={14}/> Employee Details</div>
              </th>
              <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2"><Calendar size={14}/> Schedule</div>
              </th>
              <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-2"><Info size={14}/> Justification</div>
              </th>
              <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Status</th>
              <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] text-right">Decision</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {currentRows.length > 0 ? currentRows.map(req => (
              <tr key={req._id} className="group hover:bg-white/[0.02] transition-colors duration-200">

                {/* Employee */}
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-sm font-bold shadow-inner shrink-0">
                      {req.employeeId?.name?.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                        {req.employeeId?.name}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                        <Mail size={10} className="text-blue-500"/> {req.employeeId?.email}
                      </span>
                    </div>
                  </div>
                </td>

                {/* Schedule */}
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="inline-flex w-fit px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[9px] font-black uppercase tracking-widest border border-blue-500/20">
                      {req.type}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                      <span className="text-blue-400">{new Date(req.startDate).toLocaleDateString()}</span>
                      <ArrowRightLeft size={10} className="text-slate-600"/>
                      <span className="text-blue-400">{new Date(req.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </td>

                {/* Reason */}
                <td className="px-8 py-6">
                  <p className="text-[13px] text-slate-400 font-medium leading-relaxed line-clamp-2 italic border-l-2 border-white/10 pl-3 max-w-xs">
                    "{req.reason}"
                  </p>
                </td>

                {/* Status badge */}
                <td className="px-8 py-6">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black border uppercase tracking-widest ${getStatusStyle(req.status)}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      req.status?.toLowerCase() === "approved" ? "bg-emerald-500" :
                      req.status?.toLowerCase() === "rejected" ? "bg-rose-500" :
                      "bg-amber-500 animate-pulse"
                    }`}/>
                    {req.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-8 py-6 text-right">
                  {req.status?.toLowerCase() === "pending" ? (
                    <div className="flex justify-end items-center gap-2">
                      <button
                        disabled={processingId === req._id}
                        onClick={() => updateStatus(req._id, "Approved")}
                        className="p-2.5 text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all border border-transparent hover:border-emerald-500/20 disabled:opacity-40"
                        title="Approve"
                      >
                        <Check size={20} className="stroke-[3]"/>
                      </button>
                      <button
                        disabled={processingId === req._id}
                        onClick={() => updateStatus(req._id, "Rejected")}
                        className="p-2.5 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all border border-transparent hover:border-rose-500/20 disabled:opacity-40"
                        title="Reject"
                      >
                        <X size={20} className="stroke-[3]"/>
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end pr-4">
                      <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                        <AlertCircle size={16} className="text-slate-600"/>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={5} className="px-8 py-16 text-center text-slate-600 text-sm font-bold uppercase tracking-widest">
                  No leave requests found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination footer ── */}
      <div className="flex items-center justify-between px-8 py-5 border-t border-white/[0.06] bg-white/[0.01]">

        {/* Summary */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 font-bold">
            Showing{" "}
            <span className="text-white font-black">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, requests.length)}</span>
            {" "}of{" "}
            <span className="text-white font-black">{requests.length}</span>
            {" "}requests
          </span>
          {pendingCount > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black uppercase tracking-widest">
              {pendingCount} pending
            </span>
          )}
        </div>

        {/* Page controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black text-slate-400
              border border-white/10 hover:border-white/20 hover:text-white
              disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={14}/> Prev
          </button>

          {/* Page number pills */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .reduce<(number | "…")[]>((acc, p, i, arr) => {
                if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("…");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-slate-600 text-xs font-bold">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    className={`h-8 w-8 rounded-lg text-[11px] font-black transition-all
                      ${page === p
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                        : "text-slate-400 hover:text-white border border-white/10 hover:border-white/20"
                      }`}
                  >
                    {p}
                  </button>
                )
              )}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black text-slate-400
              border border-white/10 hover:border-white/20 hover:text-white
              disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Next <ChevronRight size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLeaveApproval;