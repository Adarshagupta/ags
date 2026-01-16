import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const occasion = await prisma.occasion.update({
      where: { id },
      data: {
        name: body.name,
        emoji: body.emoji,
        description: body.description || null,
        icon: body.icon,
        isActive: body.isActive
      }
    })
    return NextResponse.json(occasion)
  } catch (error) {
    console.error('Error updating occasion:', error)
    return NextResponse.json({ error: 'Failed to update occasion' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await prisma.occasion.delete({
      where: { id }
    })
    return NextResponse.json({ message: 'Occasion deleted' })
  } catch (error) {
    console.error('Error deleting occasion:', error)
    return NextResponse.json({ error: 'Failed to delete occasion' }, { status: 500 })
  }
}
