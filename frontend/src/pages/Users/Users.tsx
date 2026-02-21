import { useEffect, useState, useMemo } from "react";
import api from "../../api/axios";
import { 
  UserPlus, X, Loader2, Search, 
  ShieldCheck, Power,
} from "lucide-react";

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]); 
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    email: "", password: "", role: "employee", employeeId: "" 
  });
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async () => {
    try {
      const [uRes, eRes] = await Promise.all([
        api.get("/users"),
        api.get("/employee")
      ]);
      setUsers(uRes.data);
      setEmployees(eRes.data);
    } catch (err) {
      console.error("Fetch failed", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/users", formData);
      setShowModal(false);
      setFormData({ email: "", password: "", role: "employee", employeeId: "" });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || "Creation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await api.patch(`/users/toggle/${id}`);
      fetchData();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
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
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 w-full md:w-auto"
          >
            <UserPlus size={18} /> Add New User
          </button>
        </div>

        {/* 2. Search Action Bar */}
        <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/10 shadow-2xl">
          <div className="relative w-full md:w-[450px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500" size={20} />
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
                  <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Account Info</th>
                  <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Linked Profile</th>
                  <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">System Role</th>
                  <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-6 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="group hover:bg-white/[0.02] transition-colors duration-200">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{user.email}</span>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">UID: {user._id.slice(-6).toUpperCase()}</span>
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
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full w-fit border ${
                        user.isActive 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{user.isActive ? "Active" : "Inactive"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => handleToggleStatus(user._id)}
                        className={`p-3 rounded-xl transition-all ${user.isActive ? 'text-rose-400 hover:bg-rose-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
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

      {/* MODAL: Create User */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md">
          <div className="bg-[#0b1120] border border-white/10 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white"><UserPlus size={20} /></div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Create Login</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>

            <form onSubmit={handleCreateUser} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-500 uppercase ml-2">Email Address</label>
                <input required type="email" className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 transition-all font-bold"
                  onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-500 uppercase ml-2">Role</label>
                  <select className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 transition-all font-bold appearance-none"
                    onChange={e => setFormData({...formData, role: e.target.value as any})}>
                    <option value="employee" className="bg-[#0b1120]">Employee</option>
                    <option value="manager" className="bg-[#0b1120]">Manager</option>
                    <option value="admin" className="bg-[#0b1120]">Admin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-500 uppercase ml-2">Link Employee</label>
                  <select required className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 transition-all font-bold appearance-none"
                    onChange={e => setFormData({...formData, employeeId: e.target.value})}>
                    <option value="" className="bg-[#0b1120]">Select...</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id} className="bg-[#0b1120]">{emp.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-500 uppercase ml-2">Initial Password</label>
                <input required type="password" placeholder="••••••••" className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 transition-all font-bold"
                  onChange={e => setFormData({...formData, password: e.target.value})} />
              </div>

              <button disabled={loading} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all mt-4">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "Authorize User"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}