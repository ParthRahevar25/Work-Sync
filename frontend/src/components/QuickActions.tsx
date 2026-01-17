const actions = [
  { title: "Apply Leave", color: "bg-blue-500" },
  { title: "View Attendance", color: "bg-green-500" },
  { title: "Ask AI Assistant", color: "bg-purple-500" },
  { title: "Profile", color: "bg-gray-700" },
]

const QuickActions = () => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => (
          <button
            key={action.title}
            className={`${action.color} text-white py-3 rounded-lg font-medium hover:opacity-90 transition`}
          >
            {action.title}
          </button>
        ))}
      </div>
    </div>
  )
}

export default QuickActions
