import type { Metadata } from 'next'
import ProductDetailClient from './ProductDetailClient'
import { ARCHIVED_PRODUCT_TAG } from '@/lib/product-archive'
import { findFirstProductCompat } from '@/lib/product-db'
import { resolveImageUrl } from '@/lib/image-url'

type PageParams = {
  params: Promise<{ id: string }>
}

function getSiteUrl() {
  const value = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || ''
  return value.endsWith('/') ? value.slice(0, -1) : value
}

function toAbsoluteUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  const siteUrl = getSiteUrl()
  return siteUrl ? `${siteUrl}${url.startsWith('/') ? url : `/${url}`}` : url
}

function toPlainDescription(value: string) {
  return String(value || '')
    .replace(/[#*_`>\-\n\r]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160)
}

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { id } = await params

  const product = await findFirstProductCompat({
    where: {
      id,
      NOT: {
        tags: {
          has: ARCHIVED_PRODUCT_TAG,
        },
      },
    },
  })

  if (!product) {
    return {
      title: 'Product | Upaharo',
    }
  }

  const title = `${product.name} | Upaharo`
  const description = toPlainDescription(product.miniDescription || product.description || product.name)
  const imageUrl = toAbsoluteUrl(resolveImageUrl(product.image))
  const pageUrl = toAbsoluteUrl(`/products/${product.id}`)

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      url: pageUrl,
      siteName: 'Upaharo',
      title,
      description,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  }
}

export default function ProductPage(props: PageParams) {
  return <ProductDetailClient {...props} />
}
