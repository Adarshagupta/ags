'use client'

import Link from 'next/link'
import { resolveImageUrl } from '@/lib/image-url'
import { formatPriceNoDecimals } from '@/lib/utils'
import type { RecommendationProduct } from '@/types/recommendations'

type RecommendationShelfProps = {
  title: string
  description?: string
  products: RecommendationProduct[]
  actionLabel?: string
  onAdd?: (product: RecommendationProduct) => void
}

function getFinalPrice(product: RecommendationProduct) {
  return product.price - product.price * ((product.discount || 0) / 100)
}

export default function RecommendationShelf({
  title,
  description,
  products,
  actionLabel = 'Add',
  onAdd,
}: RecommendationShelfProps) {
  if (products.length === 0) {
    return null
  }

  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
        {description ? <p className="text-sm text-slate-500">{description}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md"
          >
            <Link href={`/products/${product.id}`} className="block space-y-2">
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-slate-100">
                <img src={resolveImageUrl(product.image)} alt={product.name} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="line-clamp-2 text-sm font-semibold text-slate-900">{product.name}</p>
                <p className="text-xs uppercase tracking-[0.15em] text-slate-400">{product.category}</p>
              </div>
            </Link>

            <div className="mt-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">{formatPriceNoDecimals(getFinalPrice(product))}</p>
                {product.discount > 0 ? (
                  <p className="text-xs text-slate-400 line-through">{formatPriceNoDecimals(product.price)}</p>
                ) : null}
              </div>
              {onAdd ? (
                <button
                  type="button"
                  onClick={() => onAdd(product)}
                  className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-400"
                >
                  {actionLabel}
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
