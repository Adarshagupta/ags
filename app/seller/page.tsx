'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  totalProducts: number
  activeProducts: number
  totalOrders: number
  pendingOrders: number
  totalRevenue: number
  thisMonthRevenue: number
}

export default function SellerDashboard() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/seller/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  return (
    <div className="px-4 py-4 md:py-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-gray-600 text-sm md:text-base">Here's your store overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <StatCard
          title="Products"
          value={stats?.totalProducts || 0}
          subtitle={`${stats?.activeProducts || 0} active`}
          icon="📦"
          onClick={() => router.push('/seller/products')}
        />
        <StatCard
          title="Orders"
          value={stats?.totalOrders || 0}
          subtitle={`${stats?.pendingOrders || 0} pending`}
          icon="🛒"
          onClick={() => router.push('/seller/orders')}
        />
        <StatCard
          title="Revenue"
          value={`₹${(stats?.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
          subtitle={`₹${(stats?.thisMonthRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })} this month`}
          icon="💰"
          className="col-span-2 lg:col-span-1"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/seller/products/new')}
            className="flex items-center gap-3 bg-gray-900 text-white p-4 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
          >
            <span className="text-2xl">➕</span>
            <div className="text-left">
              <div className="font-semibold">Add Product</div>
              <div className="text-xs text-gray-300">Create new listing</div>
            </div>
          </button>
          <button
            onClick={() => router.push('/seller/orders')}
            className="flex items-center gap-3 bg-white border-2 border-gray-900 text-gray-900 p-4 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            <span className="text-2xl">📋</span>
            <div className="text-left">
              <div className="font-semibold">View Orders</div>
              <div className="text-xs text-gray-600">Manage deliveries</div>
            </div>
          </button>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gray-50 border rounded-xl p-4 md:p-6">
        <div className="flex items-start gap-3">
          <span className="text-3xl">💡</span>
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">Seller Tips</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Keep your products updated with fresh images</li>
              <li>• Respond to orders within 2 hours for better ratings</li>
              <li>• Complete your profile for customer trust</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  onClick,
  className = '',
}: {
  title: string
  value: string | number
  subtitle: string
  icon: string
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-white border hover:border-gray-400 text-left rounded-xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all ${className}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="text-xs md:text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 break-words">{value}</p>
        </div>
        <div className="text-3xl md:text-4xl ml-2">{icon}</div>
      </div>
      <p className="text-xs text-gray-600 text-left">{subtitle}</p>
    </button>
  )
}
