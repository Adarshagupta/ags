import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const wraps = await prisma.giftWrap.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(wraps)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch gift wraps' },
      { status: 500 }
    )
  }
}
