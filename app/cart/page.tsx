'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import BottomNav from '@/components/BottomNav'
import RecommendationShelf from '@/components/recommendations/RecommendationShelf'
import { getRecentViewedProductIds } from '@/lib/recommendation-session'
import { resolveImageUrl } from '@/lib/image-url'

interface RecommendationProduct {
  id: string
  name: string
  price: number
  image: string
  category: string
  discount: number
  isVeg: boolean
  isAvailable: boolean
}

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
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendationProduct[]>([])
  const [recommendationTitle, setRecommendationTitle] = useState('Related Products')
  const [mounted, setMounted] = useState(false)
  const totalItems = getTotalItems()
  const subtotal = getTotalPrice()
  const selectedWrap = Array.isArray(giftWraps) ? giftWraps.find(w => w.id === giftOptions.giftWrapId) : null
  const giftWrapPrice = selectedWrap?.price || 0
  const deliveryFee = (subtotal + giftWrapPrice) > 199 ? 0 : 40
  const tax = 0
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

  useEffect(() => {
    if (!mounted || items.length === 0) {
      setRecommendedProducts([])
      return
    }

    const fetchCartRecommendations = async () => {
      try {
        const productIds = Array.from(new Set(items.map((item) => item.id)))
        const viewedProductIds = getRecentViewedProductIds()
        const params = new URLSearchParams({
          productIds: productIds.join(','),
          viewedProductIds: viewedProductIds.join(','),
        })
        const response = await fetch(`/api/recommendations/cart?${params.toString()}`)
        if (!response.ok) return
        const data = await response.json()
        setRecommendedProducts(Array.isArray(data.products) ? data.products : [])
        setRecommendationTitle(String(data.title || 'Related Products'))
      } catch (error) {
        console.error('Error fetching cart recommendations:', error)
      }
    }

    void fetchCartRecommendations()
  }, [items, mounted])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-wine border-t-transparent mx-auto" />
        </div>
      </div>
    )
  }

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-cream pb-20 lg:pb-0">
        <div className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-wine/10">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Link href="/">
                <button className="p-2 -ml-2 hover:bg-cream-deep rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </Link>
              <div>
                <h1 className="font-display text-lg font-semibold text-ink">Your Cart</h1>
                <p className="text-xs text-ink/55">0 items</p>
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
            <h1 className="font-display text-xl font-semibold text-ink mb-6">Cart is empty</h1>
            <Link href="/">
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="bg-wine text-white px-8 py-3 rounded-full font-semibold shadow-[0_16px_34px_-22px_rgba(124,42,71,0.95)] hover:bg-wine-deep transition-colors"
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
    <div className="min-h-screen bg-cream pb-20 lg:pb-0">
      {/* Page-Specific Header */}
      <div className="sticky top-0 z-50 bg-cream/95 backdrop-blur border-b border-wine/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/">
              <button className="p-2 -ml-2 hover:bg-cream-deep rounded-lg transition-colors">
                <svg className="w-5 h-5 text-ink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </Link>
            <div>
              <h1 className="font-display text-lg font-semibold text-ink">Your Cart</h1>
              <p className="text-xs text-ink/55">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>
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
                className="p-3 lg:p-4 flex items-start space-x-3 border-b border-wine/10 last:border-0 active:bg-cream-deep/60 transition-colors"
              >
                <div className="relative h-20 w-20 flex-shrink-0 rounded-2xl overflow-hidden bg-cream-deep">
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
                      <h3 className="font-display font-semibold text-sm text-ink truncate">{item.name}</h3>
                      <p className="text-wine font-semibold text-sm">{formatPrice(item.price)}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-ink/40 hover:text-red-500 p-1 -mr-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2 bg-cream-deep rounded-full p-1">
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="bg-white text-wine w-7 h-7 rounded-full font-bold shadow-sm border border-wine/15 hover:bg-cream"
                      >
                        −
                      </motion.button>
                      <span className="font-semibold text-sm px-3 min-w-[2rem] text-center text-ink">{item.quantity}</span>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="bg-wine text-white w-7 h-7 rounded-full font-bold shadow-sm hover:bg-wine-deep"
                      >
                        +
                      </motion.button>
                    </div>
                    <p className="text-base font-semibold text-wine">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

          {recommendedProducts.length > 0 ? (
            <div className="pt-3 pb-28 lg:pb-20">
              <RecommendationShelf
                title={recommendationTitle}
                description="Add more items before checkout."
                products={recommendedProducts}
                actionLabel="Add"
                onAdd={(product) =>
                  useCartStore.getState().addItem({
                    id: product.id,
                    name: product.name,
                    price: product.price - product.price * ((product.discount || 0) / 100),
                    image: resolveImageUrl(product.image),
                    isVeg: product.isVeg,
                  })
                }
              />
            </div>
          ) : null}

          {/* Fixed Bottom Checkout Bar */}
          <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 bg-white border-t border-wine/10 px-4 py-3 shadow-[0_-12px_40px_-30px_rgba(43,29,34,0.5)] z-40">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-ink/55">Total Amount</p>
                <p className="text-xl font-semibold text-wine">{formatPrice(total)}</p>
              </div>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/checkout')}
                className="bg-wine text-white px-8 py-3 rounded-full font-semibold shadow-[0_16px_34px_-22px_rgba(124,42,71,0.95)] hover:bg-wine-deep transition-all"
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
