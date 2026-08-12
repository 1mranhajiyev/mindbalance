'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'
import { CheckCircle, Circle } from 'lucide-react'

export default function TasksPage() {
  const qc = useQueryClient()
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then(r => r.data)
  })

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.post(`/tasks/${id}/complete`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] })
  })

  const pending = tasks.filter((t: any) => !t.is_completed)
  const completed = tasks.filter((t: any) => t.is_completed)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">✅ Tapşırıqlarım</h1>
      <ApiErrorAlert error={completeMutation.error} fallback="Tapşırıq tamamlana bilmədi" />
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-700">Gözləyən ({pending.length})</h2>
        {pending.map((t: any) => (
          <div key={t.id} className="card flex items-start gap-4">
            <button onClick={() => completeMutation.mutate(t.id)} className="mt-0.5 text-gray-300 hover:text-primary-600 transition-colors">
              <Circle size={22} />
            </button>
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{t.title}</p>
              {t.description && <p className="text-sm text-gray-500 mt-1">{t.description}</p>}
              {t.due_date && <p className="text-xs text-primary-600 mt-2">Son tarix: {format(new Date(t.due_date), 'd MMMM', { locale: az })}</p>}
            </div>
          </div>
        ))}
      </div>
      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-700">Tamamlandı ({completed.length})</h2>
          {completed.map((t: any) => (
            <div key={t.id} className="card flex items-start gap-4 opacity-60">
              <CheckCircle size={22} className="text-green-500 mt-0.5" />
              <p className="font-semibold text-gray-900 line-through">{t.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
