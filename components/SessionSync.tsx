'use client'

import { useSession } from 'next-auth/react'
import { useUserStore } from '@/lib/store/user'
import { useEffect } from 'react'

export function SessionSync() {
  const { data: session, status } = useSession()
  const { setUser } = useUserStore()

  useEffect(() => {
    const syncSession = async () => {
      if (status === 'authenticated' && session?.user) {
        // Fetch full user data from database
        try {
          const userRes = await fetch(`/api/users/${(session.user as any).id}`)
          
          if (userRes.ok) {
            const userData = await userRes.json()
            setUser(userData)
            
            // Store token if available
            if ((session.user as any).token) {
              localStorage.setItem('token', (session.user as any).token)
            }
          } else {
            // Fallback: use session data directly
            const fallbackUser = {
              id: (session.user as any).id,
              email: session.user.email || '',
              name: session.user.name || 'User',
              role: (session.user as any).role || 'CUSTOMER',
              image: session.user.image || null,
              phone: null,
              createdAt: new Date()
            }
            setUser(fallbackUser)
            
            if ((session.user as any).token) {
              localStorage.setItem('token', (session.user as any).token)
            }
          }
        } catch (error) {
          console.error('Error syncing session:', error)
        }
      } else if (status === 'unauthenticated') {
        // Clear user from store if logged out
        setUser(null)
        localStorage.removeItem('token')
      }
    }

    syncSession()
  }, [session, status, setUser])

  return null
}
