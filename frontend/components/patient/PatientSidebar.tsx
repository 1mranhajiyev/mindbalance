'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useQueryClient } from '@tanstack/react-query'
import { Home, BookOpen, Calendar, TrendingUp, CheckSquare, LogOut, Users, UserCircle } from 'lucide-react'

const navItems = [
  { href: '/patient/dashboard', label: 'Ana Səhifə', icon: Home },
  { href: '/patient/psychologists', label: 'Psixoloqlarım', icon: Users },
  { href: '/patient/journal', label: 'Gündəliyim', icon: BookOpen },
  { href: '/patient/sessions', label: 'Seanslar', icon: Calendar },
  { href: '/patient/progress', label: 'İnkişaf', icon: TrendingUp },
  { href: '/patient/tasks', label: 'Tapşırıqlar', icon: CheckSquare },
  { href: '/patient/profile', label: 'Profil', icon: UserCircle },
]

export default function PatientSidebar() {
  const pathname = usePathname()
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
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col fixed h-full z-10">
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26A7 7 0 0 0 12 2z"/>
              <line x1="9" y1="21" x2="15" y2="21"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm tracking-tight">MindBalance</p>
            <p className="text-xs text-slate-400">Pasiyent paneli</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}>
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="px-3 py-4 border-t border-slate-100 space-y-1">
        <Link href="/patient/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-all">
          <div className="avatar avatar-sm">{initials}</div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">{user?.full_name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 w-full transition-all">
          <LogOut size={16} />
          Çıxış
        </button>
      </div>
    </aside>
  )
}
