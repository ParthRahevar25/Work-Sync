import { useEffect, useState, useMemo } from "react";
import api from "@/api/axios";
import { Search, ShieldCheck, Power } from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const [uRes] = await Promise.all([
        api.get("/users"),
      ]);
      setUsers(uRes.data);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/users/toggle/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [users, searchTerm]);

  return (
    <div className="relative z-10 p-6 lg:p-10 min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-12">
        {/* 1. Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              System <span className="text-blue-500">Access</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1 flex items-center gap-2">
              <ShieldCheck size={16} className="text-blue-500" />
              Manage credentials and system permissions
            </p>
          </div>
        </div>

        {/* 2. Search Action Bar */}
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl">
          <div className="relative w-full md:w-[450px]">
            <Search
              className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by email or role..."
              className="w-full pl-16 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder:text-slate-500 font-medium"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 3. User Table */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.03] border-b border-white/10">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                    Account Info
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                    Linked Profile
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                    System Role
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                    Status
                  </th>
                  <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="group hover:bg-white/[0.02] transition-colors duration-200"
                  >
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                          {user.email}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                          UID: {user._id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-slate-300">
                        {user.employeeId?.name || "Unlinked"}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-[10px] font-black border border-blue-500/20 uppercase tracking-wider">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full w-fit border ${
                          user.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${user.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button
                        onClick={() => handleToggleStatus(user._id)}
                        className={`p-3 rounded-xl transition-all ${user.isActive ? "text-rose-400 hover:bg-rose-500/10" : "text-emerald-400 hover:bg-emerald-500/10"}`}
                      >
                        <Power size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
