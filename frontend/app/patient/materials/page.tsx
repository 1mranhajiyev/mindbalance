'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, ExternalLink, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'
import api from '@/lib/api'

export default function PatientMaterialsPage() {
  const qc = useQueryClient()

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['patient-materials'],
    queryFn: () => api.get('/patient-materials').then(r => r.data),
  })

  const readMutation = useMutation({
    mutationFn: (id: string) => api.post(`/patient-materials/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patient-materials'] }),
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="page-title">Materiallar</h1>
      <p className="text-sm text-gray-500 -mt-4">Psixoloqunuzdan göndərilən materiallar</p>

      {isLoading ? (
        <p className="text-gray-400 text-sm">Yüklənilir...</p>
      ) : materials.length === 0 ? (
        <div className="card text-center py-10 text-gray-400 text-sm">Hələ material yoxdur.</div>
      ) : (
        <div className="space-y-3">
          {materials.map((m: any) => (
            <div key={m.id} className={`card flex items-start gap-4 ${!m.is_read ? 'border-primary-200 bg-primary-50/30' : ''}`}>
              <FileText size={24} className="text-primary-600 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{m.material_title}</h3>
                  {!m.is_read && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 shrink-0">Yeni</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(m.sent_at), 'd MMM yyyy', { locale: az })} · {m.file_type?.toUpperCase()}
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {m.file_url && (
                    <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs flex items-center gap-1">
                      <ExternalLink size={14} /> Aç
                    </a>
                  )}
                  {!m.is_read && (
                    <button onClick={() => readMutation.mutate(m.id)} disabled={readMutation.isPending} className="btn-primary text-xs flex items-center gap-1">
                      <CheckCircle size={14} /> Oxundu
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
