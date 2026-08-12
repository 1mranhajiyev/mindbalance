'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
}

interface Props {
  items: NavItem[]
  onNavigate?: () => void
}

export function SidebarNav({ items, onNavigate }: Props) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
      {items.map(({ href, label, icon: Icon }, index) => {
        const active = pathname === href || pathname.startsWith(`${href}/`)
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`nav-link group ${active ? 'active' : ''}`}
            style={{ animationDelay: `${index * 40}ms` }}
          >
            <span className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
              active ? 'bg-primary-100 text-primary-700' : 'text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600'
            }`}>
              <Icon size={16} strokeWidth={active ? 2.5 : 2} />
            </span>
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
