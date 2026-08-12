'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'

export default function JournalPage() {
  const qc = useQueryClient()
  const [content, setContent] = useState('')
  const [emotion, setEmotion] = useState('')
  const [event, setEvent] = useState('')

  const { data: entries = [] } = useQuery({
    queryKey: ['journal'],
    queryFn: () => api.get('/notes/journal').then(r => r.data)
  })

  const mutation = useMutation({
    mutationFn: (body: any) => api.post('/notes/journal', body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['journal'] }); setContent(''); setEmotion(''); setEvent('') }
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">📖 Gündəliyim</h1>
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">Yeni qeyd</h2>
        <ApiErrorAlert error={mutation.error} fallback="Qeyd saxlanıla bilmədi" />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Hiss</label>
            <input value={emotion} onChange={e => setEmotion(e.target.value)} className="input" placeholder="Narahat, xoşbəxt..." />
          </div>
          <div>
            <label className="label">Hadisə</label>
            <input value={event} onChange={e => setEvent(e.target.value)} className="input" placeholder="Bu gün nə oldu?" />
          </div>
        </div>
        <div>
          <label className="label">Qeydim</label>
          <textarea value={content} onChange={e => setContent(e.target.value)} className="input min-h-28 resize-none" placeholder="Bu gün..." />
        </div>
        <button onClick={() => mutation.mutate({ content, emotion, event, is_private: true })} disabled={!content || mutation.isPending} className="btn-primary">
          {mutation.isPending ? 'Saxlanılır...' : 'Saxla'}
        </button>
      </div>
      <div className="space-y-3">
        {entries.map((e: any) => (
          <div key={e.id} className="card">
            <div className="flex justify-between items-start mb-2">
              <div className="flex gap-2">
                {e.emotion && <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">{e.emotion}</span>}
                {e.event && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{e.event}</span>}
              </div>
              <span className="text-xs text-gray-400">{format(new Date(e.created_at), 'd MMM, HH:mm', { locale: az })}</span>
            </div>
            <p className="text-gray-700 text-sm">{e.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
