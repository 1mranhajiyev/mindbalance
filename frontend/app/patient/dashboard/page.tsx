'use client'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import CheckInCard from '@/components/patient/CheckInCard'
import GoalsWidget from '@/components/patient/GoalsWidget'
import TasksWidget from '@/components/patient/TasksWidget'
import NextSessionCard from '@/components/patient/NextSessionCard'

export default function PatientDashboard() {
  const { user } = useAuthStore()

  const { data: sessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get('/sessions').then(r => r.data)
  })

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then(r => r.data)
  })

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => api.get('/goals').then(r => r.data)
  })

  const upcomingSession = sessions?.find((s: any) => s.status === 'scheduled')
  const pendingTasks = tasks?.filter((t: any) => !t.is_completed) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Salam, {user?.full_name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-1">Bu gün özünü necə hiss edirsən?</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CheckInCard />
          <GoalsWidget goals={goals || []} />
        </div>
        <div className="space-y-6">
          <NextSessionCard session={upcomingSession} />
          <TasksWidget tasks={pendingTasks} />
        </div>
      </div>
    </div>
  )
}
