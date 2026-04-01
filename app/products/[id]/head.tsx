import { ARCHIVED_PRODUCT_TAG } from '@/lib/product-archive'
import { findFirstProductCompat } from '@/lib/product-db'
import { resolveImageUrl } from '@/lib/image-url'

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

export default async function Head({ params }: { params: Promise<{ id: string }> }) {
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
    return null
  }

  const title = `${product.name} | Upaharo`
  const description = toPlainDescription(product.miniDescription || product.description || product.name)
  const imageUrl = toAbsoluteUrl(resolveImageUrl(product.image))

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:type" content="product" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="Upaharo" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </>
  )
}
