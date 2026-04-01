import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrSetJson, REDIS_KEYS } from '@/lib/redis'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')

    const whereClause: any = { isActive: true }
    if (type) {
      whereClause.type = type
    }

    const categories = await getOrSetJson(REDIS_KEYS.CATEGORIES(type || 'ALL'), 300, async () =>
      prisma.category.findMany({
        where: whereClause,
        orderBy: { name: 'asc' },
      })
    )

    return NextResponse.json(categories)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}
