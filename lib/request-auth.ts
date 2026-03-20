import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function resolveUserId(request: NextRequest): Promise<string | null> {
  const token = getTokenFromRequest(request)

  if (token) {
    const payload = await verifyToken(token)
    if (payload?.userId) {
      return String(payload.userId)
    }
  }

  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    return String(session.user.id)
  }

  return null
}
