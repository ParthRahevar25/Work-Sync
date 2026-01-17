 import WelcomeCard from "@/components/WelcomeCard"
import QuickActions from "@/components/QuickActions"
import TodaySummary from "@/components/TodaySummary"

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <WelcomeCard />
        <TodaySummary />
        <QuickActions />
      </div>
    </div>
  )
}

export default Home
