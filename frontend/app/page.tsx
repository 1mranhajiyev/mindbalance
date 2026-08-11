import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-white px-4">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-2xl">🧠</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">MindBalance</h1>
        <p className="text-gray-500 text-lg mb-10">Sənin rifahın, bizim prioritetimiz</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="btn-primary text-center">Daxil ol</Link>
          <Link href="/register" className="btn-secondary text-center">Qeydiyyat</Link>
        </div>
      </div>
    </main>
  )
}
