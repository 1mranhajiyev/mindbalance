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

  const sessionList = Array.isArray(sessions) ? sessions : []

  const todaySessions = sessionList.filter((s: any) => {
    const d = new Date(s.scheduled_at)
    const today = new Date()
    return d.toDateString() === today.toDateString() && s.status === 'scheduled'
  })

  const stats = [
    { label: 'Aktiv pasiyent', value: dashboard?.active_patients ?? '0', icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Cəmi seans', value: dashboard?.total_sessions ?? '0', icon: Calendar, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Gözləyən tapşırıq', value: dashboard?.pending_tasks ?? '0', icon: ClipboardList, color: 'bg-amber-50 text-amber-600' },
    { label: 'Seans qiyməti', value: dashboard?.session_price ? `${dashboard.session_price} AZN` : '—', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Salam, {user?.full_name?.split(' ')[0]}</h1>
        <p className="text-slate-500 text-sm mt-1">Bugünkü iş gününüzə baxın</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Today’s sessions */}
      <div className="card">
        <h2 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wide">Bugünkü seanslar</h2>
        {todaySessions.length === 0 ? (
          <div className="empty-state py-10">
            <div className="empty-state-icon"><Calendar size={32} /></div>
            <h3>Seans yoxdur</h3>
            <p>Bu gün üçün planlanmış seans tapılmadı.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {todaySessions.map((s: any) => (
              <div key={s.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{format(new Date(s.scheduled_at), 'HH:mm', { locale: az })}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.duration_minutes} dəqə · {s.format}</p>
                </div>
                <span className="badge badge-primary">Planlı</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
