'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Brain, Pencil, Trash2, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'

const emptyForm = {
  situation: '',
  automatic_thought: '',
  emotion: '',
  intensity: 5,
  alternative_thought: '',
  cognitive_distortion: '',
}

export default function ThoughtsPage() {
  const qc = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  const { data: thoughts = [], isLoading } = useQuery({
    queryKey: ['thoughts'],
    queryFn: () => api.get('/thoughts').then(r => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: (body: typeof emptyForm & { id?: string }) => {
      if (body.id) {
        const { id, ...data } = body
        return api.patch(`/thoughts/${id}`, data)
      }
      return api.post('/thoughts', body)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['thoughts'] })
      setForm(emptyForm)
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/thoughts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['thoughts'] }),
  })

  const startEdit = (t: any) => {
    setEditingId(t.id)
    setForm({
      situation: t.situation,
      automatic_thought: t.automatic_thought,
      emotion: t.emotion,
      intensity: t.intensity,
      alternative_thought: t.alternative_thought || '',
      cognitive_distortion: t.cognitive_distortion || '',
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Brain size={24} className="text-primary-600" />
        <h1 className="page-title">Düşüncələr</h1>
      </div>
      <p className="text-sm text-gray-500 -mt-4">CBT düşüncə qeydləri — situasiya, avtomatik düşüncə və alternativ</p>

      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          {editingId ? <Pencil size={16} /> : <Plus size={16} />}
          {editingId ? 'Qeydi redaktə et' : 'Yeni qeyd'}
        </h2>
        <ApiErrorAlert error={saveMutation.error} fallback="Qeyd saxlanıla bilmədi" />
        <div className="form-group">
          <label className="label">Situasiya</label>
          <textarea value={form.situation} onChange={e => setForm(f => ({ ...f, situation: e.target.value }))} className="textarea" rows={2} />
        </div>
        <div className="form-group">
          <label className="label">Avtomatik düşüncə</label>
          <textarea value={form.automatic_thought} onChange={e => setForm(f => ({ ...f, automatic_thought: e.target.value }))} className="textarea" rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label className="label">Emosiya</label>
            <input value={form.emotion} onChange={e => setForm(f => ({ ...f, emotion: e.target.value }))} className="input" placeholder="Narahatlıq, qəzəb..." />
          </div>
          <div className="form-group">
            <label className="label">Şiddət (1-10)</label>
            <input type="number" min={1} max={10} value={form.intensity} onChange={e => setForm(f => ({ ...f, intensity: +e.target.value }))} className="input" />
          </div>
        </div>
        <div className="form-group">
          <label className="label">Alternativ düşüncə</label>
          <textarea value={form.alternative_thought} onChange={e => setForm(f => ({ ...f, alternative_thought: e.target.value }))} className="textarea" rows={2} />
        </div>
        <div className="form-group">
          <label className="label">Kognitiv distorsiya</label>
          <input value={form.cognitive_distortion} onChange={e => setForm(f => ({ ...f, cognitive_distortion: e.target.value }))} className="input" placeholder="Qara-ağ düşüncə, catastrophizing..." />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => saveMutation.mutate(editingId ? { ...form, id: editingId } : form)}
            disabled={!form.situation || !form.automatic_thought || !form.emotion || saveMutation.isPending}
            className="btn-primary"
          >
            {saveMutation.isPending ? 'Saxlanılır...' : editingId ? 'Yenilə' : 'Saxla'}
          </button>
          {editingId && (
            <button onClick={cancelEdit} className="btn-secondary">Ləğv et</button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-gray-400 text-sm">Yüklənilir...</p>}
        {!isLoading && thoughts.length === 0 && (
          <p className="text-gray-400 text-sm">Hələ düşüncə qeydi yoxdur.</p>
        )}
        {thoughts.map((t: any) => (
          <div key={t.id} className="card">
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-wrap gap-2">
                <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">{t.emotion} · {t.intensity}/10</span>
                {t.cognitive_distortion && (
                  <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">{t.cognitive_distortion}</span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs text-gray-400 mr-2">{format(new Date(t.created_at), 'd MMM, HH:mm', { locale: az })}</span>
                <button onClick={() => startEdit(t)} className="p-1.5 rounded-lg hover:bg-primary-50 text-gray-500"><Pencil size={14} /></button>
                <button onClick={() => deleteMutation.mutate(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1"><strong>Situasiya:</strong> {t.situation}</p>
            <p className="text-sm text-gray-700 mb-1"><strong>Avtomatik:</strong> {t.automatic_thought}</p>
            {t.alternative_thought && (
              <p className="text-sm text-primary-700"><strong>Alternativ:</strong> {t.alternative_thought}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
