interface Goal {
  id: string
  title: string
  initial_score: number
  current_score: number
  target_score: number
  status: string
}

export default function GoalsWidget({ goals }: { goals: Goal[] }) {
  if (!goals.length) return null
  return (
    <div className="card">
      <h2 className="section-title">Terapiya məqsədlərim</h2>
      <div className="space-y-4">
        {goals.slice(0, 3).map(g => (
          <div key={g.id}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium text-gray-700">{g.title}</span>
              <span className="text-primary-600 font-semibold">{g.current_score}/10</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${(g.current_score / 10) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>Başlanğıc: {g.initial_score}</span>
              <span>Hədəf: {g.target_score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
