import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const occasions = await prisma.occasion.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(occasions, {
      headers: {
        'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60'
      }
    })
  } catch (error) {
    console.error('Error fetching occasions:', error)
    return NextResponse.json({ error: 'Failed to fetch occasions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const occasion = await prisma.occasion.create({
      data: {
        name: body.name,
        emoji: body.emoji,
        description: body.description || null,
        icon: body.icon,
        isActive: body.isActive ?? true
      }
    })
    return NextResponse.json(occasion)
  } catch (error) {
    console.error('Error creating occasion:', error)
    return NextResponse.json({ error: 'Failed to create occasion' }, { status: 500 })
  }
}
