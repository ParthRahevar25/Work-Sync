import AttendanceCard from "@/components/AttendanceCard";
import QuickActions from "@/components/QuickActions";
import TodaySummary from "@/components/TodaySummary";
import WelcomeCard from "@/components/WelcomeCard";
import { useAuth } from "@/context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="relative z-10 p-6 lg:p-10 min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Top Section: Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-8">
            <WelcomeCard />
          </div>
          <div className="lg:col-span-4">
            <AttendanceCard />
          </div>
        </div>

        {/* Section 1: Organization Insights (Admin Only) */}
        {user?.role === "admin" && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Standardized Header Format */}
            <div className="flex items-center justify-between mb-8 px-2">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Organization <span className="text-blue-500 underline decoration-blue-500/30">Insights</span>
                </h2>
                <p className="text-slate-400 text-sm font-medium mt-1">Real-time overview of company performance</p>
              </div>
              <div className="h-[1px] flex-1 bg-slate-800 mx-8 hidden md:block"></div>
            </div>
            <TodaySummary />
          </section>
        )}

        {/* Section 2: Quick Access */}
        <section className="animate-in fade-in slide-in-from-bottom-6 duration-1000">
          {/* Standardized Header Format */}
          <div className="flex items-center justify-between mb-8 px-2">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Quick <span className="text-blue-500">Access</span>
              </h2>
              <p className="text-slate-400 text-sm font-medium mt-1">Frequently used tools and shortcuts</p>
            </div>
            <div className="h-[1px] flex-1 bg-slate-800 mx-8 hidden md:block"></div>
          </div>
          <QuickActions />
        </section>

      </div>
    </div>
  );
};

export default Home;