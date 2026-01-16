'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUserStore } from '@/lib/store/user'
import { useLocationStore } from '@/lib/store/location'
import Header from '@/components/Header'

interface Order {
  id: string
  createdAt: string
  status: string
  total: number
  items: any[]
}

interface SavedAddress {
  id: string
  label: string
  street: string
  apartment: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useUserStore()
  const { deliveryAddress } = useLocationStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'addresses'>('profile')

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }

    fetchUserData()
  }, [user, router])

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Fetch orders
      const ordersRes = await fetch('/api/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json()
        setOrders(ordersData.orders || [])
      }

      // Fetch saved addresses
      const addressesRes = await fetch('/api/addresses', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (addressesRes.ok) {
        const addressesData = await addressesRes.json()
        setAddresses(addressesData.addresses || [])
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-purple-100 text-purple-800'
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-primary to-orange-500 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-primary text-3xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{user.name}</h1>
                  <p className="text-orange-100">{user.email}</p>
                  <p className="text-orange-100">{user.phone}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                Logout
              </motion.button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-8">
              {[
                { id: 'profile', label: 'Profile', icon: '👤' },
                { id: 'orders', label: 'My Orders', icon: '📦' },
                { id: 'addresses', label: 'Addresses', icon: '📍' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-semibold transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm text-gray-600">Full Name</label>
                            <p className="text-gray-900 font-medium">{user.name}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600">Email</label>
                            <p className="text-gray-900 font-medium">{user.email}</p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600">Phone</label>
                            <p className="text-gray-900 font-medium">{user.phone}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Delivery Location</h3>
                        {deliveryAddress ? (
                          <div className="space-y-2">
                            <p className="text-primary font-semibold">{deliveryAddress.label}</p>
                            <p className="text-gray-900">{deliveryAddress.address}</p>
                          </div>
                        ) : (
                          <p className="text-gray-500">No delivery location set</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-3xl font-bold text-primary">{orders.length}</p>
                          <p className="text-sm text-gray-600">Total Orders</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-green-600">
                            {orders.filter(o => o.status === 'DELIVERED').length}
                          </p>
                          <p className="text-sm text-gray-600">Delivered</p>
                        </div>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-orange-600">{addresses.length}</p>
                          <p className="text-sm text-gray-600">Saved Addresses</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    {orders.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-600 mb-4">Start ordering your favorite meals!</p>
                        <Link href="/">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                          >
                            Browse Menu
                          </motion.button>
                        </Link>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <Link key={order.id} href={`/orders/${order.id}`}>
                          <motion.div
                            whileHover={{ scale: 1.01 }}
                            className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <p className="text-sm text-gray-600">Order #{order.id.slice(0, 8)}</p>
                                <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                {order.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-gray-900">
                                {order.items?.length || 0} items
                              </p>
                              <p className="text-lg font-bold text-gray-900">₹{order.total}</p>
                            </div>
                          </motion.div>
                        </Link>
                      ))
                    )}
                  </motion.div>
                )}

                {/* Addresses Tab */}
                {activeTab === 'addresses' && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    {addresses.length === 0 ? (
                      <div className="text-center py-12">
                        <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved addresses</h3>
                        <p className="text-gray-600">Add a delivery address to get started</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((address) => (
                          <motion.div
                            key={address.id}
                            whileHover={{ scale: 1.02 }}
                            className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200 hover:border-primary transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-2xl">
                                  {address.label === 'Home' ? '🏠' : address.label === 'Work' ? '💼' : '📍'}
                                </span>
                                <h4 className="font-bold text-gray-900">{address.label}</h4>
                              </div>
                              {address.isDefault && (
                                <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">Default</span>
                              )}
                            </div>
                            <p className="text-gray-900 text-sm mb-1">{address.street}</p>
                            {address.apartment && (
                              <p className="text-gray-900 text-sm mb-1">{address.apartment}</p>
                            )}
                            <p className="text-gray-600 text-sm">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
