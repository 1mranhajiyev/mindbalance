'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/auth'
import api from '@/lib/api'

export default function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuthStore()

  const { data: status, isLoading } = useQuery({
    queryKey: ['onboarding-status'],
    queryFn: () => api.get('/onboarding/status').then(r => r.data),
    enabled: !!user && user.role === 'patient',
    staleTime: 30_000,
    retry: 1,
  })

  useEffect(() => {
    if (!user || user.role !== 'patient') return
    if (isLoading) return

    const isOnboardingPage = pathname === '/patient/onboarding'
    const onboardingStatus = status?.onboarding_status ?? 'not_started'

    if (onboardingStatus !== 'completed' && !isOnboardingPage) {
      router.replace('/patient/onboarding')
    }
  }, [status, isLoading, pathname, router, user])

  if (user?.role === 'patient' && isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Yoxlanılır...</div>
      </div>
    )
  }

  return <>{children}</>
}
