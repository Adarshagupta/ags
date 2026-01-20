import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const updateData: any = {}
    
    if (body.status) updateData.status = body.status
    if (body.paymentStatus) updateData.paymentStatus = body.paymentStatus

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

    // Send email notification for status change (non-blocking)
    if (body.status && order.user?.email) {
      (async () => {
        try {
          const statusMessages: Record<string, string> = {
            PENDING: 'Your order has been received and is being processed.',
            CONFIRMED: 'Your order has been confirmed and will be prepared soon.',
            PREPARING: 'Your order is being prepared with care!',
            OUT_FOR_DELIVERY: 'Your order is out for delivery and will reach you soon!',
            DELIVERED: 'Your order has been delivered. Thank you for shopping with us!',
            CANCELLED: 'Your order has been cancelled. If you have any questions, please contact us.',
          }

          await sendEmail({
            to: order.user.email,
            subject: `Order Update - #${order.orderNumber}`,
            html: emailTemplates.orderStatusUpdate({
              orderNumber: order.orderNumber,
              customerName: order.user.name || 'Customer',
              status: body.status,
              statusMessage: statusMessages[body.status] || 'Your order status has been updated.',
            }),
          })
        } catch (emailError) {
          console.error('Email notification error (non-critical):', emailError)
        }
      })()
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
