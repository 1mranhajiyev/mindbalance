'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2, X, Check } from 'lucide-react'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'

export default function PsychologistNotes() {
  const qc = useQueryClient()
  const [content, setContent] = useState('')
  const [patientId, setPatientId] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: () => api.get('/notes').then(r => r.data)
  })

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get('/patients').then(r => r.data)
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/notes', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notes'] }); setContent('') }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, content: c }: { id: string; content: string }) => api.patch(`/notes/${id}`, { content: c }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] })
      setEditingId(null)
      setEditContent('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Qeydlər</h1>
        <p className="text-gray-500 mt-1">Səans qeydlərinizi idarə edin</p>
      </div>
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Yeni qeyd</h2>
        <ApiErrorAlert error={createMutation.error} fallback="Qeyd saxlanıla bilmədi" />
        <div className="space-y-3">
          <select value={patientId} onChange={e => setPatientId(e.target.value)} className="select">
            <option value="">Pasiyent seçin</option>
            {patients?.map((p: any) => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
          <textarea value={content} onChange={e => setContent(e.target.value)} className="textarea" placeholder="Qeydinizi yazın..." />
          <button
            onClick={() => createMutation.mutate({ patient_id: patientId, content })}
            disabled={!content || !patientId}
            className="btn-primary"
          >Saxla</button>
        </div>
      </div>
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Qeydlər tarixi</h2>
        <ApiErrorAlert error={updateMutation.error || deleteMutation.error} fallback="Əməliyyat uğursuz oldu" />
        {isLoading ? <p className="text-gray-400 text-sm">Yüklənilir...</p> : !notes?.length ? (
          <p className="text-gray-400 text-sm">Heç bir qeyd tapılmadı.</p>
        ) : (
          <ul className="space-y-3">
            {notes.map((n: any) => (
              <li key={n.id} className="p-3 bg-gray-50 rounded-xl">
                {editingId === n.id ? (
                  <div className="space-y-2">
                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="textarea" rows={3} />
                    <div className="flex gap-2">
                      <button onClick={() => updateMutation.mutate({ id: n.id, content: editContent })} className="btn-primary text-xs flex items-center gap-1">
                        <Check size={14} /> Saxla
                      </button>
                      <button onClick={() => setEditingId(null)} className="btn-secondary text-xs flex items-center gap-1">
                        <X size={14} /> Ləğv
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-900">{n.content}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">{n.patient_name} · {new Date(n.created_at).toLocaleDateString('az')}</p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setEditingId(n.id); setEditContent(n.content) }}
                          className="p-1.5 rounded-lg hover:bg-primary-50 text-gray-500"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(n.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
