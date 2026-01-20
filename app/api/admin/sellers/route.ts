import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const sellers = await prisma.seller.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(sellers)
  } catch (error) {
    console.error('Error fetching sellers:', error)
    return NextResponse.json({ error: 'Failed to fetch sellers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      email,
      phone,
      password,
      businessName,
      businessAddress,
      gstin,
      commission,
      bankAccountName,
      bankAccountNo,
      ifscCode,
      panNumber,
    } = body

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { phone }],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or phone already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user and seller in a transaction
    const seller = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          phone,
          password: hashedPassword,
          role: 'SELLER',
        },
      })

      return await tx.seller.create({
        data: {
          userId: user.id,
          businessName,
          businessAddress,
          gstin: gstin || undefined,
          phone,
          email,
          commission: commission || 15,
          bankAccountName: bankAccountName || undefined,
          bankAccountNo: bankAccountNo || undefined,
          ifscCode: ifscCode || undefined,
          panNumber: panNumber || undefined,
          isActive: true,
          isVerified: false,
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
    })

    return NextResponse.json(seller, { status: 201 })
  } catch (error) {
    console.error('Error creating seller:', error)
    return NextResponse.json({ error: 'Failed to create seller' }, { status: 500 })
  }
}
