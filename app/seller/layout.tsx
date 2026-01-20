'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'SELLER') {
      router.push('/login')
    }
  }, [status, session?.user?.role, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'SELLER') {
    return null
  }

  const navItems = [
    { href: '/seller', label: 'Dashboard', icon: '📊' },
    { href: '/seller/products', label: 'Products', icon: '📦' },
    { href: '/seller/orders', label: 'Orders', icon: '🛒' },
    { href: '/seller/profile', label: 'Profile', icon: '👤' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      {/* Desktop Header */}
      <nav className="hidden md:block bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold text-pink-600">🏪 Seller Hub</h1>
              <div className="flex space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'bg-pink-50 text-pink-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {session.user?.name}
              </span>
              <a
                href="/api/auth/signout"
                className="text-sm text-pink-600 hover:text-pink-700 font-medium"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-pink-600">🏪 Seller Hub</h1>
          <a
            href="/api/auth/signout"
            className="text-sm text-pink-600 hover:text-pink-700 font-medium"
          >
            Logout
          </a>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto md:py-6">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="grid grid-cols-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-2 text-xs font-medium transition-colors ${
                pathname === item.href
                  ? 'text-pink-600 bg-pink-50'
                  : 'text-gray-600'
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
