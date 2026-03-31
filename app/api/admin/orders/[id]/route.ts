import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const updateData: any = {}
    
    if (body.status) updateData.status = body.status
    if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus
    if (body.estimatedTime !== undefined) {
      const estimatedTime = Number(body.estimatedTime)
      if (!Number.isFinite(estimatedTime) || estimatedTime < 0) {
        return NextResponse.json({ error: 'estimatedTime must be a non-negative number' }, { status: 400 })
      }
      updateData.estimatedTime = Math.round(estimatedTime)
    }

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        address: true,
        recipient: {
          select: {
            name: true,
            phone: true,
            relationship: true,
          },
        },
        occasion: {
          select: {
            name: true,
            emoji: true,
          },
        },
        giftWrap: {
          select: {
            name: true,
            type: true,
            price: true,
            image: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                image: true
              }
            }
          }
        }
      }
    })
    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
