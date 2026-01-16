'use client'

import { useEffect, useState } from 'react'

interface Address {
  label: string
  street: string
  apartment?: string
  landmark?: string
  city: string
  state: string
  pincode: string
  latitude: number
  longitude: number
}

interface Order {
  id: string
  orderNumber: string
  userId: string
  total: number
  status: 'PENDING' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  deliveryDate: string
  createdAt: string
  user: {
    name: string
    email: string
    phone: string | null
  }
  address: Address | null
  items: {
    id: string
    quantity: number
    price: number
    product: {
      name: string
      image: string
    }
  }[]
}

const STATUS_OPTIONS = ['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']
const PAYMENT_STATUS_OPTIONS = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        fetchOrders()
        if (selectedOrder?.id === orderId) {
          const updated = await res.json()
          setSelectedOrder(updated)
        }
      }
    } catch (error) {
      console.error('Error updating order:', error)
    }
  }

  const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus })
      })
      if (res.ok) {
        fetchOrders()
        if (selectedOrder?.id === orderId) {
          const updated = await res.json()
          setSelectedOrder(updated)
        }
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-700',
      ACCEPTED: 'bg-blue-100 text-blue-700',
      PREPARING: 'bg-purple-100 text-purple-700',
      READY: 'bg-cyan-100 text-cyan-700',
      OUT_FOR_DELIVERY: 'bg-indigo-100 text-indigo-700',
      DELIVERED: 'bg-green-100 text-green-700',
      CANCELLED: 'bg-red-100 text-red-700',
      COMPLETED: 'bg-green-100 text-green-700',
      FAILED: 'bg-red-100 text-red-700',
      REFUNDED: 'bg-gray-100 text-gray-700',
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">Manage customer orders and deliveries</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by order number, customer name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Delivery</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900">{order.user.name}</div>
                      <div className="text-xs text-gray-500">{order.user.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      {order.address ? (
                        <div className="max-w-[200px]">
                          <div className="font-medium text-gray-900 text-sm truncate">📍 {order.address.city}</div>
                          <div className="text-xs text-gray-500 truncate">{order.address.street}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No address</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900">₹{(order.total || 0).toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{order.items.length} items</div>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded font-medium cursor-pointer ${getStatusColor(order.status)}`}
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded font-medium cursor-pointer ${getStatusColor(order.paymentStatus)}`}
                      >
                        {PAYMENT_STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-900">{new Date(order.deliveryDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <p className="text-gray-600">{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Customer Information</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                  <p className="text-gray-900"><span className="font-medium">Name:</span> {selectedOrder.user.name}</p>
                  <p className="text-gray-900"><span className="font-medium">Email:</span> {selectedOrder.user.email}</p>
                  {selectedOrder.user.phone && (
                    <p className="text-gray-900"><span className="font-medium">Phone:</span> {selectedOrder.user.phone}</p>
                  )}
                </div>
              </div>

              {/* Delivery Address with Map */}
              {selectedOrder.address && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Delivery Address</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="text-2xl">📍</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{selectedOrder.address.label}</p>
                        <p className="text-gray-700">{selectedOrder.address.street}</p>
                        {selectedOrder.address.apartment && (
                          <p className="text-gray-600 text-sm">Apt: {selectedOrder.address.apartment}</p>
                        )}
                        {selectedOrder.address.landmark && (
                          <p className="text-gray-600 text-sm">Landmark: {selectedOrder.address.landmark}</p>
                        )}
                        <p className="text-gray-700">
                          {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}
                        </p>
                      </div>
                    </div>
                    {/* Google Maps Embed */}
                    {selectedOrder.address.latitude && selectedOrder.address.longitude && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-gray-200">
                        <iframe
                          width="100%"
                          height="200"
                          style={{ border: 0 }}
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                          src={`https://www.google.com/maps?q=${selectedOrder.address.latitude},${selectedOrder.address.longitude}&z=15&output=embed`}
                        />
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${selectedOrder.address.latitude},${selectedOrder.address.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-2 bg-blue-500 text-white text-center text-sm font-medium hover:bg-blue-600 transition-colors"
                        >
                          🧭 Get Directions
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                      <div className="text-2xl">🎁</div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.product.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.price.toFixed(2)}</p>
                      </div>
                      <p className="font-semibold text-gray-900">₹{(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-600">Delivery Date:</span>
                  <span className="text-gray-900">{new Date(selectedOrder.deliveryDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-600">Order Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium text-gray-600">Payment Status:</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedOrder.paymentStatus)}`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold border-t border-gray-200 pt-4">
                  <span>Total Amount:</span>
                  <span className="text-orange-600">₹{(selectedOrder.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
