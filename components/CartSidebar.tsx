'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'

export default function CartSidebar() {
  const [mounted, setMounted] = useState(false)
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCartStore()
  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || totalItems === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white shadow-2xl border-t-2 border-primary md:hidden"
    >
      <div className="px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm text-gray-600">{totalItems} items</p>
            <p className="text-xl font-bold text-gray-900">{formatPrice(totalPrice)}</p>
          </div>
          <Link href="/cart">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark smooth-transition flex items-center space-x-2"
            >
              <span>View Cart</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
