export const sessionStatusLabels: Record<string, string> = {
  scheduled: 'Planlaşdırılıb',
  patient_waiting: 'Pasiyent gözləyir',
  psychologist_waiting: 'Psixoloq gözləyir',
  active: 'Canlı',
  in_progress: 'Canlı',
  completed: 'Bitdi',
  cancelled: 'Ləğv edildi',
}

export const sessionStatusStyles: Record<string, string> = {
  scheduled: 'bg-violet-100 text-violet-700',
  patient_waiting: 'bg-amber-100 text-amber-700',
  psychologist_waiting: 'bg-amber-100 text-amber-700',
  active: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-600',
}

export function resolveSessionCallState(session: { call_state?: string; status?: string }): string {
  if (session.call_state) return session.call_state
  if (session.status === 'completed') return 'completed'
  if (session.status === 'cancelled') return 'cancelled'
  return session.status || 'scheduled'
}

export function canJoinSession(session: { call_state?: string; status?: string; format?: string }): boolean {
  if (session.format !== 'online') return false
  const state = resolveSessionCallState(session)
  return ['scheduled', 'patient_waiting', 'psychologist_waiting', 'active'].includes(state)
}

export function getSessionStatusLabel(state: string): string {
  return sessionStatusLabels[state] || state
}

export function getSessionStatusStyle(state: string): string {
  return sessionStatusStyles[state] || 'bg-gray-100 text-gray-600'
}

export function getSessionLabel(session: { call_state?: string; status?: string }): string {
  return getSessionStatusLabel(resolveSessionCallState(session))
}

export function getSessionStyle(session: { call_state?: string; status?: string }): string {
  return getSessionStatusStyle(resolveSessionCallState(session))
}

export function isUpcomingSession(session: { call_state?: string; status?: string }): boolean {
  const state = resolveSessionCallState(session)
  return ['scheduled', 'patient_waiting', 'psychologist_waiting', 'active'].includes(state)
}

export function isPastSession(session: { call_state?: string; status?: string }): boolean {
  const state = resolveSessionCallState(session)
  return state === 'completed' || state === 'cancelled'
}

