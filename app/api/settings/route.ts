import { NextResponse } from 'next/server'
import { getAppSettings } from '@/lib/app-settings'

export async function GET() {
  try {
    const settings = await getAppSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching public app settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}
