import { useState, useRef, useEffect } from "react";
import api from "@/api/axios";
import { Send, Bot, User, Loader2, Sparkles, Calendar } from "lucide-react";

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

export default function WorkSyncAI() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/ai/chat", { message: currentInput });

      const aiMessage = {
        role: "ai",
        content: res.data.message,
        // Capture the breakdown and history arrays from backend
        balanceData: res.data.balanceBreakdown || null,
        leaves: res.data.leaves || null,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "I'm having trouble connecting to the sync brain. Try again?",
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
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <Sparkles className="text-purple-500 mb-4" size={40} />
            <p className="text-slate-400 font-medium">
              Ask me about your leave balance or work logs.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
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

                {/* UI FOR LEAVE BALANCE DATA */}
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
                      <BalanceItem
                        label="Casual"
                        value={msg.balanceData.casual}
                        color="blue"
                      />
                      <BalanceItem
                        label="Sick"
                        value={msg.balanceData.sick}
                        color="emerald"
                      />
                      <BalanceItem
                        label="Paid"
                        value={msg.balanceData.paid}
                        color="amber"
                      />
                    </div>
                  </div>
                )}

                {/* UI FOR LEAVE APPLICATION HISTORY */}
                {msg.leaves && msg.leaves.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                      Recent Applications
                    </p>
                    {msg.leaves.slice(0, 3).map((leave: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center group hover:border-white/20 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Calendar size={14} className="text-slate-500" />
                          <span className="text-[11px] text-slate-300 font-bold">
                            {new Date(leave.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                            leave.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {leave.status}
                        </span>
                      </div>
                    ))}
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
              <div className="h-2 w-12 bg-white/10 rounded-full"></div>
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
          placeholder="Type your request (e.g., 'What is my leave balance?')"
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
