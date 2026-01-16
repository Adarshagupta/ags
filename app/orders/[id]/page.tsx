'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/components/Header'
import SkeletonLoader from '@/components/SkeletonLoader'
import { useUserStore } from '@/lib/store/user'
import { formatPrice } from '@/lib/utils'

const orderStatuses = [
  { key: 'PENDING', label: 'Order Placed', icon: '📝' },
  { key: 'ACCEPTED', label: 'Accepted', icon: '✅' },
  { key: 'PREPARING', label: 'Preparing', icon: '👨‍🍳' },
  { key: 'READY', label: 'Ready', icon: '📦' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🚀' },
  { key: 'DELIVERED', label: 'Delivered', icon: '🎉' },
]

export default function OrderTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { user, _hasHydrated } = useUserStore()
  const [order, setOrder] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Wait for session to load
    if (status === 'loading' || !_hasHydrated) return

    // Redirect to login if not authenticated
    if (status === 'unauthenticated' || !user) {
      router.push('/login')
      return
    }

    fetchOrder()
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchOrder, 5000)
    return () => clearInterval(interval)
  }, [params.id, status, user, _hasHydrated])

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('token') || (session?.user as any)?.token
      const response = await fetch(`/api/orders/${params.id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      const data = await response.json()
      if (response.ok) {
        setOrder(data.order)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          <SkeletonLoader variant="order" />
          <SkeletonLoader variant="text" count={3} />
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order not found</h1>
          <p className="text-gray-600">The order you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const currentStatusIndex = orderStatuses.findIndex((s) => s.key === order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Order Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-gray-600">{new Date(order.placedAt).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-primary">{formatPrice(order.total)}</p>
            </div>
          </div>

          {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-3xl"
              >
                🚀
              </motion.div>
              <div className="flex-1">
                <p className="font-semibold text-green-900">On the way!</p>
                <p className="text-sm text-green-700">Estimated arrival in {order.estimatedTime} minutes</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Order Status Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6">Order Status</h2>
          
          <div className="space-y-4">
            {orderStatuses.map((status, index) => {
              const isCompleted = index <= currentStatusIndex
              const isCurrent = index === currentStatusIndex
              
              return (
                <motion.div
                  key={status.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-4"
                >
                  <div className="relative">
                    <motion.div
                      animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                        isCompleted
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {status.icon}
                    </motion.div>
                    {index < orderStatuses.length - 1 && (
                      <div
                        className={`absolute top-12 left-6 w-0.5 h-12 ${
                          isCompleted ? 'bg-primary' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                      {status.label}
                    </p>
                    {isCurrent && (
                      <p className="text-sm text-primary font-semibold">In Progress</p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Delivery Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Address</h2>
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-gray-900">{order.address.label}</p>
              <p className="text-gray-600">{order.address.street}</p>
              {order.address.apartment && (
                <p className="text-gray-600">{order.address.apartment}</p>
              )}
              <p className="text-gray-600">
                {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-5 h-5 border-2 ${
                      item.product.isVeg ? 'border-green-600' : 'border-red-600'
                    } flex items-center justify-center rounded`}
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        item.product.isVeg ? 'bg-green-600' : 'bg-red-600'
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.product.name}</p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span>{formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
