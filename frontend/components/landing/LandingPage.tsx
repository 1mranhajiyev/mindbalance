'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useAuthHydrated } from '@/hooks/useAuthHydrated'
import { MindBalanceLogo } from '@/components/brand/MindBalanceLogo'
import PublicHeader from '@/components/landing/PublicHeader'
import {
  ArrowRight,
  BookOpen,
  Calendar,
  BarChart2,
  ClipboardList,
  Heart,
  Lock,
  Target,
  Users,
  Video,
} from 'lucide-react'

const patientFeatures = [
  { icon: Heart, title: 'Gündəlik check-in', desc: 'Hər gün özünüzü qiymətləndirin, emosional dəyişiklikləri izləyin.' },
  { icon: Video, title: 'Online seanslar', desc: 'Ev rahatlığında psixoloqunuzla təhlükəsiz video görüş.' },
  { icon: BookOpen, title: 'Şəxsi gündəlik', desc: 'Fikirlərinizi, hisslərinizi və hadisələri qeyd edin.' },
  { icon: Target, title: 'Məqsədlər və tapşırıqlar', desc: 'Terapiya planınıza uyğun addımlar atın, irəliləyişi görün.' },
]

const psychFeatures = [
  { icon: Users, title: 'Pasiyent idarəetməsi', desc: 'Bütün pasiyentləriniz bir paneldə — profil, tarixçə, qeydlər.' },
  { icon: Calendar, title: 'Seans planlaşdırma', desc: 'Online və üz-üzə seansları asanlıqla təyin edin.' },
  { icon: ClipboardList, title: 'Tapşırıq və qeydlər', desc: 'Pasiyentlərə tapşırıq verin, seans qeydlərini saxlayın.' },
  { icon: BarChart2, title: 'Statistika', desc: 'Seans sayı, gəlir və pasiyent dinamikasını izləyin.' },
]

const steps = [
  { num: '01', title: 'Qeydiyyatdan keçin', desc: 'Pasiyent və ya psixoloq kimi bir neçə dəqiqəyə hesab yaradın.' },
  { num: '02', title: 'Əlaqə qurun', desc: 'Pasiyent psixoloq seçir, psixoloq müraciətləri qəbul edir.' },
  { num: '03', title: 'Terapiyaya başlayın', desc: 'Seans planlaşdırın, görüşün, irəliləyişi birlikdə izləyin.' },
]

const trustItems = [
  { icon: Lock, label: 'Məxfilik qorunur' },
  { icon: Video, label: 'Təhlükəsiz video zəng' },
  { icon: Heart, label: 'Peşəkar dəstək' },
]

