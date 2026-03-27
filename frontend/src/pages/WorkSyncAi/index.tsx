import { useState, useRef, useEffect } from "react";
import api from "@/api/axios";
import {
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  BarChart2,
  MapPin,
  Briefcase,
} from "lucide-react";

// ─── Small reusable components ───────────────────────────────────────────────

const BalanceItem = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "blue" | "emerald" | "amber";
}) => {
  const colors = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
  };
  return (
    <div className={`text-center p-2 rounded-xl border ${colors[color]}`}>
      <p className="text-[8px] font-black uppercase tracking-tighter opacity-70 mb-1">
        {label}
      </p>
      <p className="text-lg font-black">{value}</p>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const s = status?.toLowerCase();
  const styles =
    s === "approved"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : s === "rejected"
      ? "bg-red-500/10 text-red-400 border-red-500/20"
      : "bg-amber-500/10 text-amber-400 border-amber-500/20";
  return (
    <span
      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${styles}`}
    >
      {status}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WorkSyncAI() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      // Send last 5 messages as conversation history for memory
      const history = updatedMessages.slice(-5).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.post("/ai/chat", {
        message: currentInput,
        history,
      });

      const aiMessage = {
        role: "ai",
        content: res.data.message,
        action: res.data.action,
        // Map every possible response payload
        balanceData: res.data.balanceBreakdown || null,
        leaves: res.data.leaves || null,
        leavesOnDate: res.data.leavesOnDate || null,
        queryDate: res.data.queryDate || null,
        deptSummary: res.data.deptSummary || null,
        pendingLeaves: res.data.pendingLeaves || null,
        absentees: res.data.absentees || null,
        attendanceSummary: res.data.attendanceSummary || null,
        profile: res.data.profile || null,
        employeeProfile: res.data.employeeProfile || null,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "I'm having trouble connecting to the sync brain. Try again?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto p-6 relative z-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="p-2 bg-purple-600 rounded-xl text-white shadow-lg shadow-purple-900/20">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Work Sync <span className="text-purple-500">AI</span>
          </h2>
          <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
            HR Intelligence Assistant
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-6 mb-6 pr-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50 gap-3">
            <Sparkles className="text-purple-500" size={40} />
            <p className="text-slate-400 font-medium">
              Ask me anything about leaves, attendance, or your team.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {[
                "What is my leave balance?",
                "Who is on leave today?",
                "Show pending approvals",
                "Who hasn't checked in today?",
              ].map((hint) => (
                <button
                  key={hint}
                  onClick={() => setInput(hint)}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:border-purple-500/50 hover:text-purple-400 transition-all"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[90%] flex gap-3 ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-purple-600 text-white shadow-lg shadow-purple-900/20"
                }`}
              >
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>

              <div
                className={`p-4 rounded-2xl border transition-all duration-300 ${
                  msg.role === "user"
                    ? "bg-blue-600/10 border-blue-500/20 text-blue-50"
                    : "bg-slate-900/50 border-white/10 text-slate-200 backdrop-blur-md"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.content}</p>

                {/* ── LEAVE BALANCE ── */}
                {msg.balanceData && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Balance Breakdown
                      </span>
                      <span className="text-[10px] font-black text-purple-400 uppercase">
                        Total: {msg.balanceData.total} Days
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <BalanceItem label="Casual" value={msg.balanceData.casual} color="blue" />
                      <BalanceItem label="Sick" value={msg.balanceData.sick} color="emerald" />
                      <BalanceItem label="Paid" value={msg.balanceData.paid} color="amber" />
                    </div>
                  </div>
                )}

                {/* ── MY LEAVE HISTORY ── */}
                {msg.leaves && msg.leaves.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                      Leave Applications
                    </p>
                    {msg.leaves.slice(0, 5).map((leave: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar size={13} className="text-slate-500 shrink-0" />
                          <div>
                            <p className="text-[11px] text-slate-300 font-bold">
                              {new Date(leave.startDate).toLocaleDateString()} –{" "}
                              {new Date(leave.endDate).toLocaleDateString()}
                            </p>
                            <p className="text-[10px] text-slate-500 capitalize">
                              {leave.type}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={leave.status} />
                      </div>
                    ))}
                  </div>
                )}

                {/* ── LEAVES ON DATE (admin) ── */}
                {msg.leavesOnDate && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        On Leave — {msg.queryDate}
                      </p>
                      <span className="text-[10px] font-black text-purple-400">
                        {msg.leavesOnDate.length} employee(s)
                      </span>
                    </div>
                    {msg.leavesOnDate.length === 0 ? (
                      <p className="text-xs text-slate-500 px-1">
                        No one is on leave on this date.
                      </p>
                    ) : (
                      msg.leavesOnDate.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[12px] text-white font-bold">
                                {item.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Briefcase size={10} className="text-slate-500" />
                                <p className="text-[10px] text-slate-400">
                                  {item.department} · {item.designation}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 capitalize">
                                {item.type}
                              </span>
                              <p className="text-[10px] text-slate-500 mt-1">
                                {new Date(item.startDate).toLocaleDateString()} –{" "}
                                {new Date(item.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ── DEPARTMENT LEAVE SUMMARY ── */}
                {msg.deptSummary && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    <div className="flex items-center gap-2 px-1 mb-3">
                      <BarChart2 size={12} className="text-purple-400" />
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        By Department — {msg.deptSummary.month || ""}
                      </p>
                    </div>
                    {msg.deptSummary.map
                      ? msg.deptSummary.map((item: any, idx: number) => {
                          const max = msg.deptSummary[0]?.count || 1;
                          const pct = Math.round((item.count / max) * 100);
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-300 font-medium">
                                  {item.department}
                                </span>
                                <span className="text-slate-500">
                                  {item.count} leave(s)
                                </span>
                              </div>
                              <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-purple-500"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      : null}
                  </div>
                )}

                {/* ── PENDING APPROVALS ── */}
                {msg.pendingLeaves && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Pending Approvals
                      </p>
                      <span className="text-[10px] font-black text-amber-400">
                        {msg.pendingLeaves.length} pending
                      </span>
                    </div>
                    {msg.pendingLeaves.length === 0 ? (
                      <p className="text-xs text-slate-500 px-1">
                        No pending approvals.
                      </p>
                    ) : (
                      msg.pendingLeaves.map((leave: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/20 transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-[12px] text-white font-bold">
                                {leave.name}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {leave.department} · {leave.reason}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 capitalize">
                                {leave.type}
                              </span>
                              <p className="text-[10px] text-slate-500 mt-1">
                                {new Date(leave.startDate).toLocaleDateString()} –{" "}
                                {new Date(leave.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() =>
                                setInput(`Approve ${leave.name}'s leave`)
                              }
                              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
                            >
                              <CheckCircle size={10} /> Approve
                            </button>
                            <button
                              onClick={() =>
                                setInput(`Reject ${leave.name}'s leave`)
                              }
                              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all"
                            >
                              <XCircle size={10} /> Reject
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ── TODAY'S ABSENTEES ── */}
                {msg.absentees && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Users size={12} className="text-red-400" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Not Checked In Today
                        </p>
                      </div>
                      <span className="text-[10px] font-black text-red-400">
                        {msg.absentees.length} absent
                      </span>
                    </div>
                    {msg.absentees.length === 0 ? (
                      <p className="text-xs text-emerald-400 px-1">
                        ✓ All employees have checked in today!
                      </p>
                    ) : (
                      msg.absentees.map((emp: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center hover:border-white/20 transition-all"
                        >
                          <div>
                            <p className="text-[12px] text-white font-bold">
                              {emp.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {emp.department} · {emp.designation}
                            </p>
                          </div>
                          <Clock size={14} className="text-red-400 shrink-0" />
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* ── ATTENDANCE SUMMARY (my own) ── */}
                {msg.attendanceSummary && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                      Attendance — {msg.attendanceSummary.month}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-center">
                        <p className="text-lg font-black text-emerald-400">
                          {msg.attendanceSummary.present}
                        </p>
                        <p className="text-[9px] uppercase text-emerald-600 font-black tracking-widest">
                          Days Present
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-center">
                        <p className="text-lg font-black text-amber-400">
                          {msg.attendanceSummary.late}
                        </p>
                        <p className="text-[9px] uppercase text-amber-600 font-black tracking-widest">
                          Late Arrivals
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 text-center">
                        <p className="text-lg font-black text-blue-400">
                          {msg.attendanceSummary.totalHours}h
                        </p>
                        <p className="text-[9px] uppercase text-blue-600 font-black tracking-widest">
                          Total Hours
                        </p>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/20 text-center">
                        <p className="text-lg font-black text-purple-400">
                          {msg.attendanceSummary.avgHoursPerDay}h
                        </p>
                        <p className="text-[9px] uppercase text-purple-600 font-black tracking-widest">
                          Avg / Day
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── MY PROFILE ── */}
                {msg.profile && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                      My Profile
                    </p>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                      {[
                        { icon: <Briefcase size={11} />, label: "Designation", value: msg.profile.designation },
                        { icon: <Users size={11} />, label: "Department", value: msg.profile.department },
                        { icon: <MapPin size={11} />, label: "Location", value: msg.profile.workLocation },
                        { icon: <Calendar size={11} />, label: "Joined", value: msg.profile.joiningDate },
                        { icon: <User size={11} />, label: "Manager", value: msg.profile.manager },
                      ].map(({ icon, label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-500">
                            {icon}
                            <span className="text-[10px] uppercase tracking-widest font-black">
                              {label}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-300 font-medium">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── SEARCHED EMPLOYEE PROFILE (admin) ── */}
                {msg.employeeProfile && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                      Employee Profile
                    </p>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                      {[
                        { label: "Code", value: msg.employeeProfile.employeeCode },
                        { label: "Designation", value: msg.employeeProfile.designation },
                        { label: "Department", value: msg.employeeProfile.department },
                        { label: "Location", value: msg.employeeProfile.workLocation },
                        { label: "Status", value: msg.employeeProfile.status },
                        { label: "Joined", value: msg.employeeProfile.joiningDate },
                        { label: "Manager", value: msg.employeeProfile.manager },
                        { label: "Role", value: msg.employeeProfile.role },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-widest font-black text-slate-500">
                            {label}
                          </span>
                          <span className="text-[11px] text-slate-300 font-medium capitalize">
                            {value}
                          </span>
                        </div>
                      ))}
                      {msg.employeeProfile.leaveBalance && (
                        <div className="pt-2 mt-1 border-t border-white/5 grid grid-cols-3 gap-2">
                          <BalanceItem label="Casual" value={msg.employeeProfile.leaveBalance.casual} color="blue" />
                          <BalanceItem label="Sick" value={msg.employeeProfile.leaveBalance.sick} color="emerald" />
                          <BalanceItem label="Paid" value={msg.employeeProfile.leaveBalance.paid} color="amber" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-lg">
              <Loader2 size={16} className="animate-spin" />
            </div>
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl animate-pulse">
              <div className="h-2 w-24 bg-white/10 rounded-full" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input bar */}
      <form onSubmit={sendMessage} className="relative group">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything — leaves, attendance, team status..."
          className="w-full p-5 pl-6 pr-16 bg-white/5 border border-white/10 rounded-[2rem] text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all backdrop-blur-xl"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-full transition-all shadow-lg active:scale-95"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}