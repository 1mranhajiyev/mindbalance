'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useQueryClient } from '@tanstack/react-query'
import { LayoutDashboard, Users, Calendar, ClipboardList, BookOpen, BarChart2, CreditCard, LogOut, Inbox, UserCircle, Target, FileText } from 'lucide-react'
import { SidebarNav } from '@/components/layout/SidebarNav'

const navItems = [
  { href: '/psychologist/dashboard',  label: 'Dashboard',      icon: LayoutDashboard },
  { href: '/psychologist/requests',   label: 'Müraciətlər',    icon: Inbox },
  { href: '/psychologist/patients',   label: 'Pasiyentlər',    icon: Users },
  { href: '/psychologist/sessions',   label: 'Seanslar',       icon: Calendar },
  { href: '/psychologist/tasks',      label: 'Tapşırıqlar',    icon: ClipboardList },
  { href: '/psychologist/goals',      label: 'Məqsədlər',      icon: Target },
  { href: '/psychologist/materials',  label: 'Materiallar',    icon: FileText },
  { href: '/psychologist/notes',        label: 'Qeydlər',        icon: BookOpen },
  { href: '/psychologist/statistics', label: 'Statistika',     icon: BarChart2 },
  { href: '/psychologist/payments',   label: 'Ödənişlər',      icon: CreditCard },
  { href: '/psychologist/profile',    label: 'Profil',         icon: UserCircle },
]

interface Props {
  onNavigate?: () => void
}

export default function PsychologistSidebar({ onNavigate }: Props) {
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const qc = useQueryClient()

  const handleLogout = () => {
    qc.clear()
    logout()
    router.push('/')
  }

  const initials = user?.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'P'

  return (
    <aside className="sidebar">
      <div className="px-2 py-1 border-b border-primary-100 pb-4 mb-1">
        <Link href="/psychologist/dashboard" onClick={onNavigate} className="flex items-center gap-3 rounded-lg hover:opacity-90 transition-opacity">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26A7 7 0 0 0 12 2z"/>
              <line x1="9" y1="21" x2="15" y2="21"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm tracking-tight">MindBalance</p>
            <p className="text-xs text-primary-600/70">Psixoloq paneli</p>
          </div>
        </Link>
      </div>
      <SidebarNav items={navItems} onNavigate={onNavigate} />
      <div className="px-2 py-3 border-t border-primary-100 space-y-1 mt-auto">
        <Link
          href="/psychologist/profile"
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
