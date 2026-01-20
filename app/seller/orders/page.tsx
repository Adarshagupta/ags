'use client'

import { useState, useEffect } from 'react'

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    id: string
    name: string
    image: string
  }
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  placedAt: string
  deliveredAt: string | null
  user: {
    name: string
    email: string
  }
  address: {
    street: string
    city: string
    state: string
    pincode: string
  } | null
  items: OrderItem[]
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/seller/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: 'bg-gray-100 text-gray-800',
      ACCEPTED: 'bg-gray-100 text-gray-800',
      PREPARING: 'bg-gray-100 text-gray-800',
      READY: 'bg-gray-100 text-gray-800',
      OUT_FOR_DELIVERY: 'bg-gray-100 text-gray-800',
      DELIVERED: 'bg-green-50 text-green-800',
      CANCELLED: 'bg-red-50 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter)

  return (
    <div className="px-4 py-4 md:py-6">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 text-sm">View orders containing your products</p>
      </div>

      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border'
          }`}
        >
          All ({orders.length})
        </button>
        <button
          onClick={() => setFilter('PENDING')}
          className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
            filter === 'PENDING'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border'
          }`}
        >
          Pending ({orders.filter(o => o.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setFilter('PREPARING')}
          className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
            filter === 'PREPARING'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border'
          }`}
        >
          Preparing ({orders.filter(o => o.status === 'PREPARING').length})
        </button>
        <button
          onClick={() => setFilter('DELIVERED')}
          className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
            filter === 'DELIVERED'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border'
          }`}
        >
          Delivered ({orders.filter(o => o.status === 'DELIVERED').length})
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {filter === 'all' 
              ? "You don't have any orders yet." 
              : `No ${filter.toLowerCase()} orders.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-4">
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">
                      #{order.orderNumber}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      {formatDate(order.placedAt)}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold self-start ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 text-xs mb-1">Customer</p>
                      <p className="font-medium text-gray-900">{order.user.name}</p>
                      <p className="text-gray-600 text-xs">{order.user.email}</p>
                    </div>
                    {order.address && (
                      <div>
                        <p className="text-gray-600 text-xs mb-1">Delivery Address</p>
                        <p className="font-medium text-gray-900 text-sm">
                          {order.address.street}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {order.address.city}, {order.address.state} - {order.address.pincode}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm font-medium text-gray-900 mb-3">Your Products</p>
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-12 w-12 md:h-14 md:w-14 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm font-semibold text-gray-900">
                            ₹{(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
