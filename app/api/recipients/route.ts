import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { name, phone, email, relationship, birthDate, anniversary, interests, notes } = await req.json()

    const recipient = await prisma.giftRecipient.create({
      data: {
        userId: payload.userId as string,
        name,
        phone,
        email,
        relationship,
        birthDate: birthDate ? new Date(birthDate) : null,
        anniversary: anniversary ? new Date(anniversary) : null,
        interests: interests || [],
        notes,
      },
    })

    return NextResponse.json(recipient)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create recipient' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const recipients = await prisma.giftRecipient.findMany({
      where: { userId: payload.userId as string },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ recipients })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch recipients' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id, name, phone, email, relationship, birthDate, anniversary, interests, notes } = await req.json()

    const recipient = await prisma.giftRecipient.update({
      where: { id },
      data: {
        name,
        phone,
        email,
        relationship,
        birthDate: birthDate ? new Date(birthDate) : null,
        anniversary: anniversary ? new Date(anniversary) : null,
        interests: interests || [],
        notes,
      },
    })

    return NextResponse.json(recipient)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update recipient' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = await req.json()

    await prisma.giftRecipient.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Recipient deleted' })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete recipient' },
      { status: 500 }
    )
  }
}
