'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'
import { KeyRound, Mail, Loader2 } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Düzgün email daxil edin'),
  password: z.string().min(6, 'Parol ən az 6 simvol olmalıdır'),
  totp_code: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { setUser, setTokens } = useAuthStore()
  const [requires2FA, setRequires2FA] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', data)
      if (res.data.requires_2fa) { setRequires2FA(true); return }
      setTokens(res.data.access_token, res.data.refresh_token)
      const me = await api.get('/auth/me')
      setUser(me.data)
      router.push(me.data.role === 'patient' ? '/patient/dashboard' : '/psychologist/dashboard')
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Giriş mümkün olmadı')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-bg">
      <div className="auth-card">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="logo-icon mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26A7 7 0 0 0 12 2z"/>
              <line x1="9" y1="21" x2="15" y2="21"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">MindBalance</h1>
          <p className="text-sm text-slate-400 mt-1">Hesabınıza daxil olun</p>
        </div>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label className="label">Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input {...register('email')} type="email" className="input pl-9" placeholder="email@example.com" />
            </div>
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="label">Parol</label>
            <div className="relative">
              <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input {...register('password')} type="password" className="input pl-9" placeholder="••••••••" />
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          {requires2FA && (
            <div className="form-group">
              <label className="label">2FA Kodu</label>
              <input {...register('totp_code')} type="text" className="input tracking-widest text-center" placeholder="— — — — — —" maxLength={6} />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? <><Loader2 size={15} className="animate-spin" /> Giriş edilir...</> : 'Daxil ol'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Hesabınız yoxdur?{' '}
          <Link href="/register" className="text-indigo-600 font-semibold hover:text-indigo-700">
            Qeydiyyat
          </Link>
        </p>
      </div>
    </div>
  )
}
