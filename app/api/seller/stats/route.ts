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

    // Calculate stats
    const totalProducts = await prisma.product.count({
      where: { sellerId: seller.id },
    })

    const activeProducts = await prisma.product.count({
      where: { sellerId: seller.id, isAvailable: true },
    })

    // Get orders containing seller's products
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: {
              sellerId: seller.id,
            },
          },
        },
      },
      include: {
        items: {
          where: {
            product: {
              sellerId: seller.id,
            },
          },
        },
      },
    })

    const totalOrders = orders.length
    const pendingOrders = orders.filter((o) => o.status === 'PENDING').length

    // Calculate revenue
    const totalRevenue = orders.reduce((sum, order) => {
      const sellerItemsTotal = order.items.reduce((itemSum, item) => {
        return itemSum + item.price * item.quantity
      }, 0)
      return sum + sellerItemsTotal * (1 - seller.commission / 100)
    }, 0)

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const thisMonthOrders = orders.filter(
      (o) => new Date(o.createdAt) >= startOfMonth
    )
    const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => {
      const sellerItemsTotal = order.items.reduce((itemSum, item) => {
        return itemSum + item.price * item.quantity
      }, 0)
      return sum + sellerItemsTotal * (1 - seller.commission / 100)
    }, 0)

    return NextResponse.json({
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
      thisMonthRevenue,
    })
  } catch (error) {
    console.error('Error fetching seller stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
