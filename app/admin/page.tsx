'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatPriceNoDecimals } from '@/lib/utils'

interface Stats {
  totalOrders: number
  totalRevenue: number
  totalProducts: number
  totalUsers: number
  recentOrders: Array<{
    id: string
    orderNumber: string
    total: number
    status: string
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-ink/55">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-ink">Dashboard</h1>
        <p className="text-ink/55 mt-1">Welcome to Upaharo Admin Panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        <div className="rounded-[22px] bg-white p-6 border border-wine/10 shadow-[0_24px_60px_-46px_rgba(43,29,34,0.5)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink/55 mb-1">Total Orders</p>
              <p className="font-display text-2xl md:text-3xl font-semibold text-ink">{stats?.totalOrders || 0}</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        <div className="rounded-[22px] bg-white p-6 border border-wine/10 shadow-[0_24px_60px_-46px_rgba(43,29,34,0.5)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink/55 mb-1">Total Revenue</p>
              <p className="font-display text-2xl md:text-3xl font-semibold text-ink">{formatPriceNoDecimals(stats?.totalRevenue || 0)}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="rounded-[22px] bg-white p-6 border border-wine/10 shadow-[0_24px_60px_-46px_rgba(43,29,34,0.5)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink/55 mb-1">Total Products</p>
              <p className="font-display text-2xl md:text-3xl font-semibold text-ink">{stats?.totalProducts || 0}</p>
            </div>
            <div className="text-4xl">🎁</div>
          </div>
        </div>

        <div className="rounded-[22px] bg-white p-6 border border-wine/10 shadow-[0_24px_60px_-46px_rgba(43,29,34,0.5)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink/55 mb-1">Total Users</p>
              <p className="font-display text-2xl md:text-3xl font-semibold text-ink">{stats?.totalUsers || 0}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-[22px] border border-wine/10">
        <div className="p-4 md:p-6 border-b border-wine/10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg md:text-xl font-semibold text-ink">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-wine hover:text-wine-deep font-semibold">
              View All →
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full">
            <thead className="bg-cream-deep/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-ink/55 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-ink/55 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-ink/55 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-ink/55 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wine/10">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-cream/60">
                    <td className="px-6 py-4 text-sm font-medium text-ink">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-ink">
                      {formatPriceNoDecimals(order.total || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-ink/55">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-ink/55">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y divide-wine/10">
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            stats.recentOrders.map((order) => (
              <div key={order.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-ink">{order.orderNumber}</div>
                  <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {order.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-ink/55">
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className="font-semibold text-ink">{formatPriceNoDecimals(order.total || 0)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-6 text-center text-ink/55">No orders yet</div>
          )}
        </div>
      </div>
    </div>
  )
}

