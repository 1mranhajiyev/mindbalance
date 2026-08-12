'use client'
import { useQuery } from '@tanstack/react-query'
import { CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'
import api from '@/lib/api'

export default function PatientPaymentsPage() {
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => api.get('/payments').then(r => r.data),
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <CreditCard size={24} className="text-primary-600" />
        <h1 className="page-title">Ödənişlər</h1>
      </div>

      <div className="card">
        {isLoading ? (
          <p className="text-gray-400 text-sm">Yüklənilir...</p>
        ) : payments.length === 0 ? (
          <p className="text-gray-400 text-sm">Ödəniş qeydi yoxdur.</p>
        ) : (
          <div className="space-y-3">
            {payments.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{p.psychologist_name}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(p.scheduled_at), 'd MMMM yyyy', { locale: az })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm">{p.amount} ₼</p>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    p.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {p.status === 'paid' ? 'Ödənildi' : 'Gözləyir'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