export default function LandingPage() {
  const router = useRouter()
  const hydrated = useAuthHydrated()
  const { user, accessToken } = useAuthStore()

  useEffect(() => {
    if (!hydrated || !accessToken || !user) return
    router.replace(user.role === 'patient' ? '/patient/dashboard' : '/psychologist/dashboard')
  }, [hydrated, accessToken, user, router])

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="spinner w-7 h-7 border-[3px]" />
      </div>
    )
  }

  if (accessToken && user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="spinner w-7 h-7 border-[3px]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] text-slate-800">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full bg-primary-200/20 blur-3xl" />
        <div className="absolute bottom-0 right-[-10%] w-[500px] h-[500px] rounded-full bg-primary-100/30 blur-3xl" />
      </div>

      <PublicHeader />

      {/* Hero */}
      <section className="relative z-10 pt-28 pb-20 sm:pt-32 sm:pb-28 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <div className="logo-icon mx-auto mb-8 w-[72px] h-[72px] rounded-2xl shadow-glow">
            <MindBalanceLogo size={32} />
          </div>
          <p className="text-primary-700 text-sm font-semibold tracking-wide uppercase mb-4">
            Psixoloji dəstək platforması
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-5">
            Sənin rifahın,<br className="hidden sm:block" /> bizim prioritetimiz
          </h1>
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            MindBalance pasiyent və psixoloqları bir yerdə birləşdirir.
            Online seanslar, gündəlik izləmə və şəxsi inkişaf — hamısı bir platformada.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link href="/register" className="btn-primary px-8 py-3 w-full sm:w-auto min-w-[160px]">
              Başla
              <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="btn-secondary px-8 py-3 w-full sm:w-auto min-w-[160px]">
              Daxil ol
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-12 pt-8 border-t border-primary-100/80">
            {trustItems.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-slate-500">
                <Icon size={16} className="text-primary-600" strokeWidth={2} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pasiyent */}
      <section id="pasiyent" className="relative z-10 py-20 sm:py-24 px-4 sm:px-8 bg-white/60 border-y border-primary-100/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <p className="text-primary-600 text-sm font-semibold mb-2">Pasiyentlər üçün</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-4">
                Özünüzə investisiya edin
              </h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                Hiss etdiyiniz emosiyaları izləyin, peşəkar psixoloq tapın və
                terapiya prosesini addım-addım idarə edin. Heç bir mürəkkəblik yoxdur.
              </p>
              <Link href="/register" className="btn-primary inline-flex">
                Pasiyent kimi qeydiyyat
                <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {patientFeatures.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="p-5 rounded-2xl bg-white border border-primary-100/80 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                    <Icon size={20} className="text-primary-600" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1.5">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Psixoloq */}
      <section id="psixoloq" className="relative z-10 py-20 sm:py-24 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1 grid sm:grid-cols-2 gap-4">
              {psychFeatures.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="p-5 rounded-2xl bg-white border border-primary-100/80 shadow-sm hover:shadow-md hover:border-primary-200 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
                    <Icon size={20} className="text-primary-600" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-sm mb-1.5">{title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-primary-600 text-sm font-semibold mb-2">Psixoloqlar üçün</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-4">
                Praktikanızı rəqəmsallaşdırın
              </h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                Pasiyentlərinizi idarə edin, seansları planlaşdırın, qeydlər aparın
                və işinizi daha səmərəli şəkildə təşkil edin.
              </p>
              <Link href="/register" className="btn-primary inline-flex">
                Psixoloq kimi qeydiyyat
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Necə işləyir */}
      <section id="nece-isleyir" className="relative z-10 py-20 sm:py-24 px-4 sm:px-8 bg-white/60 border-y border-primary-100/50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-primary-600 text-sm font-semibold mb-2">Sadə proses</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-12">
            Necə işləyir?
          </h2>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-6">
            {steps.map(({ num, title, desc }) => (
              <div key={num} className="relative text-left sm:text-center">
                <span className="text-4xl font-bold text-primary-200 block mb-3">{num}</span>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 sm:py-24 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="rounded-3xl bg-gradient-to-br from-primary-600 to-primary-700 px-8 py-14 sm:px-12 sm:py-16 shadow-glow text-white">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
              Bu gün ilk addımı atın
            </h2>
            <p className="text-primary-100 text-base sm:text-lg mb-8 max-w-md mx-auto">
              Hesab yaradın və özünüzə və ya pasiyentlərinizə daha yaxşı dəstək göstərin.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-white text-primary-700 font-semibold text-sm hover:bg-primary-50 transition-colors w-full sm:w-auto min-w-[160px]"
              >
                Qeydiyyat
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors w-full sm:w-auto min-w-[160px]"
              >
                Daxil ol
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 px-4 sm:px-8 border-t border-primary-100/60">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="logo-icon logo-icon-sm opacity-90">
              <MindBalanceLogo size={14} />
            </div>
            <span className="font-medium text-slate-600">MindBalance</span>
          </div>
          <p>&copy; {new Date().getFullYear()} MindBalance. Bütün hüquqlar qorunur.</p>
        </div>
      </footer>
    </div>
  )
}
