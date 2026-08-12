'use client'
import ProfileEditor from '@/components/profile/ProfileEditor'
import SecuritySettings from '@/components/profile/SecuritySettings'

export default function PsychologistProfilePage() {
  return (
    <div className="space-y-8">
      <ProfileEditor role="psychologist" />
      <div className="max-w-2xl mx-auto">
        <SecuritySettings />
      </div>
    </div>
  )
}
