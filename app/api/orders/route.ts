import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis, REDIS_CHANNELS } from '@/lib/redis'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { generateOrderNumber } from '@/lib/utils'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      items, 
      addressId, 
      paymentMethod, 
      subtotal, 
      deliveryFee, 
      tax, 
      total,
      isGift,
      recipientId,
      occasionId,
      giftWrapId,
      greetingMessage,
      senderName,
      showSenderName,
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Generate order number
    const orderNumber = generateOrderNumber()

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: payload.userId as string,
        addressId,
        subtotal,
        deliveryFee,
        tax,
        total,
        paymentMethod,
        estimatedTime: 30,
        isGift: isGift || false,
        recipientId: isGift ? recipientId : null,
        occasionId: isGift ? occasionId : null,
        giftWrapId: isGift ? giftWrapId : null,
        greetingMessage: isGift ? greetingMessage : null,
        senderName: isGift ? senderName : null,
        showSenderName: isGift ? (showSenderName || false) : false,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        recipient: true,
        giftWrap: true,
        occasion: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    // Send email notifications (non-blocking)
    (async () => {
      try {
        // Customer confirmation email
        if (order.user?.email) {
          const addressText = order.address 
            ? `${order.address.street}, ${order.address.city}, ${order.address.state} ${order.address.pincode}`
            : 'Address not available'

          await sendEmail({
            to: order.user.email,
            subject: `Order Confirmation - #${orderNumber}`,
            html: emailTemplates.orderConfirmation({
              orderNumber,
              customerName: order.user.name || 'Customer',
              items: order.items,
              total: order.total,
              deliveryAddress: addressText,
            }),
          })
        }

        // Notify sellers about their products in the order
        const sellerProductMap = new Map<string, any[]>()
        
        for (const item of order.items) {
          if (item.product.sellerId) {
            if (!sellerProductMap.has(item.product.sellerId)) {
              sellerProductMap.set(item.product.sellerId, [])
            }
            sellerProductMap.get(item.product.sellerId)!.push(item)
          }
        }

        // Send email to each seller
        for (const [sellerId, sellerItems] of sellerProductMap.entries()) {
          const seller = await prisma.seller.findUnique({
            where: { id: sellerId },
            include: { user: true },
          })

          if (seller?.email) {
            await sendEmail({
              to: seller.email,
              subject: `New Order Received - #${orderNumber}`,
              html: emailTemplates.newOrderNotification({
                sellerName: seller.businessName,
                orderNumber,
                customerName: order.user?.name || 'Customer',
                items: sellerItems,
                total: sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
              }),
            })
          }
        }

        // Notify admin (fetch admin users)
        const adminUsers = await prisma.user.findMany({
          where: { role: 'ADMIN' },
          select: { email: true },
        })

        for (const admin of adminUsers) {
          if (admin.email) {
            await sendEmail({
              to: admin.email,
              subject: `New Order Alert - #${orderNumber}`,
              html: emailTemplates.adminNewOrder({
                orderNumber,
                customerName: order.user?.name || 'Customer',
                total: order.total,
                itemCount: order.items.length,
              }),
            })
          }
        }
      } catch (emailError) {
        console.error('Email notification error (non-critical):', emailError)
      }
    })()

    // Publish order update to Redis (optional - don't fail if Redis is unavailable)
    try {
      await redis.publish(
        REDIS_CHANNELS.ORDER_UPDATES,
        JSON.stringify({
          orderId: order.id,
          status: 'PENDING',
          timestamp: new Date().toISOString(),
        })
      )
    } catch (redisError) {
      console.warn('Redis publish failed (non-critical):', redisError)
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating order:', error)
    console.error('Error details:', error.message, error.stack)
    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const token = getTokenFromRequest(request)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: payload.userId as string },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
