import api from "@/api/axios";
import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Download,
  User,
  ArrowRightLeft,
  Timer,
  Calendar,
  Mail,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface AdminAttendanceRecord {
  _id: string;
  employeeId: { email: string; name?: string; role?: string };
  date: string;
  checkIn: string;
  checkOut?: string;
  workHours: number;
}

const PAGE_SIZE = 10;

// CSV export helper
const downloadCSV = (rows: Record<string, any>[], filename: string) => {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers
        .map((h) => {
          const v = String(r[h] ?? "").replace(/"/g, '""');
          return v.includes(",") || v.includes('"') ? `"${v}"` : v;
        })
        .join(","),
    ),
  ].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
};

const AdminAttendanceView = () => {
  const [allLogs, setAllLogs] = useState<AdminAttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchAllLogs = async () => {
      try {
        const res = await api.get("/attendance/all");
        setAllLogs(res.data);
      } catch (err) {
        console.error("Failed to fetch logs", err);
      }
    };
    fetchAllLogs();
  }, []);

  // Filter by search term 
  const filteredLogs = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return allLogs.filter(
      (log) =>
        log.employeeId.name?.toLowerCase().includes(q) ||
        log.employeeId.email.toLowerCase().includes(q),
    );
  }, [allLogs, searchTerm]);

  // Reset to page 1 whenever search changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  // Pagination math 
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const currentRows = useMemo(
    () => filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredLogs, page],
  );

  const handleExport = () => {
    downloadCSV(
      filteredLogs.map((log) => ({
        Employee: log.employeeId.name ?? "Unknown",
        Email: log.employeeId.email,
        Date: new Date(log.date).toLocaleDateString(),
        CheckIn: new Date(log.checkIn).toLocaleTimeString(),
        CheckOut: log.checkOut
          ? new Date(log.checkOut).toLocaleTimeString()
          : "Active",
        WorkHours: log.workHours.toFixed(2),
        Status: log.checkOut ? "Finished" : "Active",
      })),
      "attendance_report",
    );
  };

  // Shared pagination strip
  const PaginationStrip = () => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setPage((p) => Math.max(1, p - 1))}
        disabled={page === 1}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black text-slate-400
          border border-white/10 hover:border-white/20 hover:text-white
          disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft size={14} /> Prev
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
          .reduce<(number | "…")[]>((acc, p, i, arr) => {
            if (i > 0 && (p as number) - (arr[i - 1] as number) > 1)
              acc.push("…");
            acc.push(p);
            return acc;
          }, [])
          .map((p, i) =>
            p === "…" ? (
              <span
                key={`e-${i}`}
                className="px-2 text-slate-600 text-xs font-bold"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => setPage(p as number)}
                className={`h-8 w-8 rounded-lg text-[11px] font-black transition-all
                  ${
                    page === p
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                      : "text-slate-400 hover:text-white border border-white/10 hover:border-white/20"
                  }`}
              >
                {p}
              </button>
            ),
          )}
      </div>

      <button
        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
        disabled={page === totalPages}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black text-slate-400
          border border-white/10 hover:border-white/20 hover:text-white
          disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Next <ChevronRight size={14} />
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* ── Action Bar ── */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl">
        <div className="relative w-full md:w-[500px]">
          <Search
            className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-slate-500 font-medium"
          />
        </div>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 w-full md:w-auto"
        >
          <Download size={18} /> Export Data
        </button>
      </div>

      {/* ── Data Table ── */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
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
                <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] text-right">
                  Activity Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {currentRows.length > 0 ? (
                currentRows.map((log) => (
                  <tr
                    key={log._id}
                    className="group hover:bg-white/[0.02] transition-colors duration-200"
                  >
                    {/* Employee */}
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-sm font-bold shadow-inner shrink-0">
                          {log.employeeId.name?.charAt(0) ?? "U"}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                            {log.employeeId.name ?? "Unknown User"}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                            <Mail size={10} className="text-blue-500" />{" "}
                            {log.employeeId.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Timeline */}
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                        <span className="inline-flex w-fit px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-[9px] font-black uppercase tracking-widest border border-white/5">
                          {new Date(log.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                          <span className="text-blue-400">
                            {new Date(log.checkIn).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <ArrowRightLeft
                            size={10}
                            className="text-slate-600"
                          />
                          <span className="text-blue-400">
                            {log.checkOut
                              ? new Date(log.checkOut).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "---"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="px-8 py-6">
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit border
                      ${
                        log.workHours >= 8
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${log.workHours >= 8 ? "bg-emerald-500" : "bg-amber-500"}`}
                        />
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          {log.workHours.toFixed(1)}h Logged
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-8 py-6 text-right">
                      {!log.checkOut ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 animate-pulse">
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-white/5">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                          Finished
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-8 py-16 text-center text-slate-600 text-sm font-bold uppercase tracking-widest"
                  >
                    {searchTerm
                      ? `No results for "${searchTerm}"`
                      : "No attendance records found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination footer ── */}
        <div className="flex items-center justify-between px-8 py-5 border-t border-white/[0.06] bg-white/[0.01]">
          {/* Summary */}
          <span className="text-[11px] text-slate-500 font-bold">
            Showing{" "}
            <span className="text-white font-black">
              {filteredLogs.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filteredLogs.length)}
            </span>{" "}
            of{" "}
            <span className="text-white font-black">{filteredLogs.length}</span>
            {searchTerm && filteredLogs.length !== allLogs.length && (
              <span className="text-slate-600">
                {" "}
                (filtered from {allLogs.length})
              </span>
            )}
          </span>

          <PaginationStrip />
        </div>
      </div>
    </div>
  );
};

export default AdminAttendanceView;
