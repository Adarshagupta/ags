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

    const seller = await prisma.seller.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    return NextResponse.json(seller)
  } catch (error) {
    console.error('Error fetching seller profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'SELLER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const seller = await prisma.seller.findUnique({
      where: { userId: session.user.id },
    })

    if (!seller) {
      return NextResponse.json({ error: 'Seller profile not found' }, { status: 404 })
    }

    const body = await request.json()

    const updatedSeller = await prisma.seller.update({
      where: { id: seller.id },
      data: {
        ...(body.businessName && { businessName: body.businessName }),
        ...(body.businessAddress && { businessAddress: body.businessAddress }),
        ...(body.gstin !== undefined && { gstin: body.gstin || null }),
        ...(body.phone && { phone: body.phone }),
        ...(body.email && { email: body.email }),
        ...(body.bankAccountName !== undefined && { 
          bankAccountName: body.bankAccountName || null 
        }),
        ...(body.bankAccountNo !== undefined && { 
          bankAccountNo: body.bankAccountNo || null 
        }),
        ...(body.ifscCode !== undefined && { ifscCode: body.ifscCode || null }),
        ...(body.panNumber !== undefined && { panNumber: body.panNumber || null }),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(updatedSeller)
  } catch (error) {
    console.error('Error updating seller profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
