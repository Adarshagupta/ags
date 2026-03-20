import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resolveUserId } from '@/lib/request-auth'

export async function POST(req: NextRequest) {
  try {
    const userId = await resolveUserId(req)
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { name, phone, email, relationship, birthDate, anniversary, interests, notes } = await req.json()

    const recipient = await prisma.giftRecipient.create({
      data: {
        userId,
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
    const userId = await resolveUserId(req)
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const recipients = await prisma.giftRecipient.findMany({
      where: { userId },
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
    const userId = await resolveUserId(req)
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id, name, phone, email, relationship, birthDate, anniversary, interests, notes } = await req.json()

    const existingRecipient = await prisma.giftRecipient.findFirst({
      where: { id, userId },
      select: { id: true },
    })

    if (!existingRecipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

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
    const userId = await resolveUserId(req)
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { id } = await req.json()

    const existingRecipient = await prisma.giftRecipient.findFirst({
      where: { id, userId },
      select: { id: true },
    })

    if (!existingRecipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }

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
