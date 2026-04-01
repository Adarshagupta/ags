import { NextRequest, NextResponse } from 'next/server'
import { ARCHIVED_PRODUCT_TAG } from '@/lib/product-archive'
import { findFirstProductCompat } from '@/lib/product-db'
import { getOrSetJson, REDIS_KEYS } from '@/lib/redis'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const product = await getOrSetJson(REDIS_KEYS.PRODUCT_DETAIL(id), 180, async () =>
      findFirstProductCompat({
        where: {
          id,
          NOT: {
            tags: {
              has: ARCHIVED_PRODUCT_TAG,
            },
          },
        },
      })
    )

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(product, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    )
  }
}
