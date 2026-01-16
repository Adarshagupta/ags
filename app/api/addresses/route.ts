import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

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

    const userId = payload.userId as string
    
    // Verify user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    })
    
    if (!userExists) {
      console.error('User not found:', userId)
      return NextResponse.json({ error: 'User not found. Please log out and log in again.' }, { status: 401 })
    }

    const body = await request.json()
    const { label, street, apartment, landmark, city, state, pincode, latitude, longitude, isDefault } = body

    // Validate required fields
    if (!label || !street || !city || !state || !pincode) {
      return NextResponse.json(
        { error: 'Missing required fields: label, street, city, state, pincode' },
        { status: 400 }
      )
    }

    // Ensure latitude and longitude are valid numbers
    const lat = typeof latitude === 'number' ? latitude : parseFloat(latitude) || 0
    const lng = typeof longitude === 'number' ? longitude : parseFloat(longitude) || 0

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      })
    }

    // Create address
    const address = await prisma.address.create({
      data: {
        userId,
        label,
        street,
        apartment: apartment || '',
        landmark: landmark || '',
        city,
        state,
        pincode,
        latitude: lat,
        longitude: lng,
        isDefault: isDefault || false,
      },
    })

    return NextResponse.json({ address }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating address:', error)
    console.error('Error details:', error?.message, error?.code)
    return NextResponse.json(
      { error: 'Failed to create address', details: error?.message || 'Unknown error' },
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

    // Fetch user addresses
    const addresses = await prisma.address.findMany({
      where: { userId: payload.userId as string },
      orderBy: { isDefault: 'desc' },
    })

    return NextResponse.json({ addresses })
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    )
  }
}
