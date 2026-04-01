'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { resolveImageUrl } from '@/lib/image-url'
import FoodTypeBadge from '@/components/FoodTypeBadge'

interface ProductCardProps {
  product: {
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
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, items, updateQuantity } = useCartStore()
  const [imageLoaded, setImageLoaded] = useState(false)
  const cartItem = items.find((item) => item.id === product.id)
  const quantity = cartItem?.quantity || 0

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: imageUrl,
      isVeg: product.isVeg,
    })
  }

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateQuantity(product.id, quantity + 1)
  }

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    updateQuantity(product.id, quantity - 1)
  }

  const discountedPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price
  const cardDescription = String(product.miniDescription || product.description || '').trim()
  const imageUrl = resolveImageUrl(product.image)

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-xl overflow-hidden border border-neutral-100 cursor-pointer transition-transform active:scale-[0.985]">
      <div className="relative aspect-square w-full">
        {!imageLoaded ? <div className="absolute inset-0 animate-pulse bg-neutral-100" /> : null}
        <Image
          unoptimized
          src={imageUrl}
          alt={product.name}
          fill
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        
        {/* Veg/Non-veg indicator */}
        {product.showFoodTypeLabel && (
          <div className="absolute top-2 left-2">
            <FoodTypeBadge isVeg={product.isVeg} />
          </div>
        )}

        {/* Discount badge */}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white px-1.5 py-0.5 rounded text-[10px] font-medium shadow-md">
            {product.discount}% OFF
          </div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-medium text-sm text-neutral-900 mb-0.5 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-neutral-400 mb-2 line-clamp-1">
          {cardDescription}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            {product.discount && product.discount > 0 ? (
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-neutral-900">
                  {formatPrice(discountedPrice)}
                </span>
                <span className="text-xs text-neutral-400 line-through">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-semibold text-neutral-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="bg-gradient-to-r from-pink-500 to-rose-600 text-white px-4 py-1.5 rounded-lg text-xs font-medium shadow-sm whitespace-nowrap active:scale-95"
            >
              Add
            </button>
          ) : (
            <div className="flex items-center bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-lg shadow-sm overflow-hidden">
              <button
                onClick={handleDecrement}
                className="w-5 h-6 flex items-center justify-center text-sm font-bold leading-none active:scale-90"
              >
                −
              </button>
              <span className="text-[11px] font-semibold px-0.5 min-w-[14px] text-center">{quantity}</span>
              <button
                onClick={handleIncrement}
                className="w-5 h-6 flex items-center justify-center text-sm font-bold leading-none active:scale-90"
              >
                &#43;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </Link>
  )
}

