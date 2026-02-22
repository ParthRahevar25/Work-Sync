import { useEffect, useState } from "react";
import api from "@/api/axios";
import { UserPlus, BadgeCheck, X, Loader2 } from "lucide-react";
import EmployeeDetailsDrawer from "@/components/EmployeeDetails";
import { useNavigate } from "react-router-dom";

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const [empData, setEmpData] = useState({
    employeeCode: "",
    name: "",
    department: "",
    designation: "",
    email: "",
    role: "employee",
  });

  const [password, setPassword] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const res = await api.get("/employee");
    setEmployees(res.data);
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const empRes = await api.post("/employee", { ...empData });
      const newEmployeeId = empRes.data.data._id;

      await api.post("/users", {
        email: empData.email,
        name: empData.name,
        password: password,
        role: empData.role,
        employeeId: newEmployeeId,
      });

      alert(
        "🎉 Onboarding Complete: Employee profile and User account created!",
      );
      setShowModal(false);
      setEmpData({
        employeeCode: "",
        name: "",
        department: "",
        designation: "",
        email: "",
        role: "employee",
      });
      setPassword("");
      fetchEmployees();
    } catch (err: any) {
      alert(err.response?.data?.error || "Onboarding failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const inputClass =
    "w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 outline-none focus:border-blue-500 focus:bg-white/[0.07] transition-all text-sm";
  const labelClass =
    "text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1";

  return (
    <div className="relative z-10 p-6 lg:p-10 min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-10">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Workforce <span className="text-blue-500">Onboarding</span>
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1">
              Manage employee profiles and system credentials
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-blue-500 transition-all text-sm w-full sm:w-64"
            />
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 whitespace-nowrap"
            >
              <UserPlus size={16} /> Register Employee
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-white/[0.03] border-b border-white/10">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                    Profile
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                    Department
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                    Designation
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">
                    Role
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-8 py-16 text-center text-slate-500 text-sm"
                    >
                      No employees found.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr
                      key={emp._id}
                      onClick={() => setSelectedId(emp._id)}
                      className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                    >
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white font-bold text-sm shadow-inner shrink-0">
                            {emp.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                              {emp.name}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                              {emp.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-slate-300">
                        {emp.department}
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-slate-400">
                        {emp.designation}
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider">
                          {emp.role}
                        </span>
                      </td>
                      {/* <td className="px-8 py-5 text-right">
                        <button className="text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-colors">
                          View File
                        </button>
                      </td> */}
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-4 items-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(emp._id);
                            }}
                            className="text-[10px] font-black text-slate-400 hover:text-blue-400 uppercase tracking-widest transition-colors"
                          >
                            View
                          </button>


                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevents opening the drawer
                              navigate(`/employees/edit/${emp._id}`); // Adjust this route to match your App.tsx
                            }}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black text-white uppercase tracking-widest transition-all"
                          >
                            Complete Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ONBOARDING MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#030712]/80 backdrop-blur-md">
          <div className="bg-[#0b1120] border border-white/10 rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white">
                  <BadgeCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white uppercase tracking-tight">
                    New Hire
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Fill in all fields to onboard a new employee
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X size={22} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleOnboard}
              className="p-8 space-y-5 max-h-[75vh] overflow-y-auto"
            >
              {/* Section: Employee Info */}
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Employee Info
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelClass}>Employee ID</label>
                  <input
                    required
                    placeholder="e.g. EMP-001"
                    value={empData.employeeCode}
                    className={inputClass}
                    onChange={(e) =>
                      setEmpData({ ...empData, employeeCode: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Full Name</label>
                  <input
                    required
                    placeholder="e.g. John Doe"
                    value={empData.name}
                    className={inputClass}
                    onChange={(e) =>
                      setEmpData({ ...empData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Department</label>
                  <input
                    required
                    placeholder="e.g. Engineering"
                    value={empData.department}
                    className={inputClass}
                    onChange={(e) =>
                      setEmpData({ ...empData, department: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Designation</label>
                  <input
                    required
                    placeholder="e.g. Software Engineer"
                    value={empData.designation}
                    className={inputClass}
                    onChange={(e) =>
                      setEmpData({ ...empData, designation: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Section: Account Credentials */}
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pt-2">
                Account Credentials
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelClass}>Email</label>
                  <input
                    required
                    type="email"
                    placeholder="e.g. user@worksync.com"
                    value={empData.email}
                    className={inputClass}
                    onChange={(e) =>
                      setEmpData({ ...empData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Password</label>
                  <input
                    required
                    type="password"
                    placeholder="Set a login password"
                    value={password}
                    className={inputClass}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Role</label>
                  <select
                    required
                    value={empData.role}
                    className={inputClass}
                    onChange={(e) =>
                      setEmpData({ ...empData, role: e.target.value })
                    }
                  >
                    <option value="employee" className="bg-[#0b1120]">
                      Employee
                    </option>
                    <option value="admin" className="bg-[#0b1120]">
                      Admin
                    </option>
                    <option value="manager" className="bg-[#0b1120]">
                      Manager
                    </option>
                  </select>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-widest transition-all mt-2 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Complete Onboarding"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
      {selectedId && (
        <EmployeeDetailsDrawer
          employeeId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
