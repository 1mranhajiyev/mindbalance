'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Map, Trophy, BookOpen, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'

type Tab = 'timeline' | 'achievements' | 'learnings'

export default function TimelinePage() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('timeline')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [content, setContent] = useState('')

  const tabs = [
    { id: 'timeline' as Tab, label: 'Xəritə', icon: Map },
    { id: 'achievements' as Tab, label: 'Nailiyyətlər', icon: Trophy },
    { id: 'learnings' as Tab, label: 'Öyrənilənlər', icon: BookOpen },
  ]

  const { data: timeline = [] } = useQuery({
    queryKey: ['wellness-timeline'],
    queryFn: () => api.get('/wellness/timeline').then(r => r.data),
    enabled: tab === 'timeline',
  })

  const { data: achievements = [] } = useQuery({
    queryKey: ['wellness-achievements'],
    queryFn: () => api.get('/wellness/achievements').then(r => r.data),
    enabled: tab === 'achievements',
  })

  const { data: learnings = [] } = useQuery({
    queryKey: ['wellness-learnings'],
    queryFn: () => api.get('/wellness/learnings').then(r => r.data),
    enabled: tab === 'learnings',
  })

  const createMutation = useMutation({
    mutationFn: (body: Record<string, string>) => {
      if (tab === 'timeline') return api.post('/wellness/timeline', body)
      if (tab === 'achievements') return api.post('/wellness/achievements', body)
      return api.post('/wellness/learnings', body)
    },
    onSuccess: () => {
      const key = tab === 'timeline' ? 'wellness-timeline' : tab === 'achievements' ? 'wellness-achievements' : 'wellness-learnings'
      qc.invalidateQueries({ queryKey: [key] })
      setTitle('')
      setDescription('')
      setEventDate('')
      setContent('')
    },
  })

  const handleCreate = () => {
    if (tab === 'timeline') {
      createMutation.mutate({ title, description, event_date: eventDate || new Date().toISOString().slice(0, 10) })
    } else if (tab === 'achievements') {
      createMutation.mutate({ title, description, achieved_at: eventDate || new Date().toISOString().slice(0, 10) })
    } else {
      createMutation.mutate({ title, content: content || description })
    }
  }

  const items = tab === 'timeline' ? timeline : tab === 'achievements' ? achievements : learnings

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="page-title">Terapiya xəritəsi</h1>

      <div className="flex gap-1 p-1 bg-primary-50 rounded-xl">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              tab === id ? 'bg-white text-primary-700 shadow-sm' : 'text-gray-500 hover:text-primary-600'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <div className="card space-y-3">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Plus size={16} /> Yeni əlavə et</h2>
        <ApiErrorAlert error={createMutation.error} fallback="Saxlanıla bilmədi" />
        <input value={title} onChange={e => setTitle(e.target.value)} className="input" placeholder="Başlıq" />
        {tab === 'learnings' ? (
          <textarea value={content} onChange={e => setContent(e.target.value)} className="textarea" rows={3} placeholder="Məzmun" />
        ) : (
          <>
            <textarea value={description} onChange={e => setDescription(e.target.value)} className="textarea" rows={2} placeholder="Təsvir" />
            <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} className="input" />
          </>
        )}
        <button onClick={handleCreate} disabled={!title || createMutation.isPending} className="btn-primary">
          {createMutation.isPending ? 'Saxlanılır...' : 'Saxla'}
        </button>
      </div>

      <div className="space-y-3">
        {items.length === 0 && <p className="text-gray-400 text-sm">Hələ qeyd yoxdur.</p>}
        {tab === 'timeline' && timeline.map((e: any) => (
          <div key={e.id} className="card border-l-4 border-primary-500">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-gray-900">{e.title}</h3>
              <span className="text-xs text-gray-400">{format(new Date(e.event_date), 'd MMM yyyy', { locale: az })}</span>
            </div>
            {e.description && <p className="text-sm text-gray-600 mt-1">{e.description}</p>}
          </div>
        ))}
        {tab === 'achievements' && achievements.map((a: any) => (
          <div key={a.id} className="card flex gap-3">
            <Trophy size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900">{a.title}</h3>
              {a.description && <p className="text-sm text-gray-600 mt-1">{a.description}</p>}
              {a.achieved_at && (
                <p className="text-xs text-gray-400 mt-1">{format(new Date(a.achieved_at), 'd MMM yyyy', { locale: az })}</p>
              )}
            </div>
          </div>
        ))}
        {tab === 'learnings' && learnings.map((l: any) => (
          <div key={l.id} className="card">
            <h3 className="font-semibold text-gray-900">{l.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{l.content}</p>
            <p className="text-xs text-gray-400 mt-2">{format(new Date(l.created_at), 'd MMM yyyy', { locale: az })}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
