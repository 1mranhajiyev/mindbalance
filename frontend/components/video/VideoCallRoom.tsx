'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Mic, MicOff, Video, VideoOff, PhoneOff, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'

type Role = 'patient' | 'psychologist'

interface Props {
  sessionId: string
  role: Role
  remoteLabel: string
  exitPath: string
}

export default function VideoCallRoom({ sessionId, role, remoteLabel, exitPath }: Props) {
  const router = useRouter()
  const qc = useQueryClient()
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const peerRef = useRef<any>(null)
  const localStreamRef = useRef<MediaStream | null>(null)
  const lastSignalTs = useRef(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const joinedRef = useRef(false)
  const endingRef = useRef(false)

  const [isMicOn, setIsMicOn] = useState(true)
  const [isCamOn, setIsCamOn] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')
  const [hasRemoteStream, setHasRemoteStream] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const invalidateSessions = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['sessions'] })
    qc.invalidateQueries({ queryKey: ['psych-sessions'] })
  }, [qc])

  const leaveSession = useCallback(async () => {
    if (!joinedRef.current) return
    joinedRef.current = false
    try {
      await api.post(`/sessions/${sessionId}/leave`, {})
      invalidateSessions()
    } catch {
      // ignore
    }
  }, [sessionId, invalidateSessions])

  const cleanupMedia = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    peerRef.current?.destroy()
    peerRef.current = null
    localStreamRef.current?.getTracks().forEach(t => t.stop())
    localStreamRef.current = null
  }, [])

  const endCall = useCallback(async () => {
    if (endingRef.current) return
    endingRef.current = true
    cleanupMedia()
    await leaveSession()
    router.push(exitPath)
  }, [cleanupMedia, leaveSession, router, exitPath])

  useEffect(() => {
    let cancelled = false

    async function startCall() {
      try {
        await api.post(`/sessions/${sessionId}/join`, {})
        if (cancelled) return

        joinedRef.current = true
        invalidateSessions()

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop())
          return
        }

        localStreamRef.current = stream
        if (localVideoRef.current) localVideoRef.current.srcObject = stream

        const { default: Peer } = await import('simple-peer')
        const peer = new Peer({
          initiator: role === 'patient',
          trickle: true,
          stream,
        })
        peerRef.current = peer

        peer.on('signal', (data: unknown) => {
          api.post(`/sessions/${sessionId}/signals`, { data }).catch(() => {})
        })

        peer.on('stream', (remoteStream: MediaStream) => {
          if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream
          setHasRemoteStream(true)
          setConnectionStatus('connected')
        })

        peer.on('error', () => {
          setConnectionStatus('error')
          setErrorMsg('Bağlantı xətası baş verdi.')
        })

        peer.on('connect', () => setConnectionStatus('connected'))

        pollRef.current = setInterval(async () => {
          try {
            const { data: signals } = await api.get(`/sessions/${sessionId}/signals`, {
              params: { since: lastSignalTs.current },
            })
            for (const s of signals) {
              if (s.ts > lastSignalTs.current) lastSignalTs.current = s.ts
              peer.signal(s.data)
            }
          } catch {
            // polling retry
          }
        }, 1000)
      } catch {
        if (!cancelled) {
          setConnectionStatus('error')
          setErrorMsg('Kamera/mikrofon icazəsi və ya seans bağlantısı alınmadı.')
        }
      }
    }

    startCall()
    const timer = setInterval(() => setElapsed(e => e + 1), 1000)

    const onPageHide = () => {
      if (!joinedRef.current || endingRef.current) return
      endingRef.current = true
      joinedRef.current = false
      const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'
      const token = useAuthStore.getState().accessToken
      if (token) {
        fetch(`${baseURL}/sessions/${sessionId}/leave/`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          keepalive: true,
        }).catch(() => {})
      }
    }
    window.addEventListener('pagehide', onPageHide)

    return () => {
      cancelled = true
      clearInterval(timer)
      window.removeEventListener('pagehide', onPageHide)
      cleanupMedia()
      // Strict Mode cleanup leave etmir — yalnız endCall/pagehide
    }
  }, [sessionId, role, cleanupMedia, invalidateSessions])

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
    setIsMicOn(v => !v)
  }

  const toggleCam = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
    setIsCamOn(v => !v)
  }

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      {connectionStatus === 'connecting' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-black/60 text-white text-sm px-4 py-2 rounded-full">
          <Loader2 size={14} className="animate-spin" />
          {remoteLabel} gözlənilir...
        </div>
      )}
      {connectionStatus === 'error' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-red-500/90 text-white text-sm px-4 py-2 rounded-full">
          {errorMsg}
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 md:p-6">
        <div className="relative bg-gray-800 rounded-2xl overflow-hidden min-h-[200px]">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          {!hasRemoteStream && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
              {remoteLabel} hələ qoşulmayıb
            </div>
          )}
          <p className="absolute bottom-4 left-4 text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full">
            {remoteLabel}
          </p>
        </div>
        <div className="relative bg-gray-800 rounded-2xl overflow-hidden min-h-[200px]">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <p className="absolute bottom-4 left-4 text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full">
            Sən
          </p>
        </div>
      </div>

      <div className="bg-gray-800 px-8 py-5 flex items-center justify-center gap-6 relative">
        <span className="text-white font-mono text-lg absolute left-8">{formatTime(elapsed)}</span>
        <button
          onClick={toggleMic}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {isMicOn ? <Mic size={20} className="text-white" /> : <MicOff size={20} className="text-white" />}
        </button>
        <button
          onClick={toggleCam}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isCamOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {isCamOn ? <Video size={20} className="text-white" /> : <VideoOff size={20} className="text-white" />}
        </button>
        <button
          onClick={endCall}
          className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors"
        >
          <PhoneOff size={22} className="text-white" />
        </button>
      </div>
    </div>
  )
}
