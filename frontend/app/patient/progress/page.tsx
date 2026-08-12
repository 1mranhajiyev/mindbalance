'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { format } from 'date-fns'
const scoreLabels: Record<string, string> = {
  anxiety: 'Narahatlıq',
  stress: 'Stress',
  self_confidence: 'Özünə inam',
  relationships: 'Münasibətlər',
  boundaries: 'Sərhədlər',
}

export default function ProgressPage() {
  const { data: checkins = [] } = useQuery({
    queryKey: ['checkins'],
    queryFn: () => api.get('/checkins').then(r => r.data)
  })

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.get('/goals').then(r => r.data)
  })

  const { data: comparison } = useQuery({
    queryKey: ['progress-comparison'],
    queryFn: () => api.get('/progress/comparison').then(r => r.data),
    retry: false,
  })

  const chartData = checkins.slice(0, 30).reverse().map((c: any) => ({
    date: format(new Date(c.created_at), 'd MMM'),
    intensity: c.intensity ?? c.mood_score ?? 0,
  }))

  return (
    <div className="space-y-6">
      <h1 className="page-title">İnkişafım</h1>

      {comparison?.before && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Başlanğıc vs İndi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Başlanğıc (qiymətləndirmə)</p>
              <div className="space-y-2">
                {Object.entries(comparison.before).map(([key, val]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-600">{scoreLabels[key] || key}</span>
                    <span className="font-semibold text-gray-900">{val as number}/10</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">İndi (check-in ortalaması)</p>
              {comparison.now?.avg_intensity != null ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Orta emosional şiddət</span>
                    <span className="font-semibold text-primary-700">{comparison.now.avg_intensity}/10</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Check-in sayı</span>
                    <span className="font-semibold text-gray-900">{comparison.now.checkin_count}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Hələ kifayət qədər check-in yoxdur.</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Son 30 gün — Emosional vəziyyət</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="intensity" stroke="#4a8578" strokeWidth={2} dot={false} name="Şiddət" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((g: any) => (
          <div key={g.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-gray-900">{g.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                g.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'
              }`}>{g.status === 'completed' ? 'Tamamlandı' : 'Aktiv'}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Başlanğıc: {g.initial_score}/10</span>
                <span>Hədəf: {g.target_score}/10</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-primary-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${(g.current_score / 10) * 100}%` }}
                />
              </div>
              <p className="text-right text-sm font-semibold text-primary-700">İndi: {g.current_score}/10</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
