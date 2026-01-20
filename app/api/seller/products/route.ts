import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get seller profile
    const seller = await prisma.seller.findUnique({
      where: { userId: session.user.id },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    // Get seller's products
    const products = await prisma.product.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching seller products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get seller profile
    const seller = await prisma.seller.findUnique({
      where: { userId: session.user.id },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    if (!seller.isActive || !seller.isVerified) {
      return NextResponse.json(
        { error: 'Your seller account must be active and verified to add products' },
        { status: 403 }
      )
    }

    const body = await request.json()

    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        category: body.category,
        price: parseFloat(body.price),
        image: body.image,
        images: body.images || [],
        imageAlt: body.imageAlt,
        isAvailable: body.isAvailable !== false,
        isVeg: body.isVeg !== false,
        prepTime: body.prepTime || 15,
        tags: body.tags || [],
        discount: body.discount || 0,
        sellerId: seller.id,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
