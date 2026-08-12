'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'

export default function PsychologistStatistics() {
  const { data: stats } = useQuery({
    queryKey: ['psych-stats'],
    queryFn: () => api.get('/psychologist/statistics').then(r => r.data)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Statistika</h1>
        <p className="text-gray-500 mt-1">Fəaliyyətinizin statistikası</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Ümumi seans', value: stats?.total_sessions ?? '-' },
          { label: 'Tamamlanan', value: stats?.completed_sessions ?? '-' },
          { label: 'Aktiv pasiyent', value: stats?.active_patients ?? '-' },
          { label: 'Bu ay gəlir', value: stats?.monthly_revenue ? `${stats.monthly_revenue} ₼` : '-' },
        ].map(item => (
          <div key={item.label} className="card">
            <p className="text-3xl font-bold text-violet-600">{item.value}</p>
            <p className="text-sm text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
