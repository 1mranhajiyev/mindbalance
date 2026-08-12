'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'
import { UserCheck, UserX, Clock, ChevronDown, ChevronUp, Mail, Phone } from 'lucide-react'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'

const assessmentLabels: Record<string, string> = {
  therapy_reason: 'Terapiyaya başlama səbəbi',
  main_concern: 'Əsas narahatlıq',
  desired_change: 'Dəyişmək istədiyi',
  therapy_expectation: 'Terapiyadan gözlənti',
  life_difficulties: 'Həyat çətinlikləri',
  anxiety_score: 'Narahatlıq',
  self_confidence_score: 'Özünəinam',
  stress_score: 'Stress',
  relationships_score: 'Münasibətlər',
  boundaries_score: 'Sərhəd qoymaq',
}

function AssessmentDetails({ assessment }: { assessment: Record<string, unknown> | null }) {
  if (!assessment) {
    return <p className="text-sm text-slate-400">Onboarding qiymətləndirməsi doldurulmayıb.</p>
  }

  const textFields = ['therapy_reason', 'main_concern', 'desired_change', 'therapy_expectation', 'life_difficulties']
  const scoreFields = ['anxiety_score', 'self_confidence_score', 'stress_score', 'relationships_score', 'boundaries_score']

  return (
    <div className="space-y-4 mt-4 pt-4 border-t border-slate-100">
      {textFields.some(k => assessment[k]) && (
        <div className="space-y-3">
          {textFields.map(key => {
            const value = assessment[key]
            if (!value || typeof value !== 'string') return null
            return (
              <div key={key}>
                <p className="text-xs font-medium text-slate-500 mb-0.5">{assessmentLabels[key]}</p>
                <p className="text-sm text-slate-700 leading-relaxed">{value}</p>
              </div>
            )
          })}
        </div>
      )}
      {scoreFields.some(k => assessment[k] != null) && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Özünüqiymətləndirmə (0–10)</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {scoreFields.map(key => {
              const value = assessment[key]
              if (value == null) return null
              return (
                <div key={key} className="bg-slate-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-slate-500">{assessmentLabels[key]}</p>
                  <p className="text-sm font-semibold text-indigo-600">{String(value)}/10</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function RequestsPage() {
  const qc = useQueryClient()
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
        {requests.map((r: any) => {
          const expanded = expandedId === r.id
          return (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <span className="text-indigo-700 font-bold text-sm">
                        {r.patient_name?.[0]?.toUpperCase() || 'P'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{r.patient_name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {format(new Date(r.created_at), 'd MMMM yyyy, HH:mm', { locale: az })}
                      </p>
                    </div>
                  </div>
                  {r.message && (
                    <p className="text-sm text-slate-600 mt-3 pl-[52px] italic">&ldquo;{r.message}&rdquo;</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpandedId(expanded ? null : r.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {expanded ? 'Gizlət' : 'Detallar'}
                  </button>
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

              {expanded && (
                <div className="mt-4 pl-[52px]">
                  <div className="flex flex-wrap gap-4 mb-2">
                    {r.patient_email && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        {r.patient_email}
                      </span>
                    )}
                    {r.patient_phone && (
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                        <Phone size={14} className="text-slate-400" />
                        {r.patient_phone}
                      </span>
                    )}
                  </div>
                  <AssessmentDetails assessment={r.assessment} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
