'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useCartStore } from '@/lib/store/cart'

interface Product {
  id: string
  name: string
  description: string
  category: string
  price: number
  image: string
  images: string[]
  imageAlt?: string
  isVeg: boolean
  prepTime: number
  tags: string[]
  discount: number
  isAvailable: boolean
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${id}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      id: product.id,
      name: product.name,
      price: product.price - (product.price * (product.discount || 0) / 100),
      image: product.image,
      isVeg: true,
      quantity
    })
    router.push('/cart')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  const allImages = [product.image, ...(product.images || [])].filter(Boolean)
  const finalPrice = product.price - (product.price * (product.discount || 0) / 100)

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      {/* Back button - Fixed overlay on mobile */}
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 z-50 lg:absolute lg:top-6 lg:left-6 w-10 h-10 lg:w-auto lg:h-auto bg-white/90 backdrop-blur-sm lg:bg-transparent rounded-full shadow-lg lg:shadow-none flex items-center justify-center lg:justify-start gap-2 text-gray-900 hover:bg-white lg:hover:bg-transparent transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden lg:inline">Back</span>
      </button>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Hero Image - Full width with overlapping thumbnails */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative w-full aspect-square bg-gradient-to-br from-pink-50 to-rose-50"
          >
            <Image
              src={allImages[selectedImage]}
              alt={product.imageAlt || product.name}
              fill
              className="object-cover"
              priority
            />
            {product.discount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg"
              >
                {product.discount}% OFF
              </motion.div>
            )}
          </motion.div>

          {/* Image Thumbnails - Overlapping bottom */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex gap-2 overflow-x-auto px-4 scrollbar-hide">
              {allImages.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all backdrop-blur-sm ${
                    selectedImage === idx ? 'border-pink-500 shadow-lg ring-2 ring-white' : 'border-white/80 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Product Content */}
        <div className="px-4 py-4 space-y-4">
          {/* Category & Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.isVeg && (
              <div className="w-4 h-4 border-2 border-green-600 flex items-center justify-center flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
              </div>
            )}
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{product.category}</span>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1 text-pink-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">{product.prepTime} mins</span>
            </div>
          </div>

          {/* Product Name */}
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-pink-600">₹{finalPrice.toFixed(2)}</span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
                <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                  Save ₹{(product.price - finalPrice).toFixed(2)}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-600 leading-relaxed">{product.description}</p>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, idx) => (
                <span key={idx} className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium border border-pink-100">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Fixed Bottom Bar with Quantity & Add to Cart */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 shadow-lg z-40">
          <div className="flex items-center gap-3">
            {/* Quantity Selector */}
            <div className="flex items-center bg-gray-50 rounded-lg p-1 gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-md bg-white text-gray-700 flex items-center justify-center font-bold shadow-sm border border-gray-200"
              >
                −
              </motion.button>
              <span className="text-base font-semibold w-8 text-center">{quantity}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-md bg-pink-500 text-white flex items-center justify-center font-bold shadow-sm"
              >
                +
              </motion.button>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={!product.isAvailable}
              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center gap-2"
            >
              {product.isAvailable ? (
                <>
                  <span>Add to Cart</span>
                  <span className="text-pink-100">•</span>
                  <span>₹{(finalPrice * quantity).toFixed(2)}</span>
                </>
              ) : (
                'Currently Unavailable'
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block max-w-7xl mx-auto px-8 py-6">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Images Section */}
          <div className="space-y-4">
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative aspect-square bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl overflow-hidden"
              >
                <Image
                  src={allImages[selectedImage]}
                  alt={product.imageAlt || product.name}
                  fill
                  className="object-cover"
                  priority
                />
                {product.discount > 0 && (
                  <div className="absolute top-6 right-6 bg-red-500 text-white px-4 py-2 rounded-full text-base font-bold shadow-lg">
                    {product.discount}% OFF
                  </div>
                )}
              </motion.div>

              {/* Image Thumbnails - Overlapping bottom */}
              {allImages.length > 1 && (
                <div className="absolute bottom-6 left-6 right-6 flex gap-3">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all backdrop-blur-sm ${
                        selectedImage === idx ? 'border-pink-500 shadow-lg ring-2 ring-white scale-105' : 'border-white/80 opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <Image src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center gap-2">
              {product.isVeg && (
                <div className="w-5 h-5 border-2 border-green-600 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                </div>
              )}
              <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">{product.category}</span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 leading-tight">{product.name}</h1>

            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-pink-600">₹{finalPrice.toFixed(2)}</span>
              {product.discount > 0 && (
                <>
                  <span className="text-2xl text-gray-400 line-through">₹{product.price.toFixed(2)}</span>
                  <span className="text-base font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                    Save ₹{(product.price - finalPrice).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 text-lg leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-2 text-pink-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Prep time: {product.prepTime} mins</span>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, idx) => (
                  <span key={idx} className="px-4 py-2 bg-pink-50 text-pink-700 rounded-full text-sm font-medium border border-pink-100">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-6 pt-4">
              <span className="text-base font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center bg-gray-50 rounded-lg p-1 gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-md bg-white text-gray-700 flex items-center justify-center font-bold shadow-sm border border-gray-200 hover:bg-gray-50"
                >
                  −
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-md bg-pink-500 text-white flex items-center justify-center font-bold shadow-sm hover:bg-pink-600"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={!product.isAvailable}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-4 rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg text-lg"
            >
              {product.isAvailable ? `Add to Cart • ₹${(finalPrice * quantity).toFixed(2)}` : 'Currently Unavailable'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}
