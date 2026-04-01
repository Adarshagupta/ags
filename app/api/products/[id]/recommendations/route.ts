import { NextRequest, NextResponse } from 'next/server'
import { getProductRecommendations } from '@/lib/recommendations'
import { getOrSetJson, REDIS_KEYS } from '@/lib/redis'

type Params = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const viewed = new URL(request.url).searchParams.get('viewedProductIds')
    const viewedProductIds = viewed
      ? viewed
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)
      : []

    const viewedKey = viewedProductIds.slice(0, 20).join(',') || 'none'
    const recommendations = await getOrSetJson(
      REDIS_KEYS.PRODUCT_RECOMMENDATIONS(id, viewedKey),
      120,
      async () =>
        getProductRecommendations({
          productId: id,
          viewedProductIds,
        })
    )

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error('Error fetching product recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}
