'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useAuthHydrated } from '@/hooks/useAuthHydrated'
import { MindBalanceLogo } from '@/components/brand/MindBalanceLogo'
import PublicHeader from '@/components/landing/PublicHeader'

export default function LandingPage() {
  const router = useRouter()
  const hydrated = useAuthHydrated()
  const { user, accessToken } = useAuthStore()

  useEffect(() => {
    if (!hydrated || !accessToken || !user) return
    router.replace(user.role === 'patient' ? '/patient/dashboard' : '/psychologist/dashboard')
  }, [hydrated, accessToken, user, router])

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="spinner w-7 h-7 border-[3px]" />
      </div>
    )
  }

  if (accessToken && user) return null

  return (
    <div className="min-h-screen bg-[#f7faf8] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full bg-primary-200/25 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[480px] h-[480px] rounded-full bg-primary-100/35 blur-3xl" />
      </div>

      <PublicHeader />

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-16 pb-12">
        <div className="text-center max-w-md animate-fade-in-up">
          <div className="logo-icon mx-auto mb-8 w-[72px] h-[72px] rounded-2xl shadow-glow">
            <MindBalanceLogo size={32} />
          </div>

          <h1 className="text-[2rem] sm:text-[2.25rem] font-bold text-slate-900 tracking-tight mb-3">
            MindBalance
          </h1>
          <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-10">
            Sənin rifahın, bizim prioritetimiz
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-sm mx-auto">
            <Link href="/login" className="btn-primary px-10 py-3 text-center min-w-[140px]">
              Daxil ol
            </Link>
            <Link href="/register" className="btn-secondary px-10 py-3 text-center min-w-[140px]">
              Qeydiyyat
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
