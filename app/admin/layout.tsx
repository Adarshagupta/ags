'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUserStore } from '@/lib/store/user'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { user, _hasHydrated } = useUserStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!_hasHydrated) return
    
    if (mounted && (!user || user.role !== 'ADMIN')) {
      router.push('/login')
    }
  }, [mounted, user, router, _hasHydrated])

  if (!mounted || !_hasHydrated || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    )
  }

  const menuItems = [
    { icon: '📊', label: 'Dashboard', href: '/admin' },
    { icon: '🖼️', label: 'Banners', href: '/admin/banners' },
    { icon: '🎁', label: 'Products', href: '/admin/products' },
    { icon: '📂', label: 'Categories', href: '/admin/categories' },
    { icon: '📦', label: 'Orders', href: '/admin/orders' },
    { icon: '👥', label: 'Users', href: '/admin/users' },
    { icon: '�', label: 'Sellers', href: '/admin/sellers' },
    { icon: '�🎀', label: 'Gift Wraps', href: '/admin/gift-wraps' },
    { icon: '🎉', label: 'Occasions', href: '/admin/occasions' },
    { icon: '⚙️', label: 'Settings', href: '/admin/settings' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                🎁 AGS Admin
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name || 'Admin'}</span>
              <Link href="/" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                View Site →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
