'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Target } from 'lucide-react'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'

export default function PatientGoalsPage() {
  const qc = useQueryClient()
  const [scores, setScores] = useState<Record<string, number>>({})

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.get('/goals').then(r => r.data),
  })

  const progressMutation = useMutation({
    mutationFn: ({ id, score }: { id: string; score: number }) =>
      api.post(`/goals/${id}/progress`, { score }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Target size={24} className="text-primary-600" />
        <h1 className="page-title">Məqsədlər</h1>
      </div>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Yüklənilir...</p>
      ) : goals.length === 0 ? (
        <div className="card text-center py-10 text-gray-400 text-sm">Hələ məqsəd təyin edilməyib.</div>
      ) : (
        <div className="space-y-4">
          {goals.map((g: any) => (
            <div key={g.id} className="card space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{g.title}</h3>
                  {g.description && <p className="text-sm text-gray-500 mt-1">{g.description}</p>}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                  g.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'
                }`}>
                  {g.status === 'completed' ? 'Tamamlandı' : 'Aktiv'}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Başlanğıc: {g.initial_score}/10</span>
                <span>Hədəf: {g.target_score}/10</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-primary-600 h-2.5 rounded-full transition-all" style={{ width: `${(g.current_score / 10) * 100}%` }} />
              </div>
              <p className="text-sm font-semibold text-primary-700">İndi: {g.current_score}/10</p>
              {g.status !== 'completed' && (
                <div className="flex gap-2 items-end pt-2 border-t border-primary-50">
                  <div className="flex-1">
                    <label className="label">Yeni bal (1-10)</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={scores[g.id] ?? g.current_score}
                      onChange={e => setScores(s => ({ ...s, [g.id]: +e.target.value }))}
                      className="input"
                    />
                  </div>
                  <button
                    onClick={() => progressMutation.mutate({ id: g.id, score: scores[g.id] ?? g.current_score })}
                    disabled={progressMutation.isPending}
                    className="btn-primary shrink-0"
                  >
                    Yenilə
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <ApiErrorAlert error={progressMutation.error} fallback="İrəliləyiş yenilənə bilmədi" />
    </div>
  )
}
