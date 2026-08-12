'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'
import { getApiErrorMessage } from '@/lib/apiErrors'
import { User, BriefcaseMedical, Loader2 } from 'lucide-react'

const schema = z.object({
  full_name: z.string().min(2, 'Ad ən az 2 simvol olmalıdır'),
  email: z.string().email('Düzgün email daxil edin'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Parol ən az 6 simvol olmalıdır'),
  role: z.enum(['patient', 'psychologist']),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'patient' | 'psychologist'>('patient')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
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
      setError(getApiErrorMessage(e, 'Qeydiyyat mümkün olmadı'))
    } finally {
      setLoading(false)
    }
  }

  const handleRoleSelect = (role: 'patient' | 'psychologist') => {
    setSelectedRole(role)
    setValue('role', role)
  }

  return (
    <div className="auth-bg">
      <div className="auth-card max-w-[460px]">
        <div className="flex flex-col items-center mb-8 animate-scale-in">
          <div className="logo-icon mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26A7 7 0 0 0 12 2z"/>
              <line x1="9" y1="21" x2="15" y2="21"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Qeydiyyat</h1>
          <p className="text-sm text-slate-400 mt-1">Yeni hesab yaradın</p>
        </div>

        <ApiErrorAlert message={error} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="form-group">
            <label className="label">Ad Soyad</label>
            <input {...register('full_name')} className="input" placeholder="Ayşel Məmmədova" />
            {errors.full_name && <p className="form-error">{errors.full_name.message}</p>}
          </div>

          <div className="form-group">
            <label className="label">Email</label>
            <input {...register('email')} type="email" className="input" placeholder="email@example.com" />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="label">Telefon <span className="text-slate-400 font-normal">(istəyə bağlı)</span></label>
            <input {...register('phone')} className="input" placeholder="+994 50 123 45 67" />
          </div>

          <div className="form-group">
            <label className="label">Parol</label>
            <input {...register('password')} type="password" className="input" placeholder="••••••••" />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          {/* Role selector */}
          <div className="form-group">
            <label className="label">Rol seçin</label>
            <div className="grid grid-cols-2 gap-3">
              {(['patient', 'psychologist'] as const).map((role) => {
                const Icon = role === 'patient' ? User : BriefcaseMedical
                const active = selectedRole === role
                return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all ${
                    active
                      ? 'border-2 border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-primary-200'
                  }`}
                >
                  <Icon size={22} strokeWidth={active ? 2.25 : 2} className={active ? 'text-primary-600' : 'text-slate-400'} />
                  {role === 'patient' ? 'Pasiyent' : 'Psixoloq'}
                </button>
              )})}
            </div>
            <input type="hidden" {...register('role')} value={selectedRole} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? (
              <><Loader2 size={15} className="animate-spin" /> Qeydiyyat...</>
            ) : 'Qeydiyyatdan keç'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-6">
          Artıq hesabınız var?{' '}
          <Link href="/login" className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">Daxil olun</Link>
        </p>
      </div>
    </div>
  )
}
