'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'
import { UserCheck, Clock, XCircle, Plus, Check } from 'lucide-react'

const statusLabels: Record<string, string> = {
  pending: 'Gözləyir',
  accepted: 'Qəbul edilib',
  rejected: 'Rədd edilib',
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  accepted: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
}

export default function PatientPsychologistsPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [selectedPsych, setSelectedPsych] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const { data: myPsychologists = [] } = useQuery({
    queryKey: ['my-psychologists'],
    queryFn: () => api.get('/onboarding/my-psychologists').then(r => r.data),
  })

  const { data: myRequests = [] } = useQuery({
    queryKey: ['my-requests'],
    queryFn: () => api.get('/onboarding/my-requests').then(r => r.data),
  })

  const { data: psychologists = [] } = useQuery({
    queryKey: ['onboarding-psychologists'],
    queryFn: () => api.get('/onboarding/psychologists').then(r => r.data),
    enabled: showForm,
  })

  const sendRequest = useMutation({
    mutationFn: (data: { psychologist_id: string; message?: string }) =>
      api.post('/onboarding/request', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-requests'] })
      qc.invalidateQueries({ queryKey: ['onboarding-psychologists'] })
      setShowForm(false)
      setSelectedPsych(null)
      setMessage('')
    },
  })

  const availablePsychologists = psychologists.filter(
    (p: any) => p.relationship_status === 'available'
  )

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Psixoloqlarım</h1>
          <p className="text-sm text-slate-500 mt-1">Aktiv müraciətləriniz və assign olunmuş psixoloqlar</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary flex items-center gap-2 shrink-0">
          <Plus size={16} />
          Yeni müraciət
        </button>
      </div>

      {showForm && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-slate-900">Yeni psixoloqa müraciət</h2>
          <ApiErrorAlert error={sendRequest.error} fallback="Müraciət göndərilə bilmədi" />
          {availablePsychologists.length === 0 ? (
            <p className="text-sm text-slate-400">Müraciət göndərə biləcəyiniz psixoloq yoxdur.</p>
          ) : (
            <div className="grid gap-2">
              {availablePsychologists.map((p: any) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPsych(p.id)}
                  className={`text-left p-3 rounded-xl border transition-all ${
                    selectedPsych === p.id
                      ? 'border-primary-500 bg-primary-50/40'
                      : 'border-slate-100 hover:border-primary-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-slate-900">{p.full_name}</p>
                      {p.specialization && (
                        <p className="text-xs text-primary-600 mt-0.5">{p.specialization}</p>
                      )}
                    </div>
                    {selectedPsych === p.id && <Check size={16} className="text-primary-600" />}
                  </div>
                </button>
              ))}
            </div>
          )}
          {selectedPsych && (
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              className="input resize-none"
              rows={2}
              placeholder="Mesaj (istəyə bağlı)..."
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={() => sendRequest.mutate({ psychologist_id: selectedPsych!, message })}
              disabled={!selectedPsych || sendRequest.isPending}
              className="btn-primary"
            >
              {sendRequest.isPending ? 'Göndərilir...' : 'Müraciət göndər'}
            </button>
            <button onClick={() => setShowForm(false)} className="btn-ghost">Ləğv et</button>
          </div>
        </div>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <UserCheck size={16} /> Assign olunmuş psixoloqlar ({myPsychologists.length})
        </h2>
        {myPsychologists.length === 0 ? (
          <div className="card text-sm text-slate-400">Hələ assign olunmuş psixoloq yoxdur.</div>
        ) : (
          myPsychologists.map((p: any) => (
            <div key={p.id} className="card flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{p.full_name}</p>
                {p.specialization && <p className="text-xs text-primary-600 mt-0.5">{p.specialization}</p>}
                {p.assigned_at && (
                  <p className="text-xs text-slate-400 mt-1">
                    {format(new Date(p.assigned_at), 'd MMM yyyy', { locale: az })} tarixindən
                  </p>
                )}
              </div>
              {p.session_price && (
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                  {p.session_price} ₼/seans
                </span>
              )}
            </div>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <Clock size={16} /> Müraciətlərim ({myRequests.length})
        </h2>
        {myRequests.length === 0 ? (
          <div className="card text-sm text-slate-400">Heç bir müraciət yoxdur.</div>
        ) : (
          myRequests.map((r: any) => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{r.psychologist_name}</p>
                  {r.message && <p className="text-xs text-slate-500 mt-1">{r.message}</p>}
                  <p className="text-xs text-slate-400 mt-1.5">
                    {format(new Date(r.created_at), 'd MMM yyyy, HH:mm', { locale: az })}
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${statusStyles[r.status]}`}>
                  {statusLabels[r.status] || r.status}
                </span>
              </div>
              {r.status === 'rejected' && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <XCircle size={12} /> Bu müraciət rədd edilib. Başqa psixoloqa müraciət edə bilərsiniz.
                </p>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  )
}
