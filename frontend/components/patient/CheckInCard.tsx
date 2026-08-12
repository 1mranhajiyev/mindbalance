'use client'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'
import { Smile, Cloud, AlertCircle, CloudRain, Zap, Battery } from 'lucide-react'
import { CheckCircle2 } from 'lucide-react'

const emotions = [
  { label: 'Xoşbəxt',  value: 'xoşbəxt',  icon: Smile,        color: 'text-emerald-500', activeBg: 'bg-emerald-50 border-emerald-400' },
  { label: 'Sakit',   value: 'sakit',   icon: Cloud,        color: 'text-sky-500',     activeBg: 'bg-sky-50 border-sky-400'         },
  { label: 'Narahat', value: 'narahat', icon: AlertCircle,  color: 'text-amber-500',   activeBg: 'bg-amber-50 border-amber-400'     },
  { label: 'Kədərli', value: 'kədərli', icon: CloudRain,    color: 'text-blue-400',    activeBg: 'bg-blue-50 border-blue-400'       },
  { label: 'Əsəbi',   value: 'əsəbi',   icon: Zap,          color: 'text-red-500',     activeBg: 'bg-red-50 border-red-400'         },
  { label: 'Yorğun',  value: 'yorğun',  icon: Battery,      color: 'text-slate-400',   activeBg: 'bg-slate-50 border-slate-400'     },
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
      <div className="card flex flex-col items-center py-10 gap-3">
        <CheckCircle2 size={40} className="text-emerald-500" strokeWidth={1.5} />
        <p className="font-semibold text-slate-900">Check-in tamamlandı!</p>
        <p className="text-sm text-slate-400">Bugünkü vəziyyətiniz qeyd edildi.</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wide">Bugünkü vəziyyət</h2>
      <ApiErrorAlert error={mutation.error} fallback="Check-in saxlanıla bilmədi" />
      <div className="grid grid-cols-3 gap-2 mb-5">
        {emotions.map(({ label, value, icon: Icon, color, activeBg }) => {
          const active = selected === value
          return (
            <button
              key={value}
              onClick={() => setSelected(value)}
              className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${
                active
                  ? `${activeBg} border-2`
                  : 'border border-slate-100 hover:border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon size={22} className={active ? color : 'text-slate-400'} strokeWidth={1.75} />
              <span className={`text-xs font-medium ${ active ? 'text-slate-800' : 'text-slate-500' }`}>{label}</span>
            </button>
          )
        })}
      </div>

      {selected && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="label mb-0">Şiddət</label>
              <span className="text-xs font-semibold text-primary-600 tabular-nums">{intensity} / 10</span>
            </div>
            <input
              type="range" min={0} max={10} value={intensity}
              onChange={e => setIntensity(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-slate-100 accent-primary-600 cursor-pointer"
            />
          </div>
          <div>
            <label className="label">Səbəb <span className="text-slate-400 font-normal">(istəyə bağlı)</span></label>
            <input value={cause} onChange={e => setCause(e.target.value)} className="input" placeholder="Bu hissin səbəbi nədir?" />
          </div>
          <button
            onClick={() => mutation.mutate({ emotion: selected, intensity, cause, checkin_type: 'daily' })}
            disabled={mutation.isPending}
            className="btn-primary w-full"
          >
            {mutation.isPending ? 'Saxlanılır...' : 'Qeyd et'}
          </button>
        </div>
      )}
    </div>
  )
}
