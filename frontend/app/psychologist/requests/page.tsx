'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'
import { UserCheck, UserX, Clock } from 'lucide-react'

export default function RequestsPage() {
  const qc = useQueryClient()

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['pending-requests'],
    queryFn: () => api.get('/onboarding/pending-requests').then(r => r.data),
  })

  const respond = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.post(`/onboarding/respond/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pending-requests'] }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gələn müraciətlər</h1>
        <p className="text-sm text-slate-500 mt-1">Pasiyentlərin qoşulma müraciətlərini idarə edin.</p>
      </div>

      <ApiErrorAlert error={respond.error} fallback="Müraciət cavablandırıla bilmədi" />

      {isLoading && <div className="text-slate-400 text-sm">Yüklənir...</div>}

      {!isLoading && requests.length === 0 && (
        <div className="card flex flex-col items-center py-12 gap-3 text-center">
          <Clock size={36} className="text-slate-300" strokeWidth={1.5} />
          <p className="font-medium text-slate-700">Gözləmədə müraciət yoxdur</p>
          <p className="text-xs text-slate-400">Yeni pasiyent müraciət etdikdə burada görünəcək.</p>
        </div>
      )}

      <div className="space-y-3">
        {requests.map((r: any) => (
          <div key={r.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900 text-sm">{r.patient_name}</p>
                {r.message && <p className="text-xs text-slate-500 mt-1 max-w-md">{r.message}</p>}
                <p className="text-xs text-slate-400 mt-1.5">{new Date(r.created_at).toLocaleDateString('az-AZ')}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => respond.mutate({ id: r.id, status: 'rejected' })}
                  disabled={respond.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
                >
                  <UserX size={13} /> Rədd et
                </button>
                <button
                  onClick={() => respond.mutate({ id: r.id, status: 'accepted' })}
                  disabled={respond.isPending}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  <UserCheck size={13} /> Qəbul et
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
