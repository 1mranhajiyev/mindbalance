'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save } from 'lucide-react'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'
import { getApiErrorMessage } from '@/lib/apiErrors'
import { useAuthStore } from '@/store/auth'

const patientSchema = z.object({
  full_name: z.string().min(2, 'Ad ən az 2 simvol olmalıdır'),
  phone: z.string().optional(),
  profile: z.object({
    age: z.union([z.coerce.number().min(1).max(120), z.literal('')]).optional(),
    birth_date: z.string().optional(),
  }),
})

const psychologistSchema = z.object({
  full_name: z.string().min(2, 'Ad ən az 2 simvol olmalıdır'),
  phone: z.string().optional(),
  profile: z.object({
    license_number: z.string().optional(),
    specialization: z.string().optional(),
    bio: z.string().optional(),
    session_price: z.union([z.coerce.number().min(0), z.literal('')]).optional(),
    experience_years: z.union([z.coerce.number().min(0), z.literal('')]).optional(),
    languages: z.string().optional(),
    is_accepting_patients: z.boolean(),
  }),
})

type PatientFormData = z.infer<typeof patientSchema>
type PsychologistFormData = z.infer<typeof psychologistSchema>

const onboardingLabels: Record<string, string> = {
  not_started: 'Başlanmayıb',
  assessment_done: 'Qiymətləndirmə tamamlandı',
  psychologist_selected: 'Psixoloq seçildi',
  completed: 'Tamamlandı',
}

interface Props {
  role: 'patient' | 'psychologist'
}

export default function ProfileEditor({ role }: Props) {
  const qc = useQueryClient()
  const { setUser } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/auth/me/profile').then(r => r.data),
  })

  const isPatient = role === 'patient'
  const schema = isPatient ? patientSchema : psychologistSchema

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<
    PatientFormData | PsychologistFormData
  >({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!data) return
    if (isPatient) {
      reset({
        full_name: data.full_name || '',
        phone: data.phone || '',
        profile: {
          age: data.profile?.age ?? '',
          birth_date: data.profile?.birth_date || '',
        },
      })
    } else {
      reset({
        full_name: data.full_name || '',
        phone: data.phone || '',
        profile: {
          license_number: data.profile?.license_number || '',
          specialization: data.profile?.specialization || '',
          bio: data.profile?.bio || '',
          session_price: data.profile?.session_price ?? '',
          experience_years: data.profile?.experience_years ?? '',
          languages: data.profile?.languages || '',
          is_accepting_patients: data.profile?.is_accepting_patients ?? true,
        },
      })
    }
  }, [data, isPatient, reset])

  const mutation = useMutation({
    mutationFn: (formData: PatientFormData | PsychologistFormData) => {
      const payload: Record<string, unknown> = {
        full_name: formData.full_name,
        phone: formData.phone || '',
      }

      if (isPatient) {
        const p = formData as PatientFormData
        payload.profile = {
          age: p.profile.age === '' || p.profile.age === undefined ? null : p.profile.age,
          birth_date: p.profile.birth_date || null,
        }
      } else {
        const p = formData as PsychologistFormData
        payload.profile = {
          license_number: p.profile.license_number || null,
          specialization: p.profile.specialization || null,
          bio: p.profile.bio || null,
          session_price: p.profile.session_price === '' || p.profile.session_price === undefined
            ? null
            : p.profile.session_price,
          experience_years: p.profile.experience_years === '' || p.profile.experience_years === undefined
            ? null
            : p.profile.experience_years,
          languages: p.profile.languages || null,
          is_accepting_patients: p.profile.is_accepting_patients,
        }
      }

      return api.patch('/auth/me/profile', payload).then(r => r.data)
    },
    onSuccess: (updated) => {
      setUser({
        id: updated.id,
        full_name: updated.full_name,
        email: updated.email,
        role: updated.role,
        phone: updated.phone,
        totp_enabled: updated.totp_enabled,
      })
      qc.setQueryData(['profile'], updated)
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
        <Loader2 size={18} className="animate-spin mr-2" />
        Yüklənilir...
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profil</h1>
        <p className="text-gray-500 mt-1">Şəxsi məlumatlarınızı yeniləyin</p>
      </div>

      <ApiErrorAlert
        message={mutation.error ? getApiErrorMessage(mutation.error, 'Profil yenilənə bilmədi') : ''}
      />

      {mutation.isSuccess && (
        <div className="rounded-lg bg-green-50 text-green-700 text-sm px-4 py-3">
          Profil uğurla yeniləndi.
        </div>
      )}

      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="card space-y-6">
        <section className="space-y-4">
          <h2 className="font-semibold text-gray-900">Əsas məlumatlar</h2>

          <div className="form-group">
            <label className="label">Ad Soyad</label>
            <input {...register('full_name')} className="input" />
            {errors.full_name && <p className="form-error">{errors.full_name.message}</p>}
          </div>

          <div className="form-group">
            <label className="label">Email</label>
            <input value={data?.email || ''} className="input bg-slate-50" disabled readOnly />
          </div>

          <div className="form-group">
            <label className="label">Telefon</label>
            <input {...register('phone')} className="input" placeholder="+994 50 123 45 67" />
          </div>
        </section>

        {isPatient ? (
          <section className="space-y-4">
            <h2 className="font-semibold text-gray-900">Pasiyent məlumatları</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Yaş</label>
                <input {...register('profile.age')} type="number" className="input" min={1} max={120} />
              </div>
              <div className="form-group">
                <label className="label">Doğum tarixi</label>
                <input {...register('profile.birth_date')} type="date" className="input" />
              </div>
            </div>

            {data?.profile?.therapy_start_date && (
              <p className="text-sm text-slate-500">
                Terapiya başlanğıcı: {data.profile.therapy_start_date}
              </p>
            )}
            {data?.profile?.onboarding_status && (
              <p className="text-sm text-slate-500">
                Onboarding: {onboardingLabels[data.profile.onboarding_status] || data.profile.onboarding_status}
              </p>
            )}
          </section>
        ) : (
          <section className="space-y-4">
            <h2 className="font-semibold text-gray-900">Peşəkar məlumatlar</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Lisenziya nömrəsi</label>
                <input {...register('profile.license_number')} className="input" />
              </div>
              <div className="form-group">
                <label className="label">İxtisas</label>
                <input {...register('profile.specialization')} className="input" placeholder="Məs. Klinik psixologiya" />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Bio</label>
              <textarea {...register('profile.bio')} className="textarea" rows={4} placeholder="Qısa peşəkar təqdimat..." />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label">Seans qiyməti (AZN)</label>
                <input {...register('profile.session_price')} type="number" className="input" min={0} />
              </div>
              <div className="form-group">
                <label className="label">Təcrübə (il)</label>
                <input {...register('profile.experience_years')} type="number" className="input" min={0} />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Dillər</label>
              <input {...register('profile.languages')} className="input" placeholder="Azərbaycan, İngilis" />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input {...register('profile.is_accepting_patients')} type="checkbox" className="w-4 h-4 rounded border-slate-300" />
              <span className="text-sm text-gray-700">Yeni pasiyent qəbul edirəm</span>
            </label>
          </section>
        )}

        <button
          type="submit"
          disabled={mutation.isPending || !isDirty}
          className="btn-primary flex items-center justify-center gap-2"
        >
          {mutation.isPending ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Saxlanılır...
            </>
          ) : (
            <>
              <Save size={16} />
              Dəyişiklikləri saxla
            </>
          )}
        </button>
      </form>
    </div>
  )
}
