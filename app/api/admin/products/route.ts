import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function toNumber(value: unknown, fallback: number) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const where: any = {}

    if (category && category !== 'all') {
      where.category = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error fetching admin products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const name = String(body?.name || '').trim()
    const description = String(body?.description || '').trim()
    const category = String(body?.category || '').trim()
    const image = String(body?.image || '').trim()

    if (!name || !description || !category || !image) {
      return NextResponse.json(
        { error: 'name, description, category and image are required' },
        { status: 400 }
      )
    }

    const price = toNumber(body?.price, NaN)
    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { error: 'price must be a valid non-negative number' },
        { status: 400 }
      )
    }

    const images = Array.isArray(body?.images)
      ? body.images
          .map((v: unknown) => String(v || '').trim())
          .filter((v: string) => v.length > 0)
      : []

    const tags = Array.isArray(body?.tags)
      ? body.tags
          .map((v: unknown) => String(v || '').trim())
          .filter((v: string) => v.length > 0)
      : []

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        price,
        image,
        images,
        imageAlt: String(body?.imageAlt || '').trim() || name,
        isVeg: Boolean(body?.isVeg),
        prepTime: Math.max(1, Math.round(toNumber(body?.prepTime, 15))),
        tags,
        discount: Math.max(0, toNumber(body?.discount, 0)),
        isAvailable: body?.isAvailable !== false,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('Error creating admin product:', error)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}
