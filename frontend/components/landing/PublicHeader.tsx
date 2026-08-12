'use client'
import Link from 'next/link'
import { UserCircle } from 'lucide-react'
import { MindBalanceLogo } from '@/components/brand/MindBalanceLogo'

interface Props {
  showProfile?: boolean
  profileHref?: string
}

export default function PublicHeader({ showProfile = true, profileHref = '/login' }: Props) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 px-4 sm:px-8 flex items-center justify-between bg-white/75 backdrop-blur-md border-b border-primary-100/60">
      <Link
        href="/"
        className="flex items-center gap-2.5 rounded-lg py-1 pr-2 -ml-1 hover:opacity-80 transition-opacity"
      >
        <div className="logo-icon logo-icon-sm">
          <MindBalanceLogo size={16} />
        </div>
        <span className="font-semibold text-slate-800 tracking-tight hidden sm:inline">MindBalance</span>
      </Link>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
        <a href="#pasiyent" className="hover:text-primary-700 transition-colors">Pasiyentlər</a>
        <a href="#psixoloq" className="hover:text-primary-700 transition-colors">Psixoloqlar</a>
        <a href="#nece-isleyir" className="hover:text-primary-700 transition-colors">Necə işləyir</a>
      </nav>

      <div className="flex items-center gap-2 sm:gap-3">
        <Link
          href="/login"
          className="hidden sm:inline-flex text-sm font-medium text-slate-600 hover:text-primary-700 transition-colors px-3 py-2"
        >
          Daxil ol
        </Link>
        {showProfile && (
          <Link
            href={profileHref}
            className="flex items-center justify-center w-10 h-10 rounded-full text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-100 transition-colors"
            aria-label="Daxil ol"
          >
            <UserCircle size={22} strokeWidth={1.75} />
          </Link>
        )}
      </div>
    </header>
  )
}
