'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'

const schema = z.object({
  full_name: z.string().min(2, 'Ad ən az 2 simvol'),
  email: z.string().email('Düžgün email'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Parol ən az 6 simvol'),
  role: z.enum(['patient', 'psychologist']),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'patient' }
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    try {
      await api.post('/auth/register', data)
      router.push('/login?registered=1')
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Qeydiyyat mümkün olmadı')
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
          <h1 className="text-2xl font-bold text-gray-900">Qeydiyyat</h1>
          <p className="text-gray-500 text-sm mt-1">Yeni hesab yaradın</p>
        </div>
        <div className="card">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-3 text-sm mb-4">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Ad Soyad</label>
              <input {...register('full_name')} className="input" placeholder="Aysel Məmmədova" />
              {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" className="input" placeholder="email@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="label">Telefon (istəyə bağlı)</label>
              <input {...register('phone')} className="input" placeholder="+994 50 123 45 67" />
            </div>
            <div>
              <label className="label">Parol</label>
              <input {...register('password')} type="password" className="input" placeholder="••••••••" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Rol</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 border border-gray-200 rounded-xl p-3 cursor-pointer hover:border-primary-400">
                  <input {...register('role')} type="radio" value="patient" className="text-primary-600" />
                  <span className="text-sm font-medium">Pasiyent</span>
                </label>
                <label className="flex items-center gap-2 border border-gray-200 rounded-xl p-3 cursor-pointer hover:border-primary-400">
                  <input {...register('role')} type="radio" value="psychologist" className="text-primary-600" />
                  <span className="text-sm font-medium">Psixoloq</span>
                </label>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Qeydiyyat...' : 'Qeydiyyatdan keç'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Artıq hesabınız var?{' '}
            <Link href="/login" className="text-primary-600 font-medium hover:underline">Daxil olun</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
