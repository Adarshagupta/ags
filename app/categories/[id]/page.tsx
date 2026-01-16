'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import SkeletonLoader from '@/components/SkeletonLoader'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import ProductCard from '@/components/ProductCard'

interface Category {
  id: string
  name: string
  emoji: string
  image?: string
  type: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  isVeg: boolean
  discount: number
  prepTime: number
  categoryId: string
}

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategoryAndProducts()
  }, [id])

  const fetchCategoryAndProducts = async () => {
    try {
      // Fetch category details
      const categoryRes = await fetch(`/api/categories/${id}`)
      if (categoryRes.ok) {
        const categoryData = await categoryRes.json()
        setCategory(categoryData)
      }

      // Fetch products in this category
      const productsRes = await fetch(`/api/products?categoryId=${id}`)
      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData.products || [])
      }
    } catch (error) {
      console.error('Error fetching category data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <SkeletonLoader variant="grid" count={8} />
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col items-center justify-center h-96">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Category not found</h2>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 py-2 rounded-full font-medium shadow-md"
          >
            Go Home
          </button>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      <Header />
      
      {/* Category Header */}
      <div className="bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600 px-4 pt-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-pink-100 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-4">
            {category.image ? (
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-sm shadow-lg flex-shrink-0">
                <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm shadow-lg flex items-center justify-center flex-shrink-0">
                <span className="text-3xl">{category.emoji || '🎁'}</span>
              </div>
            )}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{category.name}</h1>
              <p className="text-pink-100 mt-1">{products.length} {products.length === 1 ? 'product' : 'products'} available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6">
        {products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <div className="text-7xl mb-4">📦</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h2>
            <p className="text-gray-600 mb-6">Check back soon for new items in this category</p>
            <button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg"
            >
              Browse All Products
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
