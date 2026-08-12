'use client'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Loader2, Shield, KeyRound } from 'lucide-react'
import api from '@/lib/api'
import ApiErrorAlert from '@/components/ApiErrorAlert'
import { useAuthStore } from '@/store/auth'

export default function SecuritySettings() {
  const { user, setUser } = useAuthStore()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [totpSecret, setTotpSecret] = useState<string | null>(null)
  const [totpUri, setTotpUri] = useState<string | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')

  const passwordMutation = useMutation({
    mutationFn: () =>
      api.post('/auth/password/change', {
        current_password: currentPassword,
        new_password: newPassword,
      }),
    onSuccess: () => {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    },
  })

  const setupMutation = useMutation({
    mutationFn: () => api.post('/auth/2fa/setup').then(r => r.data),
    onSuccess: (data) => {
      setTotpSecret(data.secret)
      setTotpUri(data.uri)
    },
  })

  const verifyMutation = useMutation({
    mutationFn: (code: string) => api.post('/auth/2fa/verify', { code }),
    onSuccess: () => {
      if (user) setUser({ ...user, totp_enabled: true })
      setTotpSecret(null)
      setTotpUri(null)
      setVerifyCode('')
    },
  })

  const disableMutation = useMutation({
    mutationFn: () =>
      api.post('/auth/2fa/disable', { code: disableCode, password: disablePassword }),
    onSuccess: () => {
      if (user) setUser({ ...user, totp_enabled: false })
      setDisableCode('')
      setDisablePassword('')
    },
  })

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) return
    passwordMutation.mutate()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Təhlükəsizlik</h2>
        <p className="text-gray-500 mt-1 text-sm">Parol və iki faktorlu autentifikasiya</p>
      </div>

      <form onSubmit={handlePasswordSubmit} className="card space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound size={18} className="text-primary-600" />
          <h3 className="font-semibold text-gray-900">Parol dəyişdir</h3>
        </div>
        <ApiErrorAlert error={passwordMutation.error} fallback="Parol yenilənə bilmədi" />
        {passwordMutation.isSuccess && (
          <div className="rounded-lg bg-green-50 text-green-700 text-sm px-4 py-3">Parol yeniləndi.</div>
        )}
        <div className="form-group">
          <label className="label">Cari parol</label>
          <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="input" required />
        </div>
        <div className="form-group">
          <label className="label">Yeni parol</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input" required minLength={8} />
        </div>
        <div className="form-group">
          <label className="label">Yeni parol (təkrar)</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input" required />
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="form-error">Parollar uyğun gəlmir</p>
          )}
        </div>
        <button type="submit" disabled={passwordMutation.isPending || newPassword !== confirmPassword} className="btn-primary">
          {passwordMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Parolu yenilə'}
        </button>
      </form>

      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-primary-600" />
            <h3 className="font-semibold text-gray-900">İki faktorlu autentifikasiya (2FA)</h3>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${user?.totp_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {user?.totp_enabled ? 'Aktiv' : 'Deaktiv'}
          </span>
        </div>

        {!user?.totp_enabled ? (
          <>
            {!totpSecret ? (
              <>
                <p className="text-sm text-gray-500">Google Authenticator və ya oxşar tətbiqlə hesabınızı qoruyun.</p>
                <ApiErrorAlert error={setupMutation.error} fallback="2FA quraşdırıla bilmədi" />
                <button onClick={() => setupMutation.mutate()} disabled={setupMutation.isPending} className="btn-secondary">
                  {setupMutation.isPending ? 'Hazırlanır...' : '2FA quraşdır'}
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">Autentifikasiya tətbiqinə bu açarı əlavə edin:</p>
                <code className="block bg-gray-50 p-3 rounded-lg text-sm break-all">{totpSecret}</code>
                {totpUri && (
                  <a href={totpUri} className="text-sm text-primary-600 hover:underline">Tətbiqdə aç</a>
                )}
                <ApiErrorAlert error={verifyMutation.error} fallback="Kod təsdiqlənə bilmədi" />
                <div className="flex gap-2">
                  <input
                    value={verifyCode}
                    onChange={e => setVerifyCode(e.target.value)}
                    className="input flex-1"
                    placeholder="6 rəqəmli kod"
                    maxLength={6}
                  />
                  <button
                    onClick={() => verifyMutation.mutate(verifyCode)}
                    disabled={verifyCode.length < 6 || verifyMutation.isPending}
                    className="btn-primary shrink-0"
                  >
                    Təsdiqlə
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <ApiErrorAlert error={disableMutation.error} fallback="2FA söndürülə bilmədi" />
            {disableMutation.isSuccess && (
              <div className="rounded-lg bg-green-50 text-green-700 text-sm px-4 py-3">2FA söndürüldü.</div>
            )}
            <input type="password" value={disablePassword} onChange={e => setDisablePassword(e.target.value)} className="input" placeholder="Parol" />
            <input value={disableCode} onChange={e => setDisableCode(e.target.value)} className="input" placeholder="2FA kodu" maxLength={6} />
            <button
              onClick={() => disableMutation.mutate()}
              disabled={!disablePassword || disableCode.length < 6 || disableMutation.isPending}
              className="btn-secondary text-red-600 border-red-200 hover:bg-red-50"
            >
              2FA söndür
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
