import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/auth'

export function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const persist = useAuthStore.persist
    if (!persist) {
      setHydrated(true)
      return
    }

    setHydrated(persist.hasHydrated())

    const unsub = persist.onFinishHydration(() => setHydrated(true))
    return unsub
  }, [])

  return hydrated
}
