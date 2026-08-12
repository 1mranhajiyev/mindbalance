'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'
import { ChevronRight, ChevronLeft, Check, Brain, Search, UserCheck } from 'lucide-react'

// ─── Tiplər ───────────────────────────────────────────────
type Step = 'assessment' | 'select-psychologist' | 'waiting'

const scaleItems = [
  { key: 'anxiety_score',          label: 'Narahatlıq' },
  { key: 'self_confidence_score',  label: 'Özünəinam' },
  { key: 'stress_score',           label: 'Stress' },
  { key: 'relationships_score',    label: 'Münasibətlər' },
  { key: 'boundaries_score',       label: 'Sərhəd qoymaq' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const qc = useQueryClient()

  // ─── Assessment state ──────────────────────────────────
  const [step, setStep] = useState<Step>('assessment')
  const [assessmentStep, setAssessmentStep] = useState(0) // 0=questions 1=scales
  const [form, setForm] = useState({
    therapy_reason: '',
    main_concern: '',
    desired_change: '',
    therapy_expectation: '',
    life_difficulties: '',
  })
  const [scales, setScales] = useState<Record<string, number>>({
    anxiety_score: 5,
    self_confidence_score: 5,
    stress_score: 5,
    relationships_score: 5,
    boundaries_score: 5,
  })
  const [selectedPsych, setSelectedPsych] = useState<string | null>(null)
  const [requestMsg, setRequestMsg] = useState('')

  // ─── Queries ───────────────────────────────────────────
  const { data: psychologists = [] } = useQuery({
    queryKey: ['onboarding-psychologists'],
    queryFn: () => api.get('/onboarding/psychologists').then(r => r.data),
    enabled: step === 'select-psychologist',
  })

  // ─── Mutations ────────────────────────────────────────
  const saveAssessment = useMutation({
    mutationFn: (data: any) => api.post('/onboarding/assessment', data),
    onSuccess: () => setStep('select-psychologist'),
  })

  const sendRequest = useMutation({
    mutationFn: (data: any) => api.post('/onboarding/request', data),
    onSuccess: () => setStep('waiting'),
  })

  // ─── Handlers ─────────────────────────────────────────
  const handleAssessmentNext = () => {
    if (assessmentStep === 0) { setAssessmentStep(1); return }
    saveAssessment.mutate({ ...form, ...scales })
  }

  const handleSelectPsych = () => {
    if (!selectedPsych) return
    sendRequest.mutate({ psychologist_id: selectedPsych, message: requestMsg })
  }

  // ─── Progress bar ─────────────────────────────────────
  const steps = [
    { id: 'assessment', label: 'Qiymətləndirmə', icon: Brain },
    { id: 'select-psychologist', label: 'Psixoloq seç', icon: Search },
    { id: 'waiting', label: 'Gözlə', icon: UserCheck },
  ]
  const stepIndex = steps.findIndex(s => s.id === step)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-2.26A7 7 0 0 0 12 2z"/>
            <line x1="9" y1="21" x2="15" y2="21"/>
          </svg>
        </div>
        <span className="font-bold text-slate-900 tracking-tight">MindBalance</span>
      </div>

      {/* Step progress */}
      <ApiErrorAlert
        error={saveAssessment.error || sendRequest.error}
        fallback="Sorğu göndərilə bilmədi"
      />
      <div className="flex items-center gap-2 mb-10">
        {steps.map((s, i) => {
          const Icon = s.icon
          const done = i < stepIndex
          const active = i === stepIndex
          return (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                active ? 'bg-indigo-600 text-white' :
                done ? 'bg-emerald-100 text-emerald-700' :
                'bg-slate-100 text-slate-400'
              }`}>
                {done ? <Check size={12} /> : <Icon size={12} />}
                {s.label}
              </div>
              {i < steps.length - 1 && <div className={`w-6 h-px ${ done ? 'bg-emerald-300' : 'bg-slate-200' }`} />}
            </div>
          )
        })}
      </div>

      {/* ─── STEP 1: Assessment ── */}
      {step === 'assessment' && (
        <div className="card w-full max-w-xl">
          {assessmentStep === 0 ? (
            <>
              <h2 className="text-lg font-bold text-slate-900 mb-1">İlkin Qiymətləndirmə</h2>
              <p className="text-sm text-slate-500 mb-6">Cavablarınız yalnız psixoloğunuz tərəfindən görülür.</p>
              <div className="space-y-4">
                {[
                  { key: 'therapy_reason',      label: 'Nə üçün terapiyaya başlamısan?' },
                  { key: 'main_concern',         label: 'Hazırda səni ən çox narahat edən nədir?' },
                  { key: 'desired_change',       label: 'Nəyin dəyişməsini istəyirsən?' },
                  { key: 'therapy_expectation',  label: 'Terapiyadan gözləntin nədir?' },
                  { key: 'life_difficulties',    label: 'Hazırda həyatında hansı sahələrdə çətinlik var?' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <textarea
                      rows={2}
                      value={(form as any)[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="input resize-none"
                      placeholder="Öz sözlərinizlə yazın..."
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="text-lg font-bold text-slate-900 mb-1">Özünü qiymətləndir</h2>
              <p className="text-sm text-slate-500 mb-6">Hər sahəni 0–10 arasında qiymətləndir.</p>
              <div className="space-y-5">
                {scaleItems.map(({ key, label }) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="label mb-0 text-sm font-medium text-slate-700">{label}</label>
                      <span className="text-sm font-bold text-indigo-600 tabular-nums w-8 text-right">{scales[key]} / 10</span>
                    </div>
                    <input
                      type="range" min={0} max={10} step={1}
                      value={scales[key]}
                      onChange={e => setScales(s => ({ ...s, [key]: Number(e.target.value) }))}
                      className="w-full h-1.5 rounded-full appearance-none bg-slate-100 accent-indigo-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-slate-300 mt-1">
                      <span>0</span><span>5</span><span>10</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="flex justify-between items-center mt-8">
            {assessmentStep > 0 ? (
              <button onClick={() => setAssessmentStep(0)} className="btn-ghost flex items-center gap-1.5 text-sm">
                <ChevronLeft size={16} /> Geri
              </button>
            ) : <div />}
            <button
              onClick={handleAssessmentNext}
              disabled={saveAssessment.isPending}
              className="btn-primary flex items-center gap-1.5"
            >
              {assessmentStep === 0 ? 'Davam et' : (saveAssessment.isPending ? 'Saxlanılır...' : 'Psixoloq seç')}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 2: Psixoloq seç ── */}
      {step === 'select-psychologist' && (
        <div className="w-full max-w-2xl space-y-4">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900">Psixoloq seçin</h2>
            <p className="text-sm text-slate-500 mt-1">Profilləri nəzərdən keçirin, sizə uyğun birini seçin.</p>
          </div>

          {psychologists.length === 0 && (
            <div className="card text-center py-12 text-slate-400 text-sm">Hazırda aktiv psixoloq yoxdur.</div>
          )}

          <div className="grid gap-3">
            {psychologists.map((p: any) => (
              <button
                key={p.id}
                onClick={() => setSelectedPsych(p.id)}
                className={`card text-left transition-all ${
                  selectedPsych === p.id
                    ? 'border-2 border-indigo-500 bg-indigo-50/40'
                    : 'border border-slate-100 hover:border-indigo-200'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="avatar">{p.full_name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900 text-sm">{p.full_name}</p>
                      {p.session_price && <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{p.session_price} ₼/seans</span>}
                    </div>
                    {p.specialization && <p className="text-xs text-indigo-600 mt-0.5 font-medium">{p.specialization}</p>}
                    {p.bio && <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{p.bio}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      {p.experience_years && <span className="text-xs text-slate-400">{p.experience_years} il təcrübə</span>}
                      {p.languages && <span className="text-xs text-slate-400">{p.languages}</span>}
                    </div>
                  </div>
                  {selectedPsych === p.id && <Check size={16} className="text-indigo-600 mt-0.5 shrink-0" />}
                </div>
              </button>
            ))}
          </div>

          {selectedPsych && (
            <div className="card mt-2">
              <label className="label">Mesaj (istəyə bağlı)</label>
              <textarea
                rows={2}
                value={requestMsg}
                onChange={e => setRequestMsg(e.target.value)}
                className="input resize-none"
                placeholder="Özünüz haqqında qısa məlumat..."
              />
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            <button onClick={() => setStep('assessment')} className="btn-ghost flex items-center gap-1.5 text-sm">
              <ChevronLeft size={16} /> Geri
            </button>
            <button
              onClick={handleSelectPsych}
              disabled={!selectedPsych || sendRequest.isPending}
              className="btn-primary flex items-center gap-1.5 disabled:opacity-50"
            >
              {sendRequest.isPending ? 'Göndərilir...' : 'Müraciət göndər'}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ─── STEP 3: Gözləmə ── */}
      {step === 'waiting' && (
        <div className="card w-full max-w-md text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-5">
            <UserCheck size={28} className="text-amber-500" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Müraciətiniz göndərildi</h2>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            Psixoloq müraciətinizi nəzərdən keçirəcək. Qəbul edildikdən sonra dashboardunuz tam aktiv olacaq.
          </p>
          <p className="text-xs text-slate-400 mt-4">Bu səhifəni bağlaya bilərsiniz.</p>
        </div>
      )}
    </div>
  )
}
