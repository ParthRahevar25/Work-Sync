import { useEffect, useState, useMemo, type JSX } from "react";
import api from "@/api/axios";
import {
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface MyLeaveHistoryProps {
  refresh: number;
}

const PAGE_SIZE = 5;

const MyLeaveHistory = ({ refresh }: MyLeaveHistoryProps) => {
  const [history, setHistory] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchMyHistory = async () => {
      try {
        const res = await api.get("/leaves/my");
        setHistory(res.data);
        setPage(1); // reset to first page on every refresh
      } catch (err) {
        console.error("Failed to fetch personal leave history");
      }
    };
    fetchMyHistory();
  }, [refresh]);

  // Case-insensitive status config 
  const getStatusConfig = (
    status: string,
  ): { bg: string; dot: string; icon: JSX.Element } => {
    switch (status?.toLowerCase()) {
      case "approved":
        return {
          bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
          dot: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
          icon: <CheckCircle2 size={12} />,
        };
      case "rejected":
        return {
          bg: "bg-rose-500/10 border-rose-500/20 text-rose-400",
          dot: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
          icon: <XCircle size={12} />,
        };
      default:
        return {
          bg: "bg-amber-500/10 border-amber-500/20 text-amber-400",
          dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]",
          icon: <Clock size={12} />,
        };
    }
  };

  // Pagination math
  const totalPages = Math.max(1, Math.ceil(history.length / PAGE_SIZE));
  const currentRows = useMemo(
    () => history.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [history, page],
  );

  return (
    <div className="bg-[#0F172A] rounded-[2.5rem] border border-slate-800 shadow-2xl shadow-blue-900/20 flex flex-col h-full overflow-hidden transition-all duration-500">
      {/* Header */}
      <div className="p-8 border-b border-slate-800 bg-slate-900/40 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-blue-500 bg-blue-500/10 p-2 rounded-xl">
            <Activity size={24} />
          </span>
          <h3 className="font-black text-white text-lg uppercase tracking-[0.1em]">
            History Log
          </h3>
        </div>
        <span className="text-xs font-black bg-blue-600 px-4 py-1.5 rounded-full text-white uppercase tracking-wider shadow-lg">
          {history.length}
        </span>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {history.length > 0 ? (
          <div className="relative space-y-5">
            {/* Timeline line */}
            {currentRows.length > 1 && (
              <div className="absolute left-[17px] top-4 bottom-4 w-[2px] bg-slate-800 hidden sm:block" />
            )}

            {currentRows.map((item) => {
              const config = getStatusConfig(item.status);
              return (
                <div
                  key={item._id}
                  className="group relative pl-10 transition-all duration-300"
                >
                  {/* Status dot */}
                  <div
                    className={`absolute left-0 top-2 h-4 w-4 rounded-full border-[3px] border-[#0F172A] z-10 ${config.dot}`}
                  />

                  <div className="p-5 bg-slate-900/40 border border-slate-800/50 hover:border-blue-500/50 hover:bg-slate-800/60 rounded-3xl transition-all">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-sm font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                          {item.type} Leave
                        </span>
                        <div className="flex items-center gap-2 mt-1.5 text-slate-400 font-bold text-xs">
                          <CalendarDays size={13} className="text-blue-500" />
                          <span>
                            {new Date(item.startDate).toLocaleDateString()} –{" "}
                            {new Date(item.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest ${config.bg}`}
                      >
                        {config.icon}
                        {item.status}
                      </div>
                    </div>

                    {item.reason && (
                      <div className="bg-black/20 p-3 rounded-2xl border border-slate-800/40">
                        <p className="text-xs text-slate-400 leading-relaxed italic font-medium">
                          "{item.reason}"
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
            <Activity size={48} className="text-slate-700 mb-4" />
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
              No Records Found
            </p>
          </div>
        )}
      </div>

      {/* Pagination footer — only shown when there's more than one page */}
      {totalPages > 1 && (
        <div className="shrink-0 border-t border-slate-800 bg-slate-900/30 px-6 py-4 flex items-center justify-between">
          {/* Page info */}
          <span className="text-[11px] text-slate-500 font-bold">
            <span className="text-white font-black">
              {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, history.length)}
            </span>{" "}
            of <span className="text-white font-black">{history.length}</span>
          </span>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-black text-slate-400
                border border-slate-800 hover:border-slate-600 hover:text-white
                disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={13} /> Prev
            </button>

            {/* Page number pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                )
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
                      className="px-1.5 text-slate-600 text-xs"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`h-7 w-7 rounded-lg text-[11px] font-black transition-all
                        ${
                          page === p
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                            : "text-slate-400 hover:text-white border border-slate-800 hover:border-slate-600"
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
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-black text-slate-400
                border border-slate-800 hover:border-slate-600 hover:text-white
                disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLeaveHistory;
