'use client'

import { useEffect, useState } from 'react'
import ProductCard from '@/components/ProductCard'
import { getRecentViewedProductIds } from '@/lib/recommendation-session'

const MIN_VIEW_HISTORY_FOR_PERSONALIZATION = 3

type Product = {
  id: string
  name: string
  miniDescription?: string | null
  description: string
  price: number
  image: string
  isVeg: boolean
  showFoodTypeLabel?: boolean
  discount?: number | null
  prepTime: number
}

type Props = {
  initialProducts: Product[]
  initialTitle: string
  initialDescription: string
}

export default function HomeRecommendationSection({
  initialProducts,
  initialTitle,
  initialDescription,
}: Props) {
  const [products, setProducts] = useState(initialProducts)
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)

  useEffect(() => {
    const viewedProductIds = getRecentViewedProductIds()
    if (viewedProductIds.length < MIN_VIEW_HISTORY_FOR_PERSONALIZATION) return

    const controller = new AbortController()

    void fetch(`/api/recommendations/home?viewedProductIds=${encodeURIComponent(viewedProductIds.join(','))}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || !Array.isArray(data.products) || data.products.length === 0) {
          return
        }

        setProducts(data.products)
        setTitle(String(data.title || 'For You'))
        setDescription(
          data.category
            ? `Mostly based on what you viewed in ${data.category}, with a few other picks.`
            : initialDescription
        )
      })
      .catch(() => null)

    return () => controller.abort()
  }, [initialDescription, initialTitle])

  if (products.length === 0) {
    return null
  }

  return (
    <section id="latest" className="space-y-4">
      <div className="px-1">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {products.map((product) => (
          <div key={product.id} className="w-[172px] flex-shrink-0 sm:w-[210px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
