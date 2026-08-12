'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useQueryClient } from '@tanstack/react-query'
import { Home, BookOpen, Calendar, TrendingUp, CheckSquare, LogOut, Users, UserCircle } from 'lucide-react'
import { SidebarNav } from '@/components/layout/SidebarNav'

const navItems = [
  { href: '/patient/dashboard', label: 'Ana Səhifə', icon: Home },
  { href: '/patient/psychologists', label: 'Psixoloqlarım', icon: Users },
  { href: '/patient/journal', label: 'Gündəliyim', icon: BookOpen },
  { href: '/patient/sessions', label: 'Seanslar', icon: Calendar },
  { href: '/patient/progress', label: 'İnkişaf', icon: TrendingUp },
  { href: '/patient/tasks', label: 'Tapşırıqlar', icon: CheckSquare },
  { href: '/patient/profile', label: 'Profil', icon: UserCircle },
]

interface Props {
  onNavigate?: () => void
}

export default function PatientSidebar({ onNavigate }: Props) {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const qc = useQueryClient()

  const handleLogout = () => {
    qc.clear()
    logout()
    router.push('/login')
  }

  const initials = user?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'P'

  return (
    <aside className="sidebar">
      <div className="px-2 py-1 border-b border-primary-100 pb-4 mb-1">
        <div className="flex items-center gap-3">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26A7 7 0 0 0 12 2z"/>
              <line x1="9" y1="21" x2="15" y2="21"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm tracking-tight">MindBalance</p>
            <p className="text-xs text-primary-600/70">Pasiyent paneli</p>
          </div>
        </div>
      </div>
      <SidebarNav items={navItems} onNavigate={onNavigate} />
      <div className="px-2 py-3 border-t border-primary-100 space-y-1 mt-auto">
        <Link
          href="/patient/profile"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-50 transition-all duration-200"
        >
          <div className="avatar avatar-sm">{initials}</div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">{user?.full_name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-primary-50 hover:text-primary-700 w-full transition-all duration-200"
        >
          <LogOut size={16} />
          Çıxış
        </button>
      </div>
    </aside>
  )
}
