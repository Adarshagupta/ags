'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

interface MapPickerProps {
  onLocationSelect: (
    lat: number,
    lng: number,
    address: string,
    parsed?: {
      street?: string
      area?: string
      landmark?: string
      city?: string
      state?: string
      pincode?: string
    }
  ) => void
  initialLat?: number
  initialLng?: number
}

declare global {
  interface Window {
    google: any
  }
}

export default function MapPicker({ onLocationSelect, initialLat, initialLng }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [map, setMap] = useState<any | null>(null)
  const [marker, setMarker] = useState<any | null>(null)
  const [geocoder, setGeocoder] = useState<any | null>(null)
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [locationStatus, setLocationStatus] = useState<string>('Detecting your location...')
  const mapInitialized = useRef(false)

  // Auto-detect user location on mount
  useEffect(() => {
    if (mapInitialized.current) return
    mapInitialized.current = true

    const loadMap = async () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

      if (!apiKey) {
        console.error('Google Maps API key not found')
        setIsLoading(false)
        setLocationStatus('Map unavailable')
        return
      }

      let fallbackLat = initialLat ?? 27.7172
      let fallbackLng = initialLng ?? 85.324

      if (initialLat === undefined || initialLng === undefined) {
        try {
          const response = await fetch('/api/settings', { cache: 'no-store' })
          if (response.ok) {
            const settings = await response.json()
            fallbackLat = initialLat ?? Number(settings.mapLatitude ?? fallbackLat)
            fallbackLng = initialLng ?? Number(settings.mapLongitude ?? fallbackLng)
          }
        } catch (error) {
          console.error('Failed to load map defaults:', error)
        }
      }

      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places'],
      })

      loader
        .load()
        .then(() => {
          if (!mapRef.current) return

          const google = window.google

          if ('geolocation' in navigator) {
            setLocationStatus('Getting your precise delivery location...')

            navigator.geolocation.getCurrentPosition(
              (position) => {
                const userLat = position.coords.latitude
                const userLng = position.coords.longitude
                const accuracy = position.coords.accuracy

                console.log(`Got location: ${userLat}, ${userLng} (accuracy: ${accuracy}m)`)
                setLocationStatus(`Location found (±${Math.round(accuracy)}m)`)

                initializeMap(google, userLat, userLng, accuracy)
              },
              (error) => {
                console.warn('Geolocation failed:', error.message)
                setLocationStatus('Using store delivery area as default')
                initializeMap(google, fallbackLat, fallbackLng, 1000)
              },
              {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0,
              }
            )
          } else {
            setLocationStatus('Geolocation not supported')
            initializeMap(google, fallbackLat, fallbackLng, 1000)
          }
        })
        .catch((error) => {
          console.error('Error loading Google Maps:', error)
          setIsLoading(false)
          setLocationStatus('Failed to load map')
        })
    }

    void loadMap()
  }, [initialLat, initialLng])

  const parseGeocoderResult = (result: any) => {
    const addressComponents = result?.address_components || []
    const parsed: Record<string, string> = {}

    addressComponents.forEach((component: any) => {
      const types = component.types || []

      if (types.includes('establishment')) parsed.establishment = component.long_name
      if (types.includes('point_of_interest')) parsed.pointOfInterest = component.long_name
      if (types.includes('subpremise')) parsed.subpremise = component.long_name
      if (types.includes('premise')) parsed.premise = component.long_name
      if (types.includes('street_number')) parsed.streetNumber = component.long_name
      if (types.includes('route')) parsed.route = component.long_name
      if (types.includes('sublocality_level_3')) parsed.sublocality3 = component.long_name
      if (types.includes('sublocality_level_2')) parsed.sublocality2 = component.long_name
      if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
        parsed.sublocality = component.long_name
      }
      if (types.includes('neighborhood')) parsed.neighborhood = component.long_name
      if (types.includes('locality')) parsed.city = component.long_name
      if (types.includes('administrative_area_level_2')) parsed.district = component.long_name
      if (types.includes('administrative_area_level_1')) parsed.state = component.long_name
      if (types.includes('postal_code')) parsed.pincode = component.long_name
    })

    const streetParts = [
      parsed.subpremise,
      parsed.premise,
      parsed.streetNumber,
      parsed.route,
      parsed.sublocality3,
      parsed.sublocality2,
      parsed.sublocality,
    ].filter(Boolean)

    const area =
      parsed.sublocality3 ||
      parsed.sublocality2 ||
      parsed.sublocality ||
      parsed.neighborhood ||
      parsed.route ||
      ''

    return {
      street: streetParts.join(', ') || result?.formatted_address?.split(',')[0] || '',
      area,
      landmark:
        parsed.establishment ||
        parsed.pointOfInterest ||
        parsed.premise ||
        parsed.neighborhood ||
        area ||
        '',
      city: parsed.city || parsed.district || '',
      state: parsed.state || '',
      pincode: parsed.pincode || '',
    }
  }

  const initializeMap = (google: any, lat: number, lng: number, accuracy: number) => {
    if (!mapRef.current) return
    
    // Calculate zoom based on accuracy
    const zoomLevel = accuracy < 20 ? 20 : accuracy < 50 ? 19 : accuracy < 100 ? 18 : accuracy < 300 ? 17 : 16

    const mapInstance = new google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: zoomLevel,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: 'greedy',
    })

    const markerInstance = new google.maps.Marker({
      position: { lat, lng },
      map: mapInstance,
      draggable: true,
      animation: google.maps.Animation.DROP,
      title: 'Drag to adjust location'
    })

    const geocoderInstance = new google.maps.Geocoder()
    const autocompleteInstance =
      searchInputRef.current
        ? new google.maps.places.Autocomplete(searchInputRef.current, {
            fields: ['address_components', 'formatted_address', 'geometry', 'name'],
            componentRestrictions: { country: 'np' },
          })
        : null

    setMap(mapInstance)
    setMarker(markerInstance)
    setGeocoder(geocoderInstance)
    setSelectedPosition({ lat, lng })
    setIsLoading(false)

    if (autocompleteInstance) {
      autocompleteInstance.addListener('place_changed', () => {
        const place = autocompleteInstance.getPlace()
        const location = place?.geometry?.location

        if (!location) return

        const placeLat = location.lat()
        const placeLng = location.lng()
        const nextPosition = { lat: placeLat, lng: placeLng }

        mapInstance.panTo(nextPosition)
        mapInstance.setZoom(18)
        markerInstance.setPosition(nextPosition)
        setSelectedPosition(nextPosition)

        onLocationSelect(
          placeLat,
          placeLng,
          place.formatted_address || place.name || 'Selected place',
          parseGeocoderResult(place)
        )

        reverseGeocode(placeLat, placeLng, geocoderInstance)
      })
    }

    // Handle map click
    mapInstance.addListener('click', (e: any) => {
      if (e.latLng) {
        const clickLat = e.latLng.lat()
        const clickLng = e.latLng.lng()
        markerInstance.setPosition(e.latLng)
        setSelectedPosition({ lat: clickLat, lng: clickLng })
        reverseGeocode(clickLat, clickLng, geocoderInstance)
      }
    })

    // Handle marker drag
    markerInstance.addListener('dragend', () => {
      const position = markerInstance.getPosition()
      if (position) {
        const dragLat = position.lat()
        const dragLng = position.lng()
        setSelectedPosition({ lat: dragLat, lng: dragLng })
        reverseGeocode(dragLat, dragLng, geocoderInstance)
      }
    })

    // Get initial address
    reverseGeocode(lat, lng, geocoderInstance)
  }

  const reverseGeocode = (lat: number, lng: number, geocoderInstance: any) => {
    const fallbackAddress = 'Resolving exact address...'

    geocoderInstance.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === 'OK' && results && results[0]) {
        onLocationSelect(lat, lng, results[0].formatted_address, parseGeocoderResult(results[0]))
      } else {
        // Keep selection usable even when geocoding is unavailable.
        console.warn('Reverse geocoding failed:', status)
        onLocationSelect(lat, lng, fallbackAddress)
      }
    })
  }

  const handleUseCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setIsLoading(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          const accuracy = position.coords.accuracy // accuracy in meters
          const newPosition = { lat, lng }
          
          console.log(`Location accuracy: ${accuracy} meters`)
          
          setSelectedPosition(newPosition)
          
          if (map) {
            map.setCenter(newPosition)
            // Zoom level based on accuracy - higher accuracy = more zoom
            const zoomLevel = accuracy < 20 ? 20 : accuracy < 50 ? 19 : accuracy < 100 ? 18 : accuracy < 500 ? 17 : 16
            map.setZoom(zoomLevel)
          }
          
          if (marker) {
            marker.setPosition(newPosition)
          }
          
          if (geocoder) {
            reverseGeocode(lat, lng, geocoder)
          }
          
          setIsLoading(false)
        },
        (error) => {
          console.error('Error getting location:', error)
          alert('Unable to get your location. Please enable location services and try again.')
          setIsLoading(false)
        },
        {
          enableHighAccuracy: true, // Use GPS for highest accuracy
          timeout: 15000, // Wait up to 15 seconds for accurate position
          maximumAge: 0 // Don't use cached position
        }
      )
    } else {
      alert('Geolocation is not supported by your browser')
    }
  }

  return (
    <div className="relative w-full h-full min-h-[420px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-cream-deep z-10">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-wine/20 border-t-wine"></div>
            <p className="text-sm text-ink/70 font-medium">{locationStatus}</p>
            <p className="text-xs text-ink/55">Please allow location access for accurate results</p>
          </div>
        </div>
      )}

      <div ref={mapRef} className="w-full h-full" />

      <div className="absolute left-4 right-4 top-4 z-10">
        <div className="rounded-2xl border border-wine/10 bg-white shadow-lg">
          <div className="flex items-center gap-3 px-4 py-3">
            <svg className="h-5 w-5 shrink-0 text-wine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search location, area or landmark"
              className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink/40"
            />
          </div>
        </div>
      </div>
      
      <button
        onClick={handleUseCurrentLocation}
        className="absolute bottom-20 right-4 bg-white p-3 rounded-full shadow-lg border border-wine/10 hover:bg-cream-deep transition-colors z-10"
        title="Use my current location"
      >
        <svg className="w-6 h-6 text-wine" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      
      <div className="absolute bottom-4 left-1/2 w-[calc(100%-32px)] max-w-sm -translate-x-1/2 rounded-full border border-wine/10 bg-white px-4 py-2 shadow-lg z-10">
        <p className="text-xs text-ink/60 text-center">
          Tap anywhere or drag the pin to set the exact delivery point
        </p>
      </div>
    </div>
  )
}
