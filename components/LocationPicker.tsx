'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLocationStore } from '@/lib/store/location'

interface LocationPickerProps {
  onLocationSelect?: (location: any) => void
}

export default function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const { setCurrentLocation, setDeliveryAddress } = useLocationStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestLocation = () => {
    setIsLoading(true)
    setError(null)

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          try {
            // Reverse geocode to get address
            const response = await fetch(
              `/api/location/reverse-geocode?lat=${latitude}&lng=${longitude}`
            )
            const data = await response.json()

            const location = {
              latitude,
              longitude,
              address: data.address,
              label: 'Current Location',
            }

            setCurrentLocation(location)
            setDeliveryAddress(location)
            onLocationSelect?.(location)
            setIsLoading(false)
          } catch (err) {
            setError('Failed to get address')
            setIsLoading(false)
          }
        },
        (err) => {
          setError('Location permission denied. Please enable location access.')
          setIsLoading(false)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    } else {
      setError('Geolocation is not supported by your browser')
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-10 h-10 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Enable Location Access
        </h2>
        <p className="text-gray-600 mb-6">
          We need your location to show nearby restaurants and calculate delivery time
        </p>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm"
          >
            {error}
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={requestLocation}
          disabled={isLoading}
          className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark smooth-transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
        >
          {isLoading ? (
            <>
              <div className="spinner w-5 h-5 border-2 border-white border-t-transparent" />
              <span>Getting location...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Enable Location</span>
            </>
          )}
        </motion.button>

        <div className="mt-4">
          <button className="text-primary font-semibold text-sm hover:underline">
            Or enter address manually
          </button>
        </div>
      </div>
    </div>
  )
}
