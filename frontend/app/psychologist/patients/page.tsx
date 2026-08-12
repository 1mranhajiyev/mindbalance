'use client'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import Link from 'next/link'
import { format } from 'date-fns'
import { az } from 'date-fns/locale'
import { ChevronRight } from 'lucide-react'

export default function PatientsPage() {
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ['patients'],
    queryFn: () => api.get('/patients').then(r => r.data)
  })

  return (
    <div className="space-y-6">
      <h1 className="page-title">Pasiyentlər</h1>
      {isLoading && <p className="text-gray-400">Yüklənir...</p>}
      <div className="space-y-3">
        {patients.map((p: any) => (
          <Link key={p.id} href={`/psychologist/patients/${p.id}`}
            className="card flex items-center justify-between hover:border-primary-200 transition-colors cursor-pointer block">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-bold text-sm">{p.full_name[0]}</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{p.full_name}</p>
                <p className="text-sm text-gray-500">{p.email}</p>
                {p.therapy_start_date && (
                  <p className="text-xs text-gray-400 mt-0.5">Başlanğıc: {format(new Date(p.therapy_start_date), 'd MMM yyyy', { locale: az })}</p>
                )}
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
          </Link>
        ))}
      </div>
    </div>
  )
}
