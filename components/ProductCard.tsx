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
      <div className="group bg-white rounded-[22px] overflow-hidden border border-wine/10 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-wine/20 hover:shadow-[0_26px_55px_-38px_rgba(124,42,71,0.85)] active:scale-[0.985]">
      <div className="relative aspect-square w-full overflow-hidden">
        {!imageLoaded ? <div className="absolute inset-0 animate-pulse bg-cream-deep" /> : null}
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          loading="lazy"
          quality={70}
          onLoad={() => setImageLoaded(true)}
          className={`object-cover transition-all duration-500 group-hover:scale-[1.05] ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        
        {/* Veg/Non-veg indicator */}
        {product.showFoodTypeLabel && (
          <div className="absolute top-2.5 left-2.5">
            <FoodTypeBadge isVeg={product.isVeg} />
          </div>
        )}

        {/* Discount badge */}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-2.5 right-2.5 bg-wine text-white px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide shadow-[0_10px_22px_-14px_rgba(124,42,71,0.9)]">
            {product.discount}% OFF
          </div>
        )}
      </div>

      <div className="p-3.5">
        <h3 className="font-display text-[15px] font-semibold text-ink mb-0.5 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-ink/40 mb-2.5 line-clamp-1">
          {cardDescription}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            {product.discount && product.discount > 0 ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[15px] font-semibold text-wine">
                  {formatPrice(discountedPrice)}
                </span>
                <span className="text-xs text-ink/35 line-through">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-[15px] font-semibold text-ink">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              className="bg-wine text-white px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-[0.08em] shadow-[0_12px_26px_-18px_rgba(124,42,71,0.9)] whitespace-nowrap transition hover:bg-wine-deep active:scale-95"
            >
              Add
            </button>
          ) : (
            <div className="flex items-center bg-wine text-white rounded-full shadow-[0_12px_26px_-18px_rgba(124,42,71,0.9)] overflow-hidden">
              <button
                onClick={handleDecrement}
                className="w-7 h-7 flex items-center justify-center text-sm font-bold leading-none transition hover:bg-wine-deep active:scale-90"
              >
                −
              </button>
              <span className="text-[12px] font-semibold px-0.5 min-w-[16px] text-center">{quantity}</span>
              <button
                onClick={handleIncrement}
                className="w-7 h-7 flex items-center justify-center text-sm font-bold leading-none transition hover:bg-wine-deep active:scale-90"
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

