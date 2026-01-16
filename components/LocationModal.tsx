'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocationStore } from '@/lib/store/location'
import { useUserStore } from '@/lib/store/user'
import MapPicker from './MapPicker'

interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LocationModal({ isOpen, onClose }: LocationModalProps) {
  const { setCurrentLocation, setDeliveryAddress, deliveryAddress } = useLocationStore()
  const { user } = useUserStore()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'select' | 'form'>('select')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedAddress, setSelectedAddress] = useState('')
  const [formData, setFormData] = useState({
    label: 'Home',
    street: '',
    apartment: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
  })

  const handleLocationSelect = async (lat: number, lng: number, address: string) => {
    setCoords({ lat, lng })
    setSelectedAddress(address)
    
    // Parse address to pre-fill form with detailed data
    try {
      const response = await fetch(
        `/api/location/reverse-geocode?lat=${lat}&lng=${lng}`
      )
      const data = await response.json()
      
      // Use the pre-parsed data from API for more accuracy
      if (data.parsed) {
        setFormData({
          ...formData,
          street: data.parsed.street || '',
          landmark: data.parsed.landmark || '',
          city: data.parsed.city || '',
          state: data.parsed.state || '',
          pincode: data.parsed.pincode || '',
        })
      } else {
        // Fallback to manual parsing
        const addressComponents = data.fullResult?.address_components || []
        const street = data.fullResult?.formatted_address?.split(',')[0] || ''
        
        let city = '', state = '', pincode = ''
        addressComponents.forEach((component: any) => {
          if (component.types.includes('locality')) {
            city = component.long_name
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name
          }
          if (component.types.includes('postal_code')) {
            pincode = component.long_name
          }
        })
        
        setFormData({
          ...formData,
          street,
          city,
          state,
          pincode,
        })
      }
    } catch (err) {
      console.error('Error parsing address:', err)
    }
  }

  const handleProceedToForm = () => {
    if (coords) {
      setStep('form')
    }
  }

  const handleBackToMap = () => {
    setStep('select')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const location = {
        latitude: coords?.lat || 0,
        longitude: coords?.lng || 0,
        address: `${formData.street}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
        ...formData,
      }

      // Save to location store
      setCurrentLocation(location)
      setDeliveryAddress(location)

      // If user is logged in, save to database
      if (user) {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/addresses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            latitude: coords?.lat || 0,
            longitude: coords?.lng || 0,
            isDefault: true, // Set as default address
          }),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save address')
        }
      }

      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to save address')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    {step === 'form' && (
                      <button
                        onClick={handleBackToMap}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}
                    <h2 className="text-2xl font-bold text-gray-900">
                      {step === 'select' ? 'Select Location on Map' : 'Enter Address Details'}
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {step === 'select' ? (
                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        📍 Click or drag the marker on the map to select your exact location
                      </p>
                      {selectedAddress && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-semibold text-gray-700 mb-1">Selected Address:</p>
                          <p className="text-sm text-gray-600">{selectedAddress}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="h-[400px] rounded-lg overflow-hidden border-2 border-gray-200 mb-4">
                      <MapPicker 
                        onLocationSelect={handleLocationSelect}
                        initialLat={deliveryAddress?.latitude || 28.6139}
                        initialLng={deliveryAddress?.longitude || 77.2090}
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleProceedToForm}
                      disabled={!coords}
                      className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Confirm & Continue
                    </motion.button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Address Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Save As
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Home', 'Work', 'Other'].map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({ ...formData, label: type })}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                              formData.label === type
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Street Address */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        House/Flat/Block No. *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.street}
                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                        placeholder="Enter your house/flat number"
                      />
                    </div>

                    {/* Apartment/Building */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Apartment/Road/Area
                      </label>
                      <input
                        type="text"
                        value={formData.apartment}
                        onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                        placeholder="Apartment name or area"
                      />
                    </div>

                    {/* Landmark */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Landmark
                      </label>
                      <input
                        type="text"
                        value={formData.landmark}
                        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                        placeholder="Nearby landmark"
                      />
                    </div>

                    {/* City, State, Pincode */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                          placeholder="City"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Pincode *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                          placeholder="Pincode"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                        placeholder="State"
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                          <span>Saving...</span>
                        </div>
                      ) : (
                        'Save & Continue'
                      )}
                    </motion.button>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
