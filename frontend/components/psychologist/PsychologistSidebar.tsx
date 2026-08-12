'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { LayoutDashboard, Users, Calendar, ClipboardList, BookOpen, BarChart2, CreditCard, LogOut } from 'lucide-react'

const navItems = [
  { href: '/psychologist/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/psychologist/patients', label: 'Pasiyentlər', icon: Users },
  { href: '/psychologist/sessions', label: 'Seanslar', icon: Calendar },
  { href: '/psychologist/tasks', label: 'Tapşırıqlar', icon: ClipboardList },
  { href: '/psychologist/notes', label: 'Qeydlər', icon: BookOpen },
  { href: '/psychologist/statistics', label: 'Statistika', icon: BarChart2 },
  { href: '/psychologist/payments', label: 'Ödənişlər', icon: CreditCard },
]

export default function PsychologistSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col fixed h-full z-10">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-sm">🧠</span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">MindBalance</p>
            <p className="text-xs text-gray-400">Psixoloq</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              pathname === href
                ? 'bg-violet-50 text-violet-700'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 w-full"
        >
          <LogOut size={18} />
          Çıxış
        </button>
      </div>
    </aside>
  )
}
