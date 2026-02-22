import { useEffect, useState } from "react";
import api from "@/api/axios";
import {
  X,
  User,
  Briefcase,
  Calendar,
  MapPin,
  Phone,
  Mail,
  ShieldAlert,
  Loader2,
} from "lucide-react";

interface Props {
  employeeId: string;
  onClose: () => void;
}

const EmployeeDetailsDrawer = ({ employeeId, onClose }: Props) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/employee/${employeeId}`);
        setData(res.data);
      } catch (err) {
        console.error("Fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [employeeId]);

  if (loading)
    return (
      <div className="fixed inset-y-0 right-0 w-[500px] bg-slate-950/80 backdrop-blur-xl border-l border-white/10 z-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xl bg-slate-950/90 backdrop-blur-2xl border-l border-white/10 z-50 shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
              {data.name?.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">
                {data.name}
              </h2>
              <p className="text-blue-400 text-xs font-black uppercase tracking-widest">
                {data.designation}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-slate-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex px-6 border-b border-white/5 bg-white/2">
          {["profile", "employment", "timeline"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2 ${
                activeTab === tab
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto h-[calc(100vh-160px)] custom-scrollbar">
          {activeTab === "profile" && <ProfileTab data={data} />}
          {activeTab === "employment" && <EmploymentTab data={data} />}
          {activeTab === "timeline" && <TimelineTab timeline={data.timeline} />}
        </div>
      </div>
    </>
  );
};

/* --- Sub-Components for Clean Code --- */

const ProfileTab = ({ data }: any) => (
  <div className="space-y-6">
    <Section title="Contact Information">
      <InfoBox
        icon={<Mail size={14} />}
        label="Email Address"
        value={data.email}
      />
      <InfoBox
        icon={<Phone size={14} />}
        label="Phone Number"
        value={data.phone || "Not Provided"}
      />
      <InfoBox
        icon={<MapPin size={14} />}
        label="Residence"
        value={data.address || "Not Provided"}
      />
      <InfoBox
        icon={<ShieldAlert size={14} />}
        label="Emergency Contact"
        value={data.emergencyContact || "N/A"}
      />
    </Section>
  </div>
);

const EmploymentTab = ({ data }: any) => (
  <div className="space-y-6">
    <Section title="Job Details">
      <InfoBox
        icon={<Briefcase size={14} />}
        label="Department"
        value={data.department}
      />
      <InfoBox
        icon={<User size={14} />}
        label="Reporting Manager"
        value={data.managerId?.name || "No Manager Assigned"}
      />
      <InfoBox
        icon={<MapPin size={14} />}
        label="Work Mode"
        value={data.workLocation}
      />
      <InfoBox
        icon={<Calendar size={14} />}
        label="Joining Date"
        value={new Date(data.joiningDate).toLocaleDateString()}
      />
    </Section>
    <div
      className={`p-4 rounded-2xl border ${data.accountInfo?.isActive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"}`}
    >
      <p className="text-[10px] font-black uppercase mb-1">Account Status</p>
      <p className="text-sm font-bold">
        {data.accountInfo?.isActive ? "SYSTEM ACTIVE" : "DEACTIVATED"}
      </p>
    </div>
  </div>
);

const TimelineTab = ({ timeline }: any) => (
  <div className="relative pl-6 border-l border-white/10 space-y-8 ml-2">
    {timeline?.length > 0 ? (
      timeline.map((event: any, i: number) => (
        <div key={i} className="relative">
          <div className="absolute -left-[31px] top-1 h-2.5 w-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
          <p className="text-[10px] font-black text-slate-500 uppercase">
            {new Date(event.date).toDateString()}
          </p>
          <p className="text-white font-medium">{event.event}</p>
        </div>
      ))
    ) : (
      <p className="text-slate-500 italic text-sm">No history recorded yet.</p>
    )}
  </div>
);

const Section = ({ title, children }: any) => (
  <div className="space-y-3">
    <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
      {title}
    </h4>
    <div className="grid grid-cols-1 gap-3">{children}</div>
  </div>
);

const InfoBox = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">
    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">
        {label}
      </p>
      <p className="text-sm text-slate-200 font-semibold">{value}</p>
    </div>
  </div>
);

export default EmployeeDetailsDrawer;
