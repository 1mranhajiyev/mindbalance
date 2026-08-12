import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-surface px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary-200/30 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-primary-100/40 blur-3xl" />
      </div>

      <div className="text-center max-w-lg relative z-10 animate-fade-in-up">
        <div className="logo-icon mx-auto mb-6 w-16 h-16 rounded-2xl">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26A7 7 0 0 0 12 2z"/>
            <line x1="9" y1="21" x2="15" y2="21"/>
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight">MindBalance</h1>
        <p className="text-slate-500 text-base sm:text-lg mb-10">Sənin rifahın, bizim prioritetimiz</p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center stagger-children">
          <Link href="/login" className="btn-primary text-center px-8">Daxil ol</Link>
          <Link href="/register" className="btn-secondary text-center px-8">Qeydiyyat</Link>
        </div>
      </div>
    </main>
  )
}
