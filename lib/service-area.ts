const KATHMANDU_VALLEY_CITIES = ['kathmandu', 'lalitpur', 'bhaktapur']

const KATHMANDU_VALLEY_BOUNDS = {
  minLat: 27.58,
  maxLat: 27.85,
  minLng: 85.18,
  maxLng: 85.55,
}

export const SERVICE_AREA_UNAVAILABLE_MESSAGE =
  'We are expanding soon. Delivery outside Kathmandu Valley is not available currently.'

function normalizeText(value: string | null | undefined) {
  return String(value || '').trim().toLowerCase()
}

function matchesKathmanduValleyText(value: string | null | undefined) {
  const text = normalizeText(value)
  if (!text) return false

  return KATHMANDU_VALLEY_CITIES.some((city) => text.includes(city))
}

function isWithinKathmanduValleyBounds(latitude?: number | null, longitude?: number | null) {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return false
  }

  return (
    Number(latitude) >= KATHMANDU_VALLEY_BOUNDS.minLat &&
    Number(latitude) <= KATHMANDU_VALLEY_BOUNDS.maxLat &&
    Number(longitude) >= KATHMANDU_VALLEY_BOUNDS.minLng &&
    Number(longitude) <= KATHMANDU_VALLEY_BOUNDS.maxLng
  )
}

export function isKathmanduValleyLocation(input: {
  city?: string | null
  state?: string | null
  address?: string | null
  latitude?: number | null
  longitude?: number | null
}) {
  if (isWithinKathmanduValleyBounds(input.latitude, input.longitude)) {
    return true
  }

  if (matchesKathmanduValleyText(input.city) || matchesKathmanduValleyText(input.address)) {
    return true
  }

  const state = normalizeText(input.state)
  if (state && state !== 'bagmati' && state !== 'bagmati province') {
    return false
  }

  return isWithinKathmanduValleyBounds(input.latitude, input.longitude)
}
