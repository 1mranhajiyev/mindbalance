'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'

export default function PsychologistNotes() {
  const qc = useQueryClient()
  const [content, setContent] = useState('')
  const [patientId, setPatientId] = useState('')

  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: () => api.get('/notes').then(r => r.data)
  })

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get('/patients').then(r => r.data)
  })

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/notes', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); setContent('') }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Qeydlər</h1>
        <p className="text-gray-500 mt-1">Səans qeydlərinizi idarə edin</p>
      </div>
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Yeni qeyd</h2>
        <ApiErrorAlert error={mutation.error} fallback="Qeyd saxlanıla bilmədi" />
        <div className="space-y-3">
          <select value={patientId} onChange={e => setPatientId(e.target.value)} className="select">
            <option value="">Pasiyent seçin</option>
            {patients?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
          <textarea value={content} onChange={e => setContent(e.target.value)} className="textarea" placeholder="Qeydinizi yazın..." />
          <button
            onClick={() => mutation.mutate({ patient_id: patientId, content })}
            disabled={!content || !patientId}
            className="btn-primary"
          >Saxla</button>
        </div>
      </div>
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Qeydlər tarixi</h2>
        {isLoading ? <p className="text-gray-400 text-sm">Yüklənilir...</p> : !notes?.length ? (
          <p className="text-gray-400 text-sm">Heç bir qeyd tapılmadı.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((n: any) => (
              <li key={n.id} className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-900">{n.content}</p>
                <p className="text-xs text-gray-400 mt-1">{n.patient_name} · {new Date(n.created_at).toLocaleDateString('az')}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
