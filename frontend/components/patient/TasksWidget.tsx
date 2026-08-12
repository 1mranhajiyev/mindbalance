interface Task { id: string; title: string; due_date?: string }

export default function TasksWidget({ tasks }: { tasks: Task[] }) {
  return (
    <div className="card">
      <h2 className="font-semibold text-gray-900 mb-3">✅ Tapşırıqlar ({tasks.length})</h2>
      {tasks.length === 0
        ? <p className="text-gray-400 text-sm">Aktiv tapşırıq yoxdur.</p>
        : <ul className="space-y-2">
            {tasks.slice(0, 4).map(t => (
              <li key={t.id} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
                {t.title}
              </li>
            ))}
          </ul>
      }
    </div>
  )
}
