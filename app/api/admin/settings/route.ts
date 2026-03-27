import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_APP_SETTINGS } from '@/lib/app-settings'
import { isMissingAppSettingsTableError } from '@/lib/product-db'

function toNumber(value: unknown, fallback: number) {
  if (value === '' || value === null || value === undefined) {
    return fallback
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export async function GET() {
  try {
    const settings = await prisma.appSettings.findUnique({
      where: { id: 'default' },
    })

    return NextResponse.json({
      id: 'default',
      ...DEFAULT_APP_SETTINGS,
      ...(settings || {}),
    })
  } catch (error) {
    if (isMissingAppSettingsTableError(error)) {
      return NextResponse.json({
        id: 'default',
        ...DEFAULT_APP_SETTINGS,
      })
    }

    console.error('Error fetching admin settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()

    const settings = await prisma.appSettings.upsert({
      where: { id: 'default' },
      update: {
        siteName: String(body?.siteName || DEFAULT_APP_SETTINGS.siteName).trim(),
        supportPhone: String(body?.supportPhone || '').trim() || null,
        supportEmail: String(body?.supportEmail || '').trim() || null,
        supportHours: String(body?.supportHours || '').trim() || null,
        supportMessage: String(body?.supportMessage || '').trim() || null,
        deliveryEstimate: String(body?.deliveryEstimate || DEFAULT_APP_SETTINGS.deliveryEstimate).trim(),
        deliveryNote: String(body?.deliveryNote || '').trim() || null,
        announcementText: String(body?.announcementText || '').trim() || null,
        storeAddress: String(body?.storeAddress || '').trim() || null,
        mapLatitude: toNumber(body?.mapLatitude, DEFAULT_APP_SETTINGS.mapLatitude),
        mapLongitude: toNumber(body?.mapLongitude, DEFAULT_APP_SETTINGS.mapLongitude),
        homepageShowBanner: body?.homepageShowBanner ?? DEFAULT_APP_SETTINGS.homepageShowBanner,
        homepageShowTopCategories: body?.homepageShowTopCategories ?? DEFAULT_APP_SETTINGS.homepageShowTopCategories,
        homepageShowCategorySections:
          body?.homepageShowCategorySections ?? DEFAULT_APP_SETTINGS.homepageShowCategorySections,
        homepageShowOccasionTabs:
          body?.homepageShowOccasionTabs ?? DEFAULT_APP_SETTINGS.homepageShowOccasionTabs,
        homepageShowRecommendations:
          body?.homepageShowRecommendations ?? DEFAULT_APP_SETTINGS.homepageShowRecommendations,
        homepageRecommendationMode:
          String(body?.homepageRecommendationMode || DEFAULT_APP_SETTINGS.homepageRecommendationMode).trim(),
        homepageRecommendationTitle:
          String(body?.homepageRecommendationTitle || DEFAULT_APP_SETTINGS.homepageRecommendationTitle).trim(),
      },
      create: {
        id: 'default',
        siteName: String(body?.siteName || DEFAULT_APP_SETTINGS.siteName).trim(),
        supportPhone: String(body?.supportPhone || '').trim() || null,
        supportEmail: String(body?.supportEmail || '').trim() || null,
        supportHours: String(body?.supportHours || '').trim() || null,
        supportMessage: String(body?.supportMessage || '').trim() || null,
        deliveryEstimate: String(body?.deliveryEstimate || DEFAULT_APP_SETTINGS.deliveryEstimate).trim(),
        deliveryNote: String(body?.deliveryNote || '').trim() || null,
        announcementText: String(body?.announcementText || '').trim() || null,
        storeAddress: String(body?.storeAddress || '').trim() || null,
        mapLatitude: toNumber(body?.mapLatitude, DEFAULT_APP_SETTINGS.mapLatitude),
        mapLongitude: toNumber(body?.mapLongitude, DEFAULT_APP_SETTINGS.mapLongitude),
        homepageShowBanner: body?.homepageShowBanner ?? DEFAULT_APP_SETTINGS.homepageShowBanner,
        homepageShowTopCategories: body?.homepageShowTopCategories ?? DEFAULT_APP_SETTINGS.homepageShowTopCategories,
        homepageShowCategorySections:
          body?.homepageShowCategorySections ?? DEFAULT_APP_SETTINGS.homepageShowCategorySections,
        homepageShowOccasionTabs:
          body?.homepageShowOccasionTabs ?? DEFAULT_APP_SETTINGS.homepageShowOccasionTabs,
        homepageShowRecommendations:
          body?.homepageShowRecommendations ?? DEFAULT_APP_SETTINGS.homepageShowRecommendations,
        homepageRecommendationMode:
          String(body?.homepageRecommendationMode || DEFAULT_APP_SETTINGS.homepageRecommendationMode).trim(),
        homepageRecommendationTitle:
          String(body?.homepageRecommendationTitle || DEFAULT_APP_SETTINGS.homepageRecommendationTitle).trim(),
      },
    })

    return NextResponse.json(settings)
  } catch (error) {
    if (isMissingAppSettingsTableError(error)) {
      return NextResponse.json(
        { error: 'Settings storage is not available yet. Run the latest Prisma migration to enable admin settings.' },
        { status: 400 }
      )
    }

    console.error('Error updating admin settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings. Apply the latest Prisma migration first if this is a new setup.' },
      { status: 500 }
    )
  }
}
