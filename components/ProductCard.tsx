'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: {
    id: string
    name: string
    description: string
    price: number
    image: string
    isVeg: boolean
    discount?: number | null
    prepTime: number
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, items, updateQuantity } = useCartStore()
  const cartItem = items.find((item) => item.id === product.id)
  const quantity = cartItem?.quantity || 0

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      isVeg: product.isVeg,
    })
  }

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1)
  }

  const handleDecrement = () => {
    updateQuantity(product.id, quantity - 1)
  }

  const discountedPrice = product.discount
    ? product.price - (product.price * product.discount) / 100
    : product.price

  return (
    <Link href={`/products/${product.id}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.98 }}
        className="bg-white rounded-xl overflow-hidden border border-gray-100 cursor-pointer"
      >
      <div className="relative aspect-square w-full">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        
        {/* Veg/Non-veg badge */}
        <div className="absolute top-2 left-2">
          <div
            className={`w-5 h-5 border-2 ${
              product.isVeg ? 'border-green-600' : 'border-red-600'
            } flex items-center justify-center bg-white rounded`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                product.isVeg ? 'bg-green-600' : 'bg-red-600'
              }`}
            />
          </div>
        </div>

        {/* Discount badge */}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-0.5 rounded text-xs font-bold">
            {product.discount}% OFF
          </div>
        )}

        {/* Prep time */}
        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
          <span>⏱️</span>
          <span>{product.prepTime}m</span>
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mb-2 line-clamp-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            {product.discount && product.discount > 0 ? (
              <div className="flex items-center gap-1">
                <span className="text-base font-bold text-gray-900">
                  {formatPrice(discountedPrice)}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-base font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {quantity === 0 ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleAdd}
              className="bg-orange-500 text-white px-3 py-1.5 rounded-lg font-semibold text-xs shadow-sm active:shadow-none"
            >
              ADD
            </motion.button>
          ) : (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 bg-orange-500 text-white rounded-lg"
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleDecrement}
                className="px-2 py-1 font-bold"
              >
                −
              </motion.button>
              <span className="font-semibold text-sm min-w-[16px] text-center">{quantity}</span>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleIncrement}
                className="px-2 py-1 font-bold"
              >
                +
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
    </Link>
  )
}
