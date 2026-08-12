'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'

export default function PsychologistTasks() {
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [patientId, setPatientId] = useState('')

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['psych-tasks'],
    queryFn: () => api.get('/tasks').then(r => r.data)
  })

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get('/patients').then(r => r.data)
  })

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/tasks', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['psych-tasks'] })
      setTitle('')
      setDescription('')
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tapşırıqlar</h1>
        <p className="text-gray-500 mt-1">Pasiyentlərə verilmiş tapşırıqlar</p>
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-900">Yeni tapşırıq</h2>
        <ApiErrorAlert error={mutation.error} fallback="Tapşırıq yaradıla bilmədi" />
        <select value={patientId} onChange={e => setPatientId(e.target.value)} className="select">
          <option value="">Pasiyent seçin</option>
          {patients.map((p: any) => (
            <option key={p.id} value={p.id}>{p.full_name}</option>
          ))}
        </select>
        <input value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="Tapşırıq başlığı" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="textarea" placeholder="Təsvir..." />
        <button
          onClick={() => mutation.mutate({ patient_id: patientId, title, description })}
          disabled={!title || !patientId || mutation.isPending}
          className="btn-primary"
        >
          {mutation.isPending ? 'Saxlanılır...' : 'Tapşırıq yarat'}
        </button>
      </div>

      <div className="card">
        {isLoading ? (
          <p className="text-gray-400 text-sm">Yüklənilir...</p>
        ) : !tasks?.length ? (
          <p className="text-gray-400 text-sm">Heç bir tapşırıq tapılmadı.</p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((t: any) => (
              <li key={t.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{t.title}</p>
                  <p className="text-xs text-gray-500">{t.patient_name || ''}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  t.is_completed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>{t.is_completed ? 'Tamamlandı' : 'Gözləyir'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
