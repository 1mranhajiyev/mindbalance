'use client'
import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'
import api from '@/lib/api'

interface Notification {
  id: string
  title: string
  body: string
  is_read: boolean
  created_at: string
}

export default function NotificationBell() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data as Notification[]),
    refetchInterval: 30000,
  })

  const unreadCount = notifications.filter(n => !n.is_read).length

  const readMutation = useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const readAllMutation = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-lg text-primary-700 hover:bg-primary-50 transition-colors"
        aria-label="Bildirişlər"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-xl shadow-lg border border-primary-100 z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-primary-50">
            <span className="font-semibold text-sm text-gray-900">Bildirişlər</span>
            {unreadCount > 0 && (
              <button
                onClick={() => readAllMutation.mutate()}
                className="text-xs text-primary-600 hover:underline"
              >
                Hamısını oxu
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 py-6 text-center">Bildiriş yoxdur</p>
          ) : (
            <ul className="divide-y divide-primary-50">
              {notifications.slice(0, 20).map(n => (
                <li
                  key={n.id}
                  className={`px-4 py-3 cursor-pointer hover:bg-primary-50/50 transition-colors ${!n.is_read ? 'bg-primary-50/30' : ''}`}
                  onClick={() => !n.is_read && readMutation.mutate(n.id)}
                >
                  <p className="text-sm font-medium text-gray-900">{n.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {format(new Date(n.created_at), 'd MMM, HH:mm', { locale: az })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
