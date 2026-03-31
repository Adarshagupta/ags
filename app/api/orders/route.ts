import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { redis, REDIS_CHANNELS } from '@/lib/redis'
import { generateOrderNumber } from '@/lib/utils'
import { ARCHIVED_PRODUCT_TAG } from '@/lib/product-archive'
import { LEGACY_PRODUCT_SELECT } from '@/lib/product-db'
import { resolveUserId } from '@/lib/request-auth'
import { createDodoCheckoutSession, isDodoConfigured } from '@/lib/dodo-payments'

export async function POST(request: NextRequest) {
  try {
    const userId = await resolveUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      items, 
      addressId, 
      addressLatitude,
      addressLongitude,
      paymentMethod, 
      subtotal, 
      deliveryFee, 
      total,
      isGift,
      recipientId,
      occasionId,
      giftWrapId,
      greetingMessage,
      senderName,
      showSenderName,
    } = body

    if (paymentMethod !== 'CASH' && paymentMethod !== 'ONLINE') {
      return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 })
    }

    if (paymentMethod === 'ONLINE' && !isDodoConfigured()) {
      return NextResponse.json(
        { error: 'Online payments are not configured yet. Add Dodo Payments credentials first.' },
        { status: 500 }
      )
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    const productIds = items
      .map((item: any) => String(item?.id || '').trim())
      .filter(Boolean)

    const availableProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isAvailable: true,
        NOT: {
          tags: {
            has: ARCHIVED_PRODUCT_TAG,
          },
        },
      },
      select: { id: true },
    })

    if (availableProducts.length !== productIds.length) {
      return NextResponse.json(
        { error: 'Some items are no longer available' },
        { status: 400 }
      )
    }

    const [user, address] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
        },
      }),
      addressId
        ? prisma.address.findUnique({
            where: { id: addressId },
            select: {
              id: true,
              street: true,
              city: true,
              state: true,
              pincode: true,
              latitude: true,
              longitude: true,
            },
          })
        : Promise.resolve(null),
    ])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!addressId || !address) {
      return NextResponse.json({ error: 'Please select a delivery address' }, { status: 400 })
    }

    const lat = typeof addressLatitude === 'number' ? addressLatitude : Number(addressLatitude)
    const lng = typeof addressLongitude === 'number' ? addressLongitude : Number(addressLongitude)
    const hasIncomingCoords = Number.isFinite(lat) && Number.isFinite(lng)

    if (hasIncomingCoords && address.latitude === 0 && address.longitude === 0) {
      await prisma.address.update({
        where: { id: address.id },
        data: {
          latitude: lat,
          longitude: lng,
        },
      })
    }

    // Generate order number
    const orderNumber = generateOrderNumber()

    const resolvedSubtotal = Number(subtotal) || 0
    const resolvedDeliveryFee = Number(deliveryFee) || 0
    const resolvedTax = 0
    const resolvedTotal = Number.isFinite(Number(total))
      ? Number(total)
      : resolvedSubtotal + resolvedDeliveryFee

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        addressId,
        subtotal: resolvedSubtotal,
        deliveryFee: resolvedDeliveryFee,
        tax: resolvedTax,
        total: resolvedTotal,
        paymentMethod,
        estimatedTime: 0,
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
            product: {
              select: LEGACY_PRODUCT_SELECT,
            },
          },
        },
        address: true,
        recipient: true,
        giftWrap: true,
        occasion: true,
      },
    })

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

    if (paymentMethod === 'ONLINE') {
      try {
        const session = await createDodoCheckoutSession({
          amountInMinor: Math.round(Number(total) * 100),
          returnUrl: `${request.nextUrl.origin}/checkout/dodo-return?orderId=${order.id}`,
          customer: {
            email: user.email,
            name: user.name,
            phoneNumber: user.phone,
          },
          billingAddress: {
            street: address.street,
            city: address.city,
            state: address.state,
            zipcode: address.pincode,
          },
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            userId,
          },
        })

        return NextResponse.json(
          {
            order,
            paymentUrl: session.checkout_url,
            paymentProvider: 'DODO',
          },
          { status: 201 }
        )
      } catch (paymentError: any) {
        await prisma.order.update({
          where: { id: order.id },
          data: { paymentStatus: 'FAILED' },
        })

        return NextResponse.json(
          {
            error: 'Failed to start Dodo payment',
            details: paymentError?.message || 'Unknown payment error',
          },
          { status: 500 }
        )
      }
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
    const userId = await resolveUserId(request)
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: LEGACY_PRODUCT_SELECT,
            },
          },
        },
        address: true,
        recipient: true,
        giftWrap: true,
        occasion: true,
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
