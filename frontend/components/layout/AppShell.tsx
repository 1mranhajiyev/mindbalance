'use client'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

interface Props {
  sidebar: (opts: { onNavigate: () => void }) => React.ReactNode
  panelLabel: string
  children: React.ReactNode
}

export default function AppShell({ sidebar, panelLabel, children }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-surface">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-white/90 backdrop-blur-md border-b border-primary-100 flex items-center justify-between px-4">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-lg text-primary-700 hover:bg-primary-50 transition-colors"
          aria-label="Menunu aç"
        >
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="logo-icon logo-icon-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26A7 7 0 0 0 12 2z"/>
            </svg>
          </div>
          <span className="font-semibold text-sm text-slate-800">MindBalance</span>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-primary-600 font-medium">{panelLabel}</span>
      </header>

      {/* Backdrop */}
      {mobileOpen && (
        <button
          type="button"
          className="lg:hidden fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px] animate-fade-in"
          onClick={() => setMobileOpen(false)}
          aria-label="Menunu bağla"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-[min(100%,280px)] transform transition-transform duration-300 ease-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="lg:hidden absolute top-3 right-3 z-10">
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg bg-white/90 text-slate-600 shadow-sm hover:bg-primary-50 transition-colors"
            aria-label="Bağla"
          >
            <X size={18} />
          </button>
        </div>
        {sidebar({ onNavigate: () => setMobileOpen(false) })}
      </div>

      {/* Main */}
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 animate-fade-in">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
