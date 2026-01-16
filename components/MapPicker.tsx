'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void
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

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      console.error('Google Maps API key not found')
      setIsLoading(false)
      setLocationStatus('Map unavailable')
      return
    }

    const loader = new Loader({
      apiKey: apiKey,
      version: 'weekly',
      libraries: ['places']
    })

    loader.load().then(() => {
      if (!mapRef.current) return
      
      const google = window.google
      
      // First, try to get user's current location
      if ('geolocation' in navigator) {
        setLocationStatus('Getting your precise location...')
        
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
            setLocationStatus('Using default location')
            // Fall back to initialLat/Lng or default
            const fallbackLat = initialLat || 28.6139
            const fallbackLng = initialLng || 77.2090
            initializeMap(google, fallbackLat, fallbackLng, 1000)
          },
          {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
          }
        )
      } else {
        setLocationStatus('Geolocation not supported')
        const fallbackLat = initialLat || 28.6139
        const fallbackLng = initialLng || 77.2090
        initializeMap(google, fallbackLat, fallbackLng, 1000)
      }
    }).catch((error) => {
      console.error('Error loading Google Maps:', error)
      setIsLoading(false)
      setLocationStatus('Failed to load map')
    })
  }, [initialLat, initialLng])

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

    setMap(mapInstance)
    setMarker(markerInstance)
    setGeocoder(geocoderInstance)
    setSelectedPosition({ lat, lng })
    setIsLoading(false)

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
    geocoderInstance.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === 'OK' && results && results[0]) {
        onLocationSelect(lat, lng, results[0].formatted_address)
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
    <div className="relative w-full h-full min-h-[400px]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="text-sm text-gray-700 font-medium">{locationStatus}</p>
            <p className="text-xs text-gray-500">Please allow location access for accurate results</p>
          </div>
        </div>
      )}
      
      <div ref={mapRef} className="w-full h-full rounded-lg" />
      
      <button
        onClick={handleUseCurrentLocation}
        className="absolute bottom-20 right-4 bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors z-10"
        title="Use my current location"
      >
        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg z-10">
        <p className="text-xs text-gray-600 text-center">
          📍 Click or drag marker to select location
        </p>
      </div>
    </div>
  )
}
