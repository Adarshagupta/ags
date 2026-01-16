'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'

interface GiftWrap {
  id: string
  name: string
  price: number
  type: string
  image: string
}

export default function CartPage() {
  const router = useRouter()
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems, clearCart, giftOptions, setGiftOptions } = useCartStore()
  const [giftWraps, setGiftWraps] = useState<GiftWrap[]>([])
  const [mounted, setMounted] = useState(false)
  const totalItems = getTotalItems()
  const subtotal = getTotalPrice()
  const selectedWrap = Array.isArray(giftWraps) ? giftWraps.find(w => w.id === giftOptions.giftWrapId) : null
  const giftWrapPrice = selectedWrap?.price || 0
  const deliveryFee = (subtotal + giftWrapPrice) > 199 ? 0 : 40
  const tax = (subtotal + giftWrapPrice) * 0.05
  const total = subtotal + giftWrapPrice + deliveryFee + tax

  useEffect(() => {
    setMounted(true)
    const fetchGiftWraps = async () => {
      try {
        const res = await fetch('/api/gift-wraps')
        if (res.ok) {
          const data = await res.json()
          setGiftWraps(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Error fetching gift wraps:', error)
      }
    }
    fetchGiftWraps()
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent mx-auto" />
        </div>
      </div>
    )
  }

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-white pb-20 lg:pb-0">
        <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Link href="/">
                <button className="p-2 -ml-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Your Cart</h1>
                <p className="text-xs text-gray-500">0 items</p>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-8xl mb-4"
            >
              🛍️
            </motion.div>
            <h1 className="text-xl font-bold text-gray-900 mb-6">Cart is empty</h1>
            <Link href="/">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg"
              >
                Browse Gifts
              </motion.button>
            </Link>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      {/* Page-Specific Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="p-2 -ml-2 hover:bg-gray-50 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Your Cart</h1>
              <p className="text-xs text-gray-500">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          <button
            onClick={() => clearCart()}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-4 py-3 sm:py-4">
        <div className="space-y-3">
          {/* Cart Items */}
          {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 lg:p-4 flex items-start space-x-3 border-b border-gray-100 last:border-0 active:bg-gray-50 transition-colors"
              >
                <div className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-semibold text-sm text-gray-900 truncate">{item.name}</h3>
                      <p className="text-pink-600 font-bold text-sm">{formatPrice(item.price)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 p-1 -mr-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-1">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="bg-white text-gray-700 w-7 h-7 rounded-md font-bold shadow-sm border border-gray-200 hover:bg-gray-50"
                      >
                        −
                      </motion.button>
                      <span className="font-semibold text-sm px-3 min-w-[2rem] text-center">{item.quantity}</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="bg-pink-500 text-white w-7 h-7 rounded-md font-bold shadow-sm hover:bg-pink-600"
                      >
                        +
                      </motion.button>
                    </div>
                    <p className="text-base font-bold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

          {/* Fixed Bottom Checkout Bar */}
          <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="text-xl font-bold text-pink-600">{formatPrice(total)}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/checkout')}
                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-8 py-3 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
              >
                Checkout
              </motion.button>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}
