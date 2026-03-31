import { NextRequest, NextResponse } from 'next/server'
import { getAppSettings } from '@/lib/app-settings'
import { findManyProductsCompat } from '@/lib/product-db'
import { ARCHIVED_PRODUCT_TAG } from '@/lib/product-archive'
import { getCartRecommendations } from '@/lib/recommendations'

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productIds = unique(
      String(searchParams.get('productIds') || '')
        .split(',')
        .map((value) => value.trim())
    )
    const viewedProductIds = unique(
      String(searchParams.get('viewedProductIds') || '')
        .split(',')
        .map((value) => value.trim())
    )

    if (productIds.length === 0) {
      return NextResponse.json({
        mode: 'NONE',
        title: 'Recommended for You',
        products: [],
      })
    }

    const settings = await getAppSettings()
    const recommendationMode = String(settings.homepageRecommendationMode || 'LATEST').toUpperCase()

    if (recommendationMode === 'BEST_OFFER') {
      const bestOffers = await findManyProductsCompat({
        where: {
          isAvailable: true,
          id: { notIn: productIds },
          NOT: {
            tags: {
              has: ARCHIVED_PRODUCT_TAG,
            },
          },
        },
        orderBy: [{ discount: 'desc' }, { createdAt: 'desc' }],
        take: 6,
      })

      return NextResponse.json({
        mode: 'BEST_OFFER',
        title: settings.homepageRecommendationTitle || 'Best Offers',
        products: bestOffers.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          category: item.category,
          discount: item.discount || 0,
          isVeg: item.isVeg,
          isAvailable: item.isAvailable,
        })),
      })
    }

    const recommendations = await getCartRecommendations({
      productIds,
      viewedProductIds,
    })

    const products = [
      ...recommendations.addons,
      ...recommendations.buyTogether,
      ...recommendations.related,
    ].slice(0, 6)

    return NextResponse.json({
      mode: 'RELATED',
      title: settings.homepageRecommendationTitle || 'Related Products',
      products,
    })
  } catch (error) {
    console.error('Error fetching cart recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cart recommendations' },
      { status: 500 }
    )
  }
}
