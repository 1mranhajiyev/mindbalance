import { AxiosError } from 'axios'

const FIELD_LABELS: Record<string, string> = {
  email: 'Email',
  password: 'Parol',
  full_name: 'Ad Soyad',
  phone: 'Telefon',
  role: 'Rol',
  content: 'Məzmun',
  patient_id: 'Pasiyent',
  psychologist_id: 'Psixoloq',
  non_field_errors: '',
}

function flattenErrors(data: unknown, parentKey = ''): string[] {
  if (data == null) return []
  if (typeof data === 'string') return [data]
  if (Array.isArray(data)) return data.flatMap((item) => flattenErrors(item, parentKey))

  if (typeof data === 'object') {
    return Object.entries(data as Record<string, unknown>).flatMap(([key, value]) => {
      if (key === 'detail') return flattenErrors(value)
      const label = FIELD_LABELS[key] ?? key
      const messages = flattenErrors(value, key)
      if (!label) return messages
      return messages.map((msg) => `${label}: ${msg}`)
    })
  }

  return [String(data)]
}

export function getApiErrorMessages(error: unknown, fallback = 'Xəta baş verdi'): string[] {
  const axiosError = error as AxiosError
  const status = axiosError?.response?.status
  const data = axiosError?.response?.data

  if (status === 400 || (data && typeof data === 'object')) {
    const messages = flattenErrors(data)
    if (messages.length > 0) return messages
  }

  if (typeof data === 'string' && data.trim()) return [data]

  const detail = (data as { detail?: unknown })?.detail
  if (detail) {
    const messages = flattenErrors(detail)
    if (messages.length > 0) return messages
  }

  return [fallback]
}

export function getApiErrorMessage(error: unknown, fallback = 'Xəta baş verdi'): string {
  return getApiErrorMessages(error, fallback).join(' · ')
}
