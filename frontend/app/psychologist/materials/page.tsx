'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Upload, Send, FileText } from 'lucide-react'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'

export default function PsychologistMaterialsPage() {
  const qc = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [fileType, setFileType] = useState('pdf')
  const [file, setFile] = useState<File | null>(null)
  const [assignPatient, setAssignPatient] = useState<Record<string, string>>({})

  const { data: materials = [] } = useQuery({
    queryKey: ['materials'],
    queryFn: () => api.get('/materials').then(r => r.data),
  })

  const { data: patients = [] } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get('/patients').then(r => r.data),
  })

  const uploadMutation = useMutation({
    mutationFn: () => {
      const fd = new FormData()
      fd.append('title', title)
      if (description) fd.append('description', description)
      fd.append('file_type', fileType)
      if (file) fd.append('file', file)
      return api.post('/materials', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['materials'] })
      setTitle('')
      setDescription('')
      setFile(null)
    },
  })

  const assignMutation = useMutation({
    mutationFn: ({ materialId, patientId }: { materialId: string; patientId: string }) =>
      api.post(`/materials/${materialId}/assign`, { patient_id: patientId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['materials'] }),
  })

  return (
    <div className="space-y-6">
      <h1 className="page-title">Materiallar</h1>

      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Upload size={16} /> Material yüklə</h2>
        <ApiErrorAlert error={uploadMutation.error} fallback="Material yüklənə bilmədi" />
        <input value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="Başlıq" />
        <textarea value={description} onChange={e => setDescription(e.target.value)} className="textarea" rows={2} placeholder="Təsvir" />
        <select value={fileType} onChange={e => setFileType(e.target.value)} className="select">
          <option value="pdf">PDF</option>
          <option value="audio">Audio</option>
          <option value="video">Video</option>
          <option value="other">Digər</option>
        </select>
        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="input" />
        <button
          onClick={() => uploadMutation.mutate()}
          disabled={!title || !file || uploadMutation.isPending}
          className="btn-primary"
        >
          {uploadMutation.isPending ? 'Yüklənir...' : 'Yüklə'}
        </button>
      </div>

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Materiallarım</h2>
        <ApiErrorAlert error={assignMutation.error} fallback="Təyin edilə bilmədi" />
        {materials.length === 0 ? (
          <p className="text-gray-400 text-sm">Material yoxdur.</p>
        ) : (
          <div className="space-y-4">
            {materials.map((m: any) => (
              <div key={m.id} className="p-3 bg-gray-50 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <FileText size={20} className="text-primary-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{m.title}</p>
                    <p className="text-xs text-gray-400">{m.file_type?.toUpperCase()} · {format(new Date(m.created_at), 'd MMM yyyy', { locale: az })}</p>
                    {m.file_url && (
                      <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline mt-1 inline-block">Faylı aç</a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={assignPatient[m.id] || ''}
                    onChange={e => setAssignPatient(s => ({ ...s, [m.id]: e.target.value }))}
                    className="select flex-1 text-sm"
                  >
                    <option value="">Pasiyentə göndər...</option>
                    {patients.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.full_name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => assignMutation.mutate({ materialId: m.id, patientId: assignPatient[m.id] })}
                    disabled={!assignPatient[m.id] || assignMutation.isPending}
                    className="btn-primary text-sm flex items-center gap-1 shrink-0"
                  >
                    <Send size={14} /> Göndər
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
