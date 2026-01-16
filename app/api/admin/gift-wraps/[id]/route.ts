import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const giftWrap = await prisma.giftWrap.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description || null,
        price: body.price,
        image: body.image,
        type: body.type,
        isActive: body.isActive
      }
    })
    return NextResponse.json(giftWrap)
  } catch (error) {
    console.error('Error updating gift wrap:', error)
    return NextResponse.json({ error: 'Failed to update gift wrap' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.giftWrap.delete({
      where: { id: params.id }
    })
    return NextResponse.json({ message: 'Gift wrap deleted' })
  } catch (error) {
    console.error('Error deleting gift wrap:', error)
    return NextResponse.json({ error: 'Failed to delete gift wrap' }, { status: 500 })
  }
}
