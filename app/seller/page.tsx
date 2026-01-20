'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

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
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-gray-600">Here's what's happening with your store today.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          subtitle={`${stats?.activeProducts || 0} active`}
          icon="📦"
          color="blue"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          subtitle={`${stats?.pendingOrders || 0} pending`}
          icon="🛒"
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
          subtitle={`₹${stats?.thisMonthRevenue?.toLocaleString() || 0} this month`}
          icon="💰"
          color="pink"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: string
  color: string
}) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    pink: 'bg-pink-50 border-pink-200',
  }

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  )
}

function QuickActions() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="space-y-3">
        <a
          href="/seller/products/new"
          className="block w-full bg-pink-600 text-white text-center py-3 px-4 rounded-lg hover:bg-pink-700 transition"
        >
          + Add New Product
        </a>
        <a
          href="/seller/products"
          className="block w-full bg-gray-100 text-gray-900 text-center py-3 px-4 rounded-lg hover:bg-gray-200 transition"
        >
          View All Products
        </a>
        <a
          href="/seller/orders"
          className="block w-full bg-gray-100 text-gray-900 text-center py-3 px-4 rounded-lg hover:bg-gray-200 transition"
        >
          View Orders
        </a>
      </div>
    </div>
  )
}

function RecentActivity() {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">✓</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">New order received</p>
            <p className="text-sm text-gray-500">2 minutes ago</p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">+</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Product added</p>
            <p className="text-sm text-gray-500">1 hour ago</p>
          </div>
        </div>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-sm">!</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">Low stock alert</p>
            <p className="text-sm text-gray-500">3 hours ago</p>
          </div>
        </div>
      </div>
    </div>
  )
}
