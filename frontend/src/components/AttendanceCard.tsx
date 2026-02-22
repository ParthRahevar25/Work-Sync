import { useState } from "react";
import api from "@/api/axios";
import { Play, Pause, Square, Loader2, Clock, Timer } from "lucide-react";
import { useAttendance } from "@/context/AttendanceContext";
interface AttendanceCardProps {
  onActionSuccess: () => void;
}
const AttendanceCard = ({ onActionSuccess }: AttendanceCardProps) => {
  const { status, seconds, startTimer, pauseTimer, stopTimer } =
    useAttendance();
  const [loading, setLoading] = useState(false);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleStartShift = async () => {
    setLoading(true);
    try {
      await api.post("/attendance/mark", { type: "checkin" });
      startTimer();
      onActionSuccess();
    } catch (error: any) {
      alert(error.response?.data?.error || "Start failed");
    } finally {
      setLoading(false);
    }
  };

  const handleEndShift = async () => {
    if (!window.confirm("End shift for today?")) return;
    setLoading(true);
    try {
      await api.post("/attendance/mark", { type: "checkout" });
      stopTimer();
      onActionSuccess();
    } catch (error: any) {
      alert("Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-800 text-white h-full flex flex-col justify-between">
      <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/40">
            <Timer className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight uppercase">
              Live <span className="text-blue-500">Session</span>
            </h2>
            <p className="text-slate-500 text-[10px] font-black tracking-[0.2em] uppercase mt-1 opacity-80">
              Real-time Tracker
            </p>
          </div>
        </div>

        {/* Status Indicator Glow */}
        <div className="relative flex items-center justify-center">
          <div
            className={`absolute h-4 w-4 rounded-full animate-ping opacity-20 ${status === "working" ? "bg-emerald-500" : "bg-amber-500"}`}
          ></div>
          <div
            className={`h-2.5 w-2.5 rounded-full border-2 border-[#0F172A] z-10 ${status === "working" ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)]"}`}
          ></div>
        </div>
      </div>

      {/* 2. Timer Display */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-center py-10 bg-slate-900/50 rounded-[2rem] border border-slate-800 shadow-inner mb-10 group hover:border-blue-500/30 transition-all">
          <div className="text-6xl font-mono font-black tracking-tighter text-white group-hover:text-blue-400 transition-colors">
            {formatTime(seconds)}
          </div>
          <div className="flex items-center justify-center gap-2 mt-3">
            <Clock size={12} className="text-blue-500" />
            <p className="text-[11px] text-slate-500 uppercase font-black tracking-widest">
              Elapsed Work Hours
            </p>
          </div>
        </div>

        {/* 3. Action Buttons */}
        <div className="grid gap-4">
          {status === "idle" ? (
            <button
              onClick={handleStartShift}
              disabled={loading}
              className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-900/40 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Play size={22} fill="currentColor" />
              )}{" "}
              Check In
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() =>
                  status === "working" ? pauseTimer() : startTimer()
                }
                className={`py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all border ${
                  status === "working"
                    ? "bg-slate-800 border-slate-700 hover:border-slate-500 text-slate-300"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-white"
                }`}
              >
                {status === "working" ? (
                  <>
                    <Pause size={18} /> Break
                  </>
                ) : (
                  <>
                    <Play size={18} /> Resume
                  </>
                )}
              </button>

              <button
                onClick={handleEndShift}
                disabled={loading}
                className="py-4 bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all border border-rose-500/20 shadow-lg shadow-rose-900/10"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Square size={16} fill="currentColor" />
                )}{" "}
                Finish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceCard;
