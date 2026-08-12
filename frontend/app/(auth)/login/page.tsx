'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'

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
      if (res.data.requires_2fa) {
        setRequires2FA(true)
        return
      }
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div className="logo-icon" style={{ marginBottom: '1rem' }}>🧠</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>MindBalance</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Hesabınıza daxil olun</p>
        </div>

        {/* Error */}
        {error && <div className="alert-error">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="label">Email</label>
            <input {...register('email')} type="email" className="input" placeholder="email@example.com" />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="label">Parol</label>
            <input {...register('password')} type="password" className="input" placeholder="••••••••" />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          {requires2FA && (
            <div className="form-group">
              <label className="label">2FA Kodu</label>
              <input {...register('totp_code')} type="text" className="input" placeholder="123456" maxLength={6} />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
            {loading ? (
              <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }}></span> Giriş edilir...</>
            ) : 'Daxil ol'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', marginTop: '1.5rem' }}>
          Hesabınız yoxdur?{' '}
          <Link href="/register" style={{ color: '#7c3aed', fontWeight: 600, textDecoration: 'none' }}>
            Qeydiyyat
          </Link>
        </p>
      </div>
    </div>
  )
}
