'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle } from 'lucide-react'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'

export default function PsychologistPayments() {
  const qc = useQueryClient()

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.get('/payments').then(r => r.data)
  })

  const markPaidMutation = useMutation({
    mutationFn: (sessionId: string) => api.post(`/sessions/${sessionId}/mark-paid`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ödənişlər</h1>
        <p className="text-gray-500 mt-1">Seans ödənişlərini izləyin</p>
      </div>
      <ApiErrorAlert error={markPaidMutation.error} fallback="Ödəniş təsdiqlənə bilmədi" />
      <div className="card">
        {isLoading ? (
          <p className="text-gray-400 text-sm">Yüklənilir...</p>
        ) : !payments?.length ? (
          <p className="text-gray-400 text-sm">Heç bir ödəniş tapılmadı.</p>
        ) : (
          <div className="space-y-3">
            {payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl gap-3">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{p.patient_name}</p>
                  <p className="text-xs text-gray-500">{new Date(p.created_at).toLocaleDateString('az')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">{p.amount} ₼</p>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>{p.status === 'paid' ? 'Ödənildi' : 'Gözləyir'}</span>
                  </div>
                  {p.status !== 'paid' && (
                    <button
                      onClick={() => markPaidMutation.mutate(p.id)}
                      disabled={markPaidMutation.isPending}
                      className="btn-primary text-xs flex items-center gap-1 px-3 py-1.5"
                    >
                      <CheckCircle size={14} />
                      Ödənildi
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
