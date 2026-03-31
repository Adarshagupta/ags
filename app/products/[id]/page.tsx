'use client'

import { use, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Header from '@/components/Header'
import SkeletonLoader from '@/components/SkeletonLoader'
import { useCartStore } from '@/lib/store/cart'
import { resolveImageUrl } from '@/lib/image-url'
import FoodTypeBadge from '@/components/FoodTypeBadge'
import RecommendationShelf from '@/components/recommendations/RecommendationShelf'
import { getOrCreateRecommendationSessionId, rememberViewedProduct } from '@/lib/recommendation-session'
import { renderProductDescriptionMarkdown } from '@/lib/markdown-description'
import { extractSubProductIdsFromTags, stripSubProductTags } from '@/lib/product-subproducts'
import { formatPriceNoDecimals, formatTime } from '@/lib/utils'

interface ProductVariant {
  color: string
  size: string
  image: string
  price?: number
}

interface Product {
  id: string
  name: string
  miniDescription?: string | null
  description: string
  category: string
  price: number
  image: string
  images: string[]
  variants?: ProductVariant[]
  imageAlt?: string
  isVeg: boolean
  showFoodTypeLabel?: boolean
  prepTime: number
  tags: string[]
  discount: number
  isAvailable: boolean
}

interface RecommendationProduct {
  id: string
  name: string
  category: string
  price: number
  image: string
  discount: number
  isVeg: boolean
  isAvailable: boolean
}

function normalizeVariants(input: unknown): ProductVariant[] {
  if (!Array.isArray(input)) return []

  return input
    .map((raw) => {
      const variant = raw as ProductVariant
      const color = String(variant?.color || '').trim()
      const size = String(variant?.size || '').trim()
      const image = String(variant?.image || '').trim()
      const price = Number(variant?.price)

      if (!image || (!color && !size)) return null
      return {
        color,
        size,
        image,
        ...(Number.isFinite(price) && price >= 0 ? { price } : {}),
      }
    })
    .filter((variant): variant is ProductVariant => Boolean(variant))
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [addons, setAddons] = useState<RecommendationProduct[]>([])
  const [buyTogether, setBuyTogether] = useState<RecommendationProduct[]>([])
  const [relatedProducts, setRelatedProducts] = useState<RecommendationProduct[]>([])
  const [subProducts, setSubProducts] = useState<RecommendationProduct[]>([])
  const addItem = useCartStore((state) => state.addItem)
  const totalCartItems = useCartStore((state) => state.getTotalItems())
  const [cartToastMessage, setCartToastMessage] = useState('')
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    void fetchProductData()
    setSelectedImage(0)
    setSelectedVariantIndex(null)
  }, [id])

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  const fetchProductData = async () => {
    try {
      const res = await fetch(`/api/products/${id}`)
      if (res.ok) {
        const data = await res.json()
        setProduct(data)

        const viewedProductIds = rememberViewedProduct(String(id))
        const sessionId = getOrCreateRecommendationSessionId()

        void fetch(`/api/products/${id}/view`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        }).catch(() => null)

        const recommendationsRes = await fetch(
          `/api/products/${id}/recommendations?viewedProductIds=${encodeURIComponent(viewedProductIds.join(','))}`
        )
        if (recommendationsRes.ok) {
          const recommendations = await recommendationsRes.json()
          setBuyTogether(Array.isArray(recommendations.buyTogether) ? recommendations.buyTogether : [])
          setAddons(Array.isArray(recommendations.addons) ? recommendations.addons : [])
          setRelatedProducts(Array.isArray(recommendations.related) ? recommendations.related : [])
        } else {
          setBuyTogether([])
          setAddons([])
          setRelatedProducts([])
        }

        const subProductIds = extractSubProductIdsFromTags(data.tags)
        if (subProductIds.length > 0) {
          const subProductsRes = await fetch(`/api/products?ids=${encodeURIComponent(subProductIds.join(','))}&limit=12`)
          if (subProductsRes.ok) {
            const subProductsData = await subProductsRes.json()
            const list = Array.isArray(subProductsData.products) ? subProductsData.products : []
            setSubProducts(list.filter((item: RecommendationProduct) => item.id !== String(id)))
          }
        } else {
          setSubProducts([])
        }
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

  const showAddedToCartToast = (message: string) => {
    setCartToastMessage(message)
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
    }
    toastTimeoutRef.current = setTimeout(() => setCartToastMessage(''), 1500)
  }

  const handleAddToCart = () => {
    if (!product) return
    const selectedVariantPrice =
      selectedVariant && typeof selectedVariant.price === 'number'
        ? selectedVariant.price
        : product.price - (product.price * (product.discount || 0) / 100)
    const variantLabel = selectedVariant ? [selectedVariant.color, selectedVariant.size].filter(Boolean).join(' / ') : ''
    addItem({
      id: product.id,
      name: variantLabel ? `${product.name} (${variantLabel})` : product.name,
      price: selectedVariantPrice,
      image: resolveImageUrl(selectedVariant?.image || product.image),
      isVeg: product.isVeg,
      quantity
    })
    showAddedToCartToast('Added to cart')
  }

  const handleQuickAddRecommendation = (item: RecommendationProduct) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price - item.price * ((item.discount || 0) / 100),
      image: resolveImageUrl(item.image),
      isVeg: item.isVeg,
    })
    showAddedToCartToast('Added to cart')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white pb-20 lg:pb-0">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-6">
          <SkeletonLoader variant="product" />
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  const allImages = [product.image, ...(product.images || [])].filter(Boolean)
  const variants = normalizeVariants(product.variants).map((variant) => ({
    ...variant,
    image: resolveImageUrl(variant.image),
  }))
  const selectedVariant = selectedVariantIndex !== null ? variants[selectedVariantIndex] : null
  const resolvedAllImages = allImages.map((img) => resolveImageUrl(String(img || ''))).filter(Boolean)
  const galleryImages = Array.from(
    new Set([...(selectedVariant?.image ? [selectedVariant.image] : []), ...resolvedAllImages])
  )
  const activeImage = galleryImages[Math.min(selectedImage, Math.max(0, galleryImages.length - 1))]
  const basePrice = product.price - (product.price * (product.discount || 0) / 100)
  const finalPrice = typeof selectedVariant?.price === 'number' ? selectedVariant.price : basePrice
  const descriptionHtml = renderProductDescriptionMarkdown(product.description)
  const miniDescription = String(product.miniDescription || '').trim()
  const visibleTags = stripSubProductTags(product.tags)

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      {/* Header - Desktop only */}
      <div className="hidden lg:block">
        <Header />
      </div>
      
      {/* Back button - Fixed overlay on mobile */}
      <button
        onClick={() => router.back()}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-900 hover:bg-white transition-colors"
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
            <Image unoptimized src={activeImage}
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
          {galleryImages.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex gap-2 overflow-x-auto px-4 scrollbar-hide">
              {galleryImages.map((img, idx) => (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all backdrop-blur-sm ${
                    selectedImage === idx ? 'border-pink-500 shadow-lg ring-2 ring-white' : 'border-white/80 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image unoptimized src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Product Content */}
        <div className="px-4 py-4 space-y-4">
          {/* Category & Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            {product.showFoodTypeLabel && <FoodTypeBadge isVeg={product.isVeg} />}
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{product.category}</span>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1 text-pink-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-xs font-medium">{formatTime(product.prepTime)}</span>
            </div>
          </div>

          {/* Product Name */}
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>

          {miniDescription ? <p className="text-sm text-gray-600">{miniDescription}</p> : null}

          {variants.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wider">Variants</p>
              <div className="flex gap-2 overflow-x-auto pb-1 pr-1 scrollbar-hide">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedVariantIndex(null)
                    setSelectedImage(0)
                  }}
                  className={`w-40 flex-shrink-0 rounded-xl border p-2 text-left transition-colors ${
                    selectedVariantIndex === null
                      ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-300'
                      : 'border-gray-300 bg-white hover:border-pink-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={resolveImageUrl(product.image)}
                      alt={product.name}
                      className="h-11 w-11 flex-shrink-0 rounded-lg border border-gray-200 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-gray-900">{product.name}</p>
                      <p className="text-[11px] text-pink-600">{formatPriceNoDecimals(basePrice)}</p>
                    </div>
                  </div>
                </button>
                {variants.map((variant, index) => {
                  const label = [variant.color, variant.size].filter(Boolean).join(' / ') || `Variant ${index + 1}`
                  return (
                    <button
                      key={`${label}-${index}`}
                      type="button"
                      onClick={() => {
                        setSelectedVariantIndex((prev) => (prev === index ? null : index))
                        setSelectedImage(0)
                      }}
                      className={`w-40 flex-shrink-0 rounded-xl border p-2 text-left transition-colors ${
                        selectedVariantIndex === index
                          ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-300'
                          : 'border-gray-300 bg-white hover:border-pink-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={variant.image}
                          alt={label}
                          className="h-11 w-11 flex-shrink-0 rounded-lg border border-gray-200 object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-900">{label}</p>
                          {typeof variant.price === 'number' ? (
                            <p className="text-[11px] text-pink-600">{formatPriceNoDecimals(variant.price)}</p>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tags */}
          {visibleTags.length > 0 && (
            <div className="flex gap-1.5 overflow-x-auto whitespace-nowrap pb-1 pr-1 scrollbar-hide">
              {visibleTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="flex-shrink-0 px-2.5 py-0.5 bg-pink-50 text-pink-700 rounded-full text-[11px] font-medium border border-pink-100"
                >
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
                  <span>Rs. {(finalPrice * quantity).toFixed(2)}</span>
                </>
              ) : (
                'Currently Unavailable'
              )}
            </motion.button>
          </div>
        </div>

        {/* Add-ons Section */}
        {addons.length > 0 && (
          <div className="px-4 py-6 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Add Extra Love 💝</h2>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {addons.map((addon) => (
                <motion.div
                  key={addon.id}
                  whileTap={{ scale: 0.95 }}
                  className="flex-shrink-0 w-32 bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  <div className="relative h-32 bg-gray-100">
                    <Image unoptimized src={resolveImageUrl(addon.image)} alt={addon.name} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleQuickAddRecommendation(addon)
                      }}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-pink-600 text-white shadow-md transition hover:bg-pink-700"
                      aria-label={`Add ${addon.name} to cart`}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 5v14m7-7H5" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold text-gray-900 truncate">{addon.name}</p>
                    <p className="text-sm font-bold text-pink-600">
                      {formatPriceNoDecimals(addon.price - addon.price * ((addon.discount || 0) / 100))}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="px-4 py-6 pb-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">You May Also Like</h2>
              <div className="w-12 h-1 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full"></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => router.push(`/products/${relatedProduct.id}`)}
                  className="group bg-white rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-44 bg-white overflow-hidden">
                    <Image unoptimized src={resolveImageUrl(relatedProduct.image)} 
                      alt={relatedProduct.name} 
                      fill 
                      className="object-contain group-hover:scale-105 transition-transform duration-500" 
                    />
                    {relatedProduct.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
                        {relatedProduct.discount}% OFF
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] leading-tight">{relatedProduct.name}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Rs. {(relatedProduct.price - (relatedProduct.price * (relatedProduct.discount || 0) / 100)).toFixed(2)}</span>
                        {relatedProduct.discount > 0 && (
                          <span className="text-xs text-gray-400 line-through">Rs. {relatedProduct.price}</span>
                        )}
                      </div>
                      <motion.div
                        whileHover={{ x: 3 }}
                        className="w-6 h-6 bg-pink-50 rounded-full flex items-center justify-center group-hover:bg-pink-100 transition-colors"
                      >
                        <svg className="w-3 h-3 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {(buyTogether.length > 0 || subProducts.length > 0) && (
          <div className="space-y-6 px-4 pb-24">
            {buyTogether.length > 0 ? (
              <RecommendationShelf
                title="Buy Together"
                description="Quick combo suggestions."
                products={buyTogether}
                actionLabel="Add"
                onAdd={(item) => handleQuickAddRecommendation(item)}
              />
            ) : null}

            {subProducts.length > 0 ? (
              <RecommendationShelf
                title="Sub Products"
                description="Optional add-on products for this item."
                products={subProducts}
                actionLabel="Add"
                onAdd={(item) => handleQuickAddRecommendation(item)}
              />
            ) : null}
          </div>
        )}

        <section className="mx-4 mb-28 rounded-2xl border border-gray-200 bg-gradient-to-br from-white to-pink-50 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-pink-500">Description</p>
          <div
            className="space-y-2 text-sm leading-6 text-gray-700 [&_a]:text-pink-600 [&_h1]:mt-3 [&_h2]:mt-3 [&_h3]:mt-2 [&_ul]:my-2"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        </section>
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
                <Image unoptimized src={activeImage}
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
              {galleryImages.length > 1 && (
                <div className="absolute bottom-6 left-6 right-6 flex gap-3">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all backdrop-blur-sm ${
                        selectedImage === idx ? 'border-pink-500 shadow-lg ring-2 ring-white scale-105' : 'border-white/80 opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <Image unoptimized src={img} alt={`View ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex flex-col space-y-6">
            <div className="flex items-center gap-2">
              {product.showFoodTypeLabel && <FoodTypeBadge isVeg={product.isVeg} className="h-5 w-5" />}
              <span className="text-sm text-gray-500 font-medium uppercase tracking-wide">{product.category}</span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 leading-tight">{product.name}</h1>

            {miniDescription ? <p className="text-base text-gray-600">{miniDescription}</p> : null}

            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-pink-600">Rs. {finalPrice.toFixed(2)}</span>
              {product.discount > 0 && (
                <>
                  <span className="text-2xl text-gray-400 line-through">Rs. {product.price.toFixed(2)}</span>
                  <span className="text-base font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                    Save Rs. {(product.price - finalPrice).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 text-pink-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Prep time: {formatTime(product.prepTime)}</span>
            </div>

            {/* Tags */}
            {visibleTags.length > 0 && (
              <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1 pr-1 scrollbar-hide">
                {visibleTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="flex-shrink-0 px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium border border-pink-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {variants.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Variants</p>
                <div className="flex gap-3 overflow-x-auto pb-1 pr-1 scrollbar-hide">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVariantIndex(null)
                      setSelectedImage(0)
                    }}
                    className={`w-56 flex-shrink-0 rounded-xl border p-3 text-left transition-colors ${
                      selectedVariantIndex === null
                        ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-300'
                        : 'border-gray-300 bg-white hover:border-pink-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={resolveImageUrl(product.image)}
                        alt={product.name}
                        className="h-14 w-14 flex-shrink-0 rounded-lg border border-gray-200 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900">{product.name}</p>
                        <p className="text-sm text-pink-600">{formatPriceNoDecimals(basePrice)}</p>
                      </div>
                    </div>
                  </button>
                  {variants.map((variant, index) => {
                    const label = [variant.color, variant.size].filter(Boolean).join(' / ') || `Variant ${index + 1}`
                    return (
                      <button
                        key={`${label}-${index}`}
                        type="button"
                        onClick={() => {
                          setSelectedVariantIndex((prev) => (prev === index ? null : index))
                          setSelectedImage(0)
                        }}
                        className={`w-56 flex-shrink-0 rounded-xl border p-3 text-left transition-colors ${
                          selectedVariantIndex === index
                            ? 'border-pink-500 bg-pink-50 ring-1 ring-pink-300'
                            : 'border-gray-300 bg-white hover:border-pink-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={variant.image}
                            alt={label}
                            className="h-14 w-14 flex-shrink-0 rounded-lg border border-gray-200 object-cover"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">{label}</p>
                            {typeof variant.price === 'number' ? (
                              <p className="text-sm text-pink-600">{formatPriceNoDecimals(variant.price)}</p>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
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
              {product.isAvailable ? `Add to Cart • Rs. ${(finalPrice * quantity).toFixed(2)}` : 'Currently Unavailable'}
            </motion.button>

          </div>
        </div>

        {/* Add-ons Section - Desktop */}
        {addons.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Extra Love 💝</h2>
            <div className="grid grid-cols-4 gap-6">
              {addons.map((addon) => (
                <motion.div
                  key={addon.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48 bg-gray-100">
                    <Image unoptimized src={resolveImageUrl(addon.image)} alt={addon.name} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        handleQuickAddRecommendation(addon)
                      }}
                      className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-pink-600 text-white shadow-md transition hover:bg-pink-700"
                      aria-label={`Add ${addon.name} to cart`}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 5v14m7-7H5" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-gray-900 truncate">{addon.name}</p>
                    <p className="text-lg font-bold text-pink-600 mt-1">
                      {formatPriceNoDecimals(addon.price - addon.price * ((addon.discount || 0) / 100))}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Related Products Section - Desktop */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 mb-8">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-3xl font-bold text-gray-900">You May Also Like</h2>
              <div className="flex-1 h-1 bg-gradient-to-r from-pink-500 via-rose-500 to-transparent rounded-full"></div>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push(`/products/${relatedProduct.id}`)}
                  className="group bg-white rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100"
                >
                  <div className="relative h-72 bg-white overflow-hidden">
                    <Image unoptimized src={resolveImageUrl(relatedProduct.image)} 
                      alt={relatedProduct.name} 
                      fill 
                      className="object-contain group-hover:scale-105 transition-transform duration-700" 
                    />
                    {relatedProduct.discount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg backdrop-blur-sm"
                      >
                        {relatedProduct.discount}% OFF
                      </motion.div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileHover={{ opacity: 1, y: 0 }}
                      className="absolute bottom-4 left-4 right-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <div className="bg-white/95 backdrop-blur-sm text-pink-600 px-6 py-2.5 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
                        <span>Quick View</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </motion.div>
                  </div>
                  <div className="p-5">
                    <p className="text-lg font-semibold text-gray-900 line-clamp-2 min-h-[3.5rem] leading-snug group-hover:text-pink-600 transition-colors">{relatedProduct.name}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">Rs. {(relatedProduct.price - (relatedProduct.price * (relatedProduct.discount || 0) / 100)).toFixed(2)}</span>
                        {relatedProduct.discount > 0 && (
                          <span className="text-sm text-gray-400 line-through">Rs. {relatedProduct.price}</span>
                        )}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-10 h-10 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-shadow"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {buyTogether.length > 0 ? (
          <div className="mt-10">
            <RecommendationShelf
              title="Buy Together"
              description="Complete your combo in one tap."
              products={buyTogether}
              actionLabel="Add"
              onAdd={(item) => handleQuickAddRecommendation(item)}
            />
          </div>
        ) : null}

        {subProducts.length > 0 ? (
          <div className="mt-10">
            <RecommendationShelf
              title="Sub Products"
              description="Optional add-on products configured by admin for this item."
              products={subProducts}
              actionLabel="Add"
              onAdd={(item) => handleQuickAddRecommendation(item)}
            />
          </div>
        ) : null}

        <section className="mt-10 mb-8 rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-pink-50 p-6 shadow-sm">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-pink-500">Description</p>
          </div>
          <div
            className="space-y-2 text-base leading-7 text-gray-700 [&_a]:text-pink-600 [&_h1]:mb-2 [&_h2]:mb-2 [&_h3]:mb-1"
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        </section>
      </div>

      {cartToastMessage ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="fixed bottom-28 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-xl lg:bottom-24"
        >
          {cartToastMessage}
        </motion.div>
      ) : null}

      <button
        type="button"
        onClick={() => router.push('/cart')}
        className="fixed bottom-24 right-4 z-[65] flex h-12 min-w-12 items-center justify-center gap-2 rounded-full bg-pink-600 px-4 text-white shadow-xl transition hover:bg-pink-700 lg:bottom-6 lg:right-6"
        aria-label="Open cart"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2m0 0L7 13h10l2-8H5.4zm1.6 13a1 1 0 100 2 1 1 0 000-2zm10 0a1 1 0 100 2 1 1 0 000-2z"
          />
        </svg>
        <span className="text-sm font-semibold">{totalCartItems}</span>
      </button>
    </div>
  )
}

