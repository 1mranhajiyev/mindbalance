'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export default function PsychologistTasks() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['psych-tasks'],
    queryFn: () => api.get('/tasks').then(r => r.data)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tapşırıqlar</h1>
        <p className="text-gray-500 mt-1">Pasiyentlərə verilmiş tapşırıqlar</p>
      </div>
      <div className="card">
        {isLoading ? (
          <p className="text-gray-400 text-sm">Yüklənilir...</p>
        ) : !tasks?.length ? (
          <p className="text-gray-400 text-sm">Heç bir tapşırıq tapılmadı.</p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((t: any) => (
              <li key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{t.title}</p>
                  <p className="text-xs text-gray-500">{t.patient_name || ''}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  t.is_completed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>{t.is_completed ? 'Tamamlandı' : 'Gözləyir'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
