const WelcomeCard = () => {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          Welcome back, Parth 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Here’s what’s happening at WorkSync today
        </p>
      </div>

      <div className="mt-4 md:mt-0">
        <span className="inline-block bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-medium">
          Status: Active
        </span>
      </div>
    </div>
  )
}

export default WelcomeCard
