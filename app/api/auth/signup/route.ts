import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body?.email || '').trim().toLowerCase()
    const password = String(body?.password || '')
    const name = String(body?.name || '').trim()
    const phone = String(body?.phone || '').trim()

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'Name, phone, email, and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user exists by email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    const existingPhone = await prisma.user.findUnique({
      where: { phone },
    })
    if (existingPhone) {
      return NextResponse.json(
        { error: 'Phone number already registered' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
      },
    })

    // Generate token
    const token = await signToken({ userId: user.id, email: user.email })

    return NextResponse.json({ user, token }, { status: 201 })
  } catch (error: any) {
    console.error('Error during signup:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create account', code: error.code },
      { status: 500 }
    )
  }
}
