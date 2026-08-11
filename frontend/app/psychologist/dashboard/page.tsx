'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import { Users, Calendar, ClipboardList, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'

export default function PsychologistDashboard() {
  const { user } = useAuthStore()

  const { data: dashboard } = useQuery({
    queryKey: ['psychologist-dashboard'],
    queryFn: () => api.get('/psychologists/dashboard').then(r => r.data)
  })

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get('/sessions').then(r => r.data)
  })

  const todaySessions = sessions.filter((s: any) => {
    const d = new Date(s.scheduled_at)
    const today = new Date()
    return d.toDateString() === today.toDateString() && s.status === 'scheduled'
  })

  const stats = [
    { label: 'Aktiv pasiyent', value: dashboard?.active_patients ?? '-', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Cəmi seans', value: dashboard?.total_sessions ?? '-', icon: Calendar, color: 'bg-purple-50 text-purple-600' },
    { label: 'Gözləyən tapşırıq', value: dashboard?.pending_tasks ?? '-', icon: ClipboardList, color: 'bg-amber-50 text-amber-600' },
    { label: 'Seans qiyməti', value: dashboard?.session_price ? `${dashboard.session_price} AZN` : '-', icon: TrendingUp, color: 'bg-green-50 text-green-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Salam, {user?.full_name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-1">Bugünkü iş gününüzə baxın</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
              <Icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Bugünkü seanslar</h2>
        {todaySessions.length === 0
          ? <p className="text-gray-400 text-sm">Bu gün üçün seans yoxdur.</p>
          : <div className="divide-y divide-gray-50">
              {todaySessions.map((s: any) => (
                <div key={s.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{format(new Date(s.scheduled_at), 'HH:mm', { locale: az })}</p>
                    <p className="text-sm text-gray-500">{s.duration_minutes} dəqə • {s.format}</p>
                  </div>
                  <span className="text-xs bg-primary-100 text-primary-700 px-3 py-1 rounded-full">Planlı</span>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  )
}
