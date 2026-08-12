'use client'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

const emotions = [
  { label: 'Xoşbəxt', emoji: '😄', value: 'xoşbəxt' },
  { label: 'Sakit', emoji: '😌', value: 'sakit' },
  { label: 'Narahat', emoji: '😟', value: 'narahat' },
  { label: 'Kədərli', emoji: '😢', value: 'kədərli' },
  { label: 'Əsəbi', emoji: '😠', value: 'əsəbi' },
  { label: 'Yorğun', emoji: '😫', value: 'yorğun' },
]

export default function CheckInCard() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState('')
  const [intensity, setIntensity] = useState(5)
  const [cause, setCause] = useState('')
  const [done, setDone] = useState(false)

  const mutation = useMutation({
    mutationFn: (data: any) => api.post('/checkins', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['checkins'] }); setDone(true) }
  })

  if (done) {
    return (
      <div className="card text-center py-8">
        <p className="text-4xl mb-3">✅</p>
        <p className="font-semibold text-gray-900">Check-in tamamlandı!</p>
        <p className="text-sm text-gray-500 mt-1">Bu günkü vəziyyətiniz qeyd edildi.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="font-semibold text-gray-900 mb-4">Bu gün özünü necə hiss edirsən?</h2>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {emotions.map(e => (
          <button
            key={e.value}
            onClick={() => setSelected(e.value)}
            className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all text-sm ${
              selected === e.value ? 'border-violet-500 bg-violet-50' : 'border-gray-100 hover:border-gray-200'
            }`}
          >
            <span className="text-2xl">{e.emoji}</span>
            <span className="text-xs text-gray-600">{e.label}</span>
          </button>
        ))}
      </div>
      {selected && (
        <>
          <div className="mb-4">
            <label className="label">Şiddət: {intensity}/10</label>
            <input type="range" min={0} max={10} value={intensity} onChange={e => setIntensity(Number(e.target.value))} className="w-full accent-violet-600" />
          </div>
          <div className="mb-4">
            <label className="label">Səbəb (istəyə bağlı)</label>
            <input value={cause} onChange={e => setCause(e.target.value)} className="input" placeholder="Bu hissin səbəbi nədir?" />
          </div>
          <button onClick={() => mutation.mutate({ emotion: selected, intensity, cause, checkin_type: 'daily' })} className="btn-primary w-full">
            Qeyd et
          </button>
        </>
      )}
    </div>
  )
}
