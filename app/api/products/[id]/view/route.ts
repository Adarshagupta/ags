import { NextRequest, NextResponse } from 'next/server'
import { resolveUserId } from '@/lib/request-auth'
import { trackProductView } from '@/lib/recommendations'

type Params = {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const userId = await resolveUserId(request)
    const sessionId = String(body?.sessionId || '').trim() || null

    await trackProductView({
      productId: id,
      userId,
      sessionId,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error tracking product view:', error)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
