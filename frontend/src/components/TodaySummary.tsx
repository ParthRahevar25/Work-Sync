const TodaySummary = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard title="Attendance" value="Present" />
      <SummaryCard title="Leaves Left" value="12" />
      <SummaryCard title="Late Marks" value="1" />
      <SummaryCard title="Next Holiday" value="Aug 15" />
    </div>
  )
}

const SummaryCard = ({
  title,
  value,
}: {
  title: string
  value: string
}) => {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <p className="text-gray-500 text-sm">{title}</p>
      <p className="text-2xl font-semibold text-gray-800 mt-2">
        {value}
      </p>
    </div>
  )
}

export default TodaySummary
