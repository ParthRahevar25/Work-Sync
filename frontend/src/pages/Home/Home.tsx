import AttendanceCard from "@/components/AttendanceCard";
import QuickActions from "@/components/QuickActions";
import TodaySummary from "@/components/TodaySummary";
import WelcomeCard from "@/components/WelcomeCard";
import { useAuth } from "@/context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F1F5F9] p-6 lg:p-12 transition-colors duration-500">
      {/* 1. Increased Max-Width for 'Big' Components */}
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Top Section: Welcome & Attendance side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8">
            <WelcomeCard />
          </div>
          <div className="lg:col-span-4">
            <AttendanceCard />
          </div>
        </div>

        {/* Middle Section: Stats (Admin Only) */}
        {user?.role === "admin" && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8 px-2">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Organization Insights</h2>
                <p className="text-slate-500 text-sm font-medium">Real-time overview of company performance</p>
              </div>
              <div className="h-px flex-1 bg-slate-200 mx-8 hidden md:block"></div>
            </div>
            <TodaySummary />
          </section>
        )}

        {/* Bottom Section: Quick Actions */}
        <section className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quick Access</h2>
              <p className="text-slate-500 text-sm font-medium">Frequently used tools and shortcuts</p>
            </div>
            <div className="h-px flex-1 bg-slate-200 mx-8 hidden md:block"></div>
          </div>
          <QuickActions />
        </section>
      </div>
    </div>
  );
};

export default Home;