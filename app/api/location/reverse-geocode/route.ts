import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' },
        { status: 500 }
      )
    }

    // Call Google Maps Geocoding API with result_type for more precise address
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&result_type=street_address|premise|subpremise|route&location_type=ROOFTOP|RANGE_INTERPOLATED`
    )

    const data = await response.json()

    // If precise address not found, try again without filters
    let result = data.results?.[0]
    if (!result) {
      const fallbackResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      )
      const fallbackData = await fallbackResponse.json()
      result = fallbackData.results?.[0]
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to reverse geocode location' },
        { status: 400 }
      )
    }

    // Parse address components for detailed address
    const addressComponents = result.address_components || []
    const parsed: Record<string, string> = {}
    
    addressComponents.forEach((component: any) => {
      const types = component.types
      if (types.includes('subpremise')) {
        parsed.subpremise = component.long_name
      }
      if (types.includes('premise')) {
        parsed.premise = component.long_name
      }
      if (types.includes('street_number')) {
        parsed.streetNumber = component.long_name
      }
      if (types.includes('route')) {
        parsed.route = component.long_name
      }
      if (types.includes('sublocality_level_3')) {
        parsed.sublocality3 = component.long_name
      }
      if (types.includes('sublocality_level_2')) {
        parsed.sublocality2 = component.long_name
      }
      if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
        parsed.sublocality = component.long_name
      }
      if (types.includes('locality')) {
        parsed.city = component.long_name
      }
      if (types.includes('administrative_area_level_2')) {
        parsed.district = component.long_name
      }
      if (types.includes('administrative_area_level_1')) {
        parsed.state = component.long_name
      }
      if (types.includes('country')) {
        parsed.country = component.long_name
      }
      if (types.includes('postal_code')) {
        parsed.pincode = component.long_name
      }
    })

    // Build detailed street address
    const streetParts = []
    if (parsed.subpremise) streetParts.push(parsed.subpremise)
    if (parsed.premise) streetParts.push(parsed.premise)
    if (parsed.streetNumber) streetParts.push(parsed.streetNumber)
    if (parsed.route) streetParts.push(parsed.route)
    if (parsed.sublocality3) streetParts.push(parsed.sublocality3)
    if (parsed.sublocality2) streetParts.push(parsed.sublocality2)
    if (parsed.sublocality) streetParts.push(parsed.sublocality)
    
    const detailedStreet = streetParts.join(', ') || result.formatted_address?.split(',')[0] || ''

    return NextResponse.json({ 
      address: result.formatted_address,
      fullResult: result,
      parsed: {
        street: detailedStreet,
        landmark: parsed.sublocality || parsed.sublocality2 || '',
        city: parsed.city || parsed.district || '',
        state: parsed.state || '',
        pincode: parsed.pincode || '',
        country: parsed.country || ''
      }
    })
  } catch (error) {
    console.error('Error reverse geocoding:', error)
    return NextResponse.json(
      { error: 'Failed to get address' },
      { status: 500 }
    )
  }
}
