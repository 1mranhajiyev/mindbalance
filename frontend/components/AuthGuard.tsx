'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthHydrated } from '@/hooks/useAuthHydrated'
import api from '@/lib/api'

interface Props {
  children: React.ReactNode
  requiredRole?: 'patient' | 'psychologist'
}

export default function AuthGuard({ children, requiredRole }: Props) {
  const router = useRouter()
  const hydrated = useAuthHydrated()
  const { user, accessToken, setUser, logout } = useAuthStore()
  const qc = useQueryClient()
  const [isValidating, setIsValidating] = useState(true)

  useEffect(() => {
    if (!hydrated) return

    let cancelled = false

    async function validateSession() {
      if (!accessToken) {
        router.replace('/login')
        setIsValidating(false)
        return
      }

      try {
        const { data } = await api.get('/auth/me')
        if (cancelled) return

        setUser(data)

        if (requiredRole && data.role !== requiredRole) {
          qc.clear()
          logout()
          router.replace('/login')
          return
        }
      } catch {
        if (cancelled) return
        qc.clear()
        logout()
        router.replace('/login')
        return
      } finally {
        if (!cancelled) setIsValidating(false)
      }
    }

    validateSession()

    return () => {
      cancelled = true
    }
  }, [hydrated, accessToken, requiredRole, router, qc, logout, setUser])

  if (!hydrated || isValidating || !accessToken || !user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="spinner w-8 h-8 border-[3px]" />
          <p className="text-slate-400 text-sm">Yoxlanılır...</p>
        </div>
      </div>
    )
  }

  if (requiredRole && user.role !== requiredRole) return null

  return <>{children}</>
}
