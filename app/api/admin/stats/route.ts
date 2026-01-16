import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get total orders
    const totalOrders = await prisma.order.count()

    // Get total revenue
    const ordersWithAmount = await prisma.order.findMany({
      select: { totalAmount: true }
    })
    const totalRevenue = ordersWithAmount.reduce((sum, order) => sum + order.totalAmount, 0)

    // Get total products
    const totalProducts = await prisma.product.count()

    // Get total users
    const totalUsers = await prisma.user.count()

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        createdAt: true
      }
    })

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      totalProducts,
      totalUsers,
      recentOrders
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
