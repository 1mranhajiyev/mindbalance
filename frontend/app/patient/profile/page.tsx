'use client'
import ProfileEditor from '@/components/profile/ProfileEditor'
import SecuritySettings from '@/components/profile/SecuritySettings'

export default function PatientProfilePage() {
  return (
    <div className="space-y-8">
      <ProfileEditor role="patient" />
      <div className="max-w-2xl mx-auto">
        <SecuritySettings />
      </div>
    </div>
  )
}
