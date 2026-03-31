import { NextRequest, NextResponse } from 'next/server'
import { getProductRecommendations } from '@/lib/recommendations'

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

    const recommendations = await getProductRecommendations({
      productId: id,
      viewedProductIds,
    })

    return NextResponse.json(recommendations)
  } catch (error) {
    console.error('Error fetching product recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}
