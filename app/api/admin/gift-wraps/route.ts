import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const giftWraps = await prisma.giftWrap.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(giftWraps, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    })
  } catch (error) {
    console.error('Error fetching gift wraps:', error)
    return NextResponse.json({ error: 'Failed to fetch gift wraps' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const giftWrap = await prisma.giftWrap.create({
      data: {
        name: body.name,
        description: body.description || null,
        price: body.price,
        image: body.image,
        type: body.type,
        isActive: body.isActive ?? true
      }
    })
    return NextResponse.json(giftWrap)
  } catch (error) {
    console.error('Error creating gift wrap:', error)
    return NextResponse.json({ error: 'Failed to create gift wrap' }, { status: 500 })
  }
}
