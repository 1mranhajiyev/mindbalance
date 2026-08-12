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
      <div className="auth-card" style={{ maxWidth: 460 }}>
        {/* Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div className="logo-icon" style={{ marginBottom: '1rem' }}>🧠</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>Qeydiyyat</h1>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Yeni hesab yaratın</p>
        </div>

        <ApiErrorAlert message={error} />

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
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
            <label className="label">Telefon <span style={{ color: '#9ca3af', fontWeight: 400 }}>(istəyə bağlı)</span></label>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {(['patient', 'psychologist'] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    border: selectedRole === role ? '2px solid #7c3aed' : '1.5px solid #e5e7eb',
                    background: selectedRole === role ? '#f5f3ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 180ms ease',
                    color: selectedRole === role ? '#7c3aed' : '#374151',
                    fontWeight: selectedRole === role ? 600 : 500,
                    fontSize: '0.875rem',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{role === 'patient' ? '👤' : '👨‍⚕️'}</span>
                  {role === 'patient' ? 'Pasiyent' : 'Psixoloq'}
                </button>
              ))}
            </div>
            <input type="hidden" {...register('role')} value={selectedRole} />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}></span> Qeydiyyat...</>
            ) : 'Qeydiyyatdan keç'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', marginTop: '1.5rem' }}>
          Artıq hesabınız var?{' '}
          <Link href="/login" style={{ color: '#7c3aed', fontWeight: 600, textDecoration: 'none' }}>Daxil olun</Link>
        </p>
      </div>
    </div>
  )
}
