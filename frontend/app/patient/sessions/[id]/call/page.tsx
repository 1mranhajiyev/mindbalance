'use client'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare } from 'lucide-react'

export default function VideoCallPage() {
  const { id } = useParams()
  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCamOn, setIsCamOn] = useState(true)
  const [elapsed, setElapsed] = useState(0)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setLocalStream(stream)
      if (localVideoRef.current) localVideoRef.current.srcObject = stream
    })
    const timer = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => {
      clearInterval(timer)
      localStream?.getTracks().forEach(t => t.stop())
    }
  }, [])

  const toggleMic = () => {
    localStream?.getAudioTracks().forEach(t => { t.enabled = !t.enabled })
    setIsMicOn(v => !v)
  }

  const toggleCam = () => {
    localStream?.getVideoTracks().forEach(t => { t.enabled = !t.enabled })
    setIsCamOn(v => !v)
  }

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 grid grid-cols-2 gap-4 p-6">
        <div className="relative bg-gray-800 rounded-2xl overflow-hidden">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <p className="absolute bottom-4 left-4 text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full">Psixoloq</p>
        </div>
        <div className="relative bg-gray-800 rounded-2xl overflow-hidden">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <p className="absolute bottom-4 left-4 text-white text-sm font-medium bg-black/40 px-3 py-1 rounded-full">Sən</p>
        </div>
      </div>
      <div className="bg-gray-800 px-8 py-5 flex items-center justify-center gap-6">
        <span className="text-white font-mono text-lg absolute left-8">{formatTime(elapsed)}</span>
        <button onClick={toggleMic} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
        }`}>
          {isMicOn ? <Mic size={20} className="text-white" /> : <MicOff size={20} className="text-white" />}
        </button>
        <button onClick={toggleCam} className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          isCamOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'
        }`}>
          {isCamOn ? <Video size={20} className="text-white" /> : <VideoOff size={20} className="text-white" />}
        </button>
        <button className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors">
          <PhoneOff size={22} className="text-white" />
        </button>
      </div>
    </div>
  )
}
