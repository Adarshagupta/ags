import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const occasions = await prisma.occasion.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(occasions)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch occasions' },
      { status: 500 }
    )
  }
}
