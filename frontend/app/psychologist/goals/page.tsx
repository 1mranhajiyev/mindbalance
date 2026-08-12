'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Target, Plus } from 'lucide-react'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'

export default function PsychologistGoalsPage() {
  const qc = useQueryClient()
  const [patientId, setPatientId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [initialScore, setInitialScore] = useState(3)
  const [targetScore, setTargetScore] = useState(8)

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.get('/goals').then(r => r.data),
  })

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get('/patients').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/goals', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] })
      setTitle('')
      setDescription('')
      setPatientId('')
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Target size={24} className="text-primary-600" />
        <h1 className="page-title">Məqsədlər</h1>
      </div>

      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Plus size={16} /> Yeni məqsəd</h2>
        <ApiErrorAlert error={createMutation.error} fallback="Məqsəd yaradıla bilmədi" />
        <select value={patientId} onChange={e => setPatientId(e.target.value)} className="select">
          <option value="">Pasiyent seçin</option>
          {patients.map((p: any) => (
            <option key={p.id} value={p.id}>{p.full_name}</option>
          ))}
        </select>
        <input value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="Məqsəd başlığı" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="textarea" rows={2} placeholder="Təsvir (ixtiyari)" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Başlanğıc bal (1-10)</label>
            <input type="number" min={1} max={10} value={initialScore} onChange={e => setInitialScore(+e.target.value)} className="input" />
          </div>
          <div>
            <label className="label">Hədəf bal (1-10)</label>
            <input type="number" min={1} max={10} value={targetScore} onChange={e => setTargetScore(+e.target.value)} className="input" />
          </div>
        </div>
        <button
          onClick={() => createMutation.mutate({
            patient_id: patientId,
            title,
            description,
            initial_score: initialScore,
            current_score: initialScore,
            target_score: targetScore,
          })}
          disabled={!patientId || !title || createMutation.isPending}
          className="btn-primary"
        >
          {createMutation.isPending ? 'Saxlanılır...' : 'Məqsəd yarat'}
        </button>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Bütün məqsədlər</h2>
        {goals.length === 0 ? (
          <p className="text-gray-400 text-sm">Məqsəd yoxdur.</p>
        ) : (
          <div className="space-y-3">
            {goals.map((g: any) => (
              <div key={g.id} className="p-3 bg-primary-50/50 rounded-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{g.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{g.initial_score} → {g.current_score} / {g.target_score}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    g.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'
                  }`}>
                    {g.status === 'completed' ? 'Tamamlandı' : 'Aktiv'}
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
