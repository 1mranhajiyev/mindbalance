'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useQueryClient } from '@tanstack/react-query'

interface Props {
  children: React.ReactNode
  requiredRole?: 'patient' | 'psychologist'
}

export default function AuthGuard({ children, requiredRole }: Props) {
  const router = useRouter()
  const { user, accessToken, logout } = useAuthStore()
  const qc = useQueryClient()

  useEffect(() => {
    // Not logged in at all
    if (!accessToken || !user) {
      router.replace('/login')
      return
    }
    // Wrong role — kick out and clear everything
    if (requiredRole && user.role !== requiredRole) {
      qc.clear()
      logout()
      router.replace('/login')
    }
  }, [accessToken, user, requiredRole, router, qc, logout])

  if (!accessToken || !user) return null
  if (requiredRole && user.role !== requiredRole) return null

  return <>{children}</>
}
