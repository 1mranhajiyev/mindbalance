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
  email: z.string().email('Düžgün email daxil edin'),
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-xl">🧠</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MindBalance</h1>
          <p className="text-gray-500 text-sm mt-1">Hesabınıza daxil olun</p>
        </div>
        <div className="card">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" className="input" placeholder="email@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Parol</label>
              <input {...register('password')} type="password" className="input" placeholder="••••••••" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            {requires2FA && (
              <div>
                <label className="label">2FA Kodu</label>
                <input {...register('totp_code')} type="text" className="input" placeholder="123456" maxLength={6} />
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Giriş edilir...' : 'Daxil ol'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Hesabınız yoxdur?{' '}
            <Link href="/register" className="text-primary-600 font-medium hover:underline">Qeydiyyat</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
