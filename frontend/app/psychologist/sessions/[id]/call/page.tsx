'use client'
import { useParams } from 'next/navigation'
import VideoCallRoom from '@/components/video/VideoCallRoom'

export default function PsychologistVideoCallPage() {
  const { id } = useParams()
  const sessionId = String(id)

  return (
    <VideoCallRoom
      sessionId={sessionId}
      role="psychologist"
      remoteLabel="Pasiyent"
      exitPath="/psychologist/sessions"
    />
  )
}
