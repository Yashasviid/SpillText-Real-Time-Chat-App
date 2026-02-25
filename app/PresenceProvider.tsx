'use client'
import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const setOnlineStatus = useMutation(api.users.setOnlineStatus) // Your existing mutation

  useEffect(() => {
    if (!user?.id) return

    const setOnline = () => setOnlineStatus({ clerkId: user.id, isOnline: true })
    const setOffline = () => setOnlineStatus({ clerkId: user.id, isOnline: false })

    // Online on mount
    setOnline()

    // Offline on tab close/refresh
    window.addEventListener('beforeunload', setOffline)

    // Offline on tab hidden (mobile switch)
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') setOffline()
      else setOnline()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // Heartbeat every 20s (fallback)
    const heartbeat = setInterval(setOnline, 20000)

    return () => {
      setOffline()
      window.removeEventListener('beforeunload', setOffline)
      document.removeEventListener('visibilitychange', handleVisibility)
      clearInterval(heartbeat)
    }
  }, [user?.id, setOnlineStatus])

  return <>{children}</>
}
