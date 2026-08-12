'use client'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useAuthHydrated } from '@/hooks/useAuthHydrated'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'
import { getApiErrorMessage } from '@/lib/apiErrors'
import { KeyRound, Mail, Loader2 } from 'lucide-react'
import PublicHeader from '@/components/landing/PublicHeader'
import { MindBalanceLogo } from '@/components/brand/MindBalanceLogo'

const schema = z.object({
  email: z.string().email('Düzgün email daxil edin'),
  password: z.string().min(6, 'Parol ən az 6 simvol olmalıdır'),
  totp_code: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const hydrated = useAuthHydrated()
  const { user, accessToken, setUser, setTokens } = useAuthStore()
  const [requires2FA, setRequires2FA] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    const url = new URL(window.location.href)
    if (!url.searchParams.has('email') && !url.searchParams.has('password')) return
    url.searchParams.delete('email')
    url.searchParams.delete('password')
    const clean = url.pathname + (url.search || '')
    window.history.replaceState({}, '', clean)
  }, [])

  useEffect(() => {
    if (!hydrated || !accessToken || !user) return
    router.replace(user.role === 'patient' ? '/patient/dashboard' : '/psychologist/dashboard')
  }, [hydrated, accessToken, user, router])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', data)
      if (res.data.requires_2fa) { setRequires2FA(true); return }
      setTokens(res.data.access, res.data.refresh)
      const profile = res.data.user ?? (await api.get('/auth/me')).data
      setUser(profile)
      router.push(profile.role === 'patient' ? '/patient/dashboard' : '/psychologist/dashboard')
    } catch (e: any) {
      setError(getApiErrorMessage(e, 'Giriş mümkün olmadı'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] relative">
      <PublicHeader showProfile={false} />

      <div className="auth-bg min-h-screen pt-20 pb-10">
        <div className="auth-card">
          <div className="flex flex-col items-center mb-8 animate-scale-in">
            <div className="logo-icon mb-4">
              <MindBalanceLogo size={20} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">MindBalance</h1>
            <p className="text-sm text-slate-400 mt-1">Hesabınıza daxil olun</p>
          </div>

          <ApiErrorAlert message={error} />

          <form
            method="post"
            action="/login"
            noValidate
            onSubmit={(e) => {
              e.preventDefault()
              void handleSubmit(onSubmit)(e)
            }}
            className="space-y-4"
          >
            <div className="form-group">
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input {...register('email')} type="email" className="input pl-9" placeholder="email@example.com" autoComplete="email" />
              </div>
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label className="label">Parol</label>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input {...register('password')} type="password" className="input pl-9" placeholder="••••••••" autoComplete="current-password" />
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            {requires2FA && (
              <div className="form-group">
                <label className="label">2FA Kodu</label>
                <input {...register('totp_code')} type="text" className="input tracking-widest text-center" placeholder="— — — — — —" maxLength={6} />
              </div>
            )}

            <div className="space-y-3 pt-1">
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <><Loader2 size={15} className="animate-spin" /> Giriş edilir...</> : 'Daxil ol'}
              </button>
              <Link href="/register" className="btn-secondary w-full text-center">
                Qeydiyyat
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
