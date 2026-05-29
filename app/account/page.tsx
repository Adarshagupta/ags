'use client'

import { useState, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import { useUserStore } from '@/lib/store/user'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const router = useRouter()
  const { user, logout, _hasHydrated } = useUserStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    logout()
    await signOut({ redirect: false })
    router.push('/')
  }

  if (!mounted || !_hasHydrated) {
    return null
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream pb-20 lg:pb-0">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <div className="text-7xl mb-4">👤</div>
          <h2 className="font-display text-lg font-semibold text-ink mb-6">Login to continue</h2>
          <button
            onClick={() => router.push('/login')}
            className="bg-wine text-white px-8 py-3 rounded-full font-semibold text-sm shadow-[0_16px_34px_-22px_rgba(124,42,71,0.95)] hover:bg-wine-deep transition-colors"
          >
            Login
          </button>
        </div>
        <BottomNav />
      </div>
    )
  }

  const menuItems = [
    { icon: '👤', title: 'Profile', subtitle: 'Edit your personal details', href: '/profile' },
    { icon: '📍', title: 'Addresses', subtitle: 'Manage delivery addresses', href: '/addresses' },
    { icon: '🎁', title: 'Gift Recipients', subtitle: 'Manage saved recipients', href: '/recipients' },
    { icon: '💳', title: 'Payment Methods', subtitle: 'Saved cards & wallets', href: '/payments' },
    { icon: '❤️', title: 'Favorites', subtitle: 'Your liked products', href: '/favorites' },
    { icon: '🎫', title: 'Offers & Coupons', subtitle: 'Available discounts', href: '/offers' },
    { icon: '⚙️', title: 'Settings', subtitle: 'App preferences', href: '/settings' },
    { icon: '💬', title: 'Help & Support', subtitle: 'Contact us', href: '/support' },
  ]

  return (
    <div className="min-h-screen bg-cream pb-20 lg:pb-0">
      <Header />
      
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* User Info Card */}
        <div className="bg-gradient-to-br from-wine to-wine-deep rounded-[22px] p-6 mb-6 text-white shadow-[0_24px_60px_-40px_rgba(124,42,71,0.9)]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center font-display text-3xl backdrop-blur-sm">
              {user.name?.charAt(0).toUpperCase() || '👤'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl font-semibold truncate">{user?.name || 'User'}</h2>
              <p className="text-cream/90 text-sm truncate">{user?.email || ''}</p>
              <p className="text-cream/80 text-xs mt-1">{user?.phone || ''}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-[22px] overflow-hidden border border-wine/10 shadow-[0_24px_60px_-46px_rgba(43,29,34,0.5)]">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => router.push(item.href)}
              className="w-full flex items-center gap-4 p-4 hover:bg-cream transition-colors border-b last:border-b-0 border-wine/10"
            >
              <div className="w-10 h-10 bg-rose-soft rounded-full flex items-center justify-center text-xl shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 text-left min-w-0">
                <h3 className="font-display font-semibold text-ink truncate">{item.title}</h3>
                <p className="text-sm text-ink/55 truncate">{item.subtitle}</p>
              </div>
              <svg className="w-5 h-5 text-wine/40 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 bg-white border-2 border-red-500 text-red-500 py-3 rounded-full font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <span>🚪</span>
          Logout
        </button>

        {/* App Info */}
        <div className="mt-6 text-center text-sm text-ink/55">
          <p>Upaharo - Gift Shopping App</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
