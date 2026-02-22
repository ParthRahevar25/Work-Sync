import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Loader2,
  Phone,
  ShieldAlert,
  Briefcase,
  Globe,
  User,
  Calendar,
} from "lucide-react";
import api from "@/api/axios";

export default function EmployeeProfileEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employee, setEmployee] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    emergencyContact: "",
    workLocation: "On-site",
    status: "Probation",
    department: "",
    designation: "",
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employee/${id}`);
        setEmployee(res.data);
        setFormData({
          phone: res.data.phone || "",
          address: res.data.address || "",
          emergencyContact: res.data.emergencyContact || "",
          workLocation: res.data.workLocation || "On-site",
          status: res.data.status || "Probation",
          department: res.data.department || "",
          designation: res.data.designation || "",
        });
      } catch (err) {
        console.error("Error fetching employee", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/employee/${id}`, formData);
      alert("Profile Synchronized Successfully! ✨");
    } catch (err) {
      alert("Update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#030712]">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen  text-white p-6 lg:p-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-3 text-slate-500 hover:text-white transition-all uppercase text-[10px] font-black tracking-[0.2em]"
          >
            <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 border border-white/5">
              <ArrowLeft size={16} />
            </div>
            Back to workforce
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-3 px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            Commit Changes
          </button>
        </div>

        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-md">
          <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-4xl font-black shadow-2xl">
            {employee?.name?.charAt(0)}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-black tracking-tight">
              {employee?.name}
            </h1>
            <p className="text-blue-400 font-bold uppercase tracking-[0.3em] text-xs mt-2">
              {employee?.designation} • {employee?.employeeCode}
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section: Personal Details */}
          <div className="lg:col-span-2 space-y-8">
            <Section title="Contact & Residence" icon={<Globe size={16} />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup
                  label="Phone Number"
                  icon={<Phone size={14} />}
                  value={formData.phone}
                  onChange={(v: any) => setFormData({ ...formData, phone: v })}
                />
                <InputGroup
                  label="Emergency Contact"
                  icon={<ShieldAlert size={14} />}
                  value={formData.emergencyContact}
                  onChange={(v: any) =>
                    setFormData({ ...formData, emergencyContact: v })
                  }
                />
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">
                    Full Address
                  </label>
                  <textarea
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-sm h-24 outline-none focus:border-blue-500 transition-all"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>
            </Section>

            <Section
              title="Employment Alignment"
              icon={<Briefcase size={16} />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectGroup
                  label="Work Location"
                  options={["On-site", "Remote", "Hybrid"]}
                  value={formData.workLocation}
                  onChange={(v: any) =>
                    setFormData({ ...formData, workLocation: v })
                  }
                />
                <SelectGroup
                  label="Current Status"
                  options={[
                    "Probation",
                    "Permanent",
                    "Notice Period",
                    "Terminated",
                  ]}
                  value={formData.status}
                  onChange={(v: any) => setFormData({ ...formData, status: v })}
                />
              </div>
            </Section>
          </div>

          {/* Section: Sidebar Stats */}
          <div className="space-y-6">
            <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] space-y-6">
              <h3 className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                System Info
              </h3>
              <SidebarItem
                label="Role"
                value={employee?.role}
                icon={<User size={14} />}
              />
              <SidebarItem
                label="Department"
                value={employee?.department}
                icon={<Briefcase size={14} />}
              />
              <SidebarItem
                label="Joined"
                value={new Date(employee?.joiningDate).toLocaleDateString()}
                icon={<Calendar size={14} />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Reusable UI Parts --- */

const Section = ({ title, icon, children }: any) => (
  <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 space-y-6">
    <div className="flex items-center gap-3 pb-2 border-b border-white/5">
      <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">{icon}</div>
      <h2 className="text-sm font-black uppercase tracking-widest text-slate-300">
        {title}
      </h2>
    </div>
    {children}
  </div>
);

const InputGroup = ({ label, icon, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
      {label}
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
        {icon}
      </div>
      <input
        className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  </div>
);

const SelectGroup = ({ label, options, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
      {label}
    </label>
    <select
      className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt: string) => (
        <option key={opt} value={opt} className="bg-[#0f172a]">
          {opt}
        </option>
      ))}
    </select>
  </div>
);

const SidebarItem = ({ label, value, icon }: any) => (
  <div className="flex items-center gap-4">
    <div className="text-slate-500">{icon}</div>
    <div>
      <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">
        {label}
      </p>
      <p className="text-sm font-bold text-slate-300">{value}</p>
    </div>
  </div>
);
