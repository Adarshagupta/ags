import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface Location {
  latitude: number
  longitude: number
  address?: string
  label?: string
}

interface LocationStore {
  currentLocation: Location | null
  deliveryAddress: Location | null
  setCurrentLocation: (location: Location) => void
  setDeliveryAddress: (location: Location) => void
  clearLocation: () => void
}

export const useLocationStore = create<LocationStore>()(
  persist(
    (set) => ({
      currentLocation: null,
      deliveryAddress: null,
      
      setCurrentLocation: (location) => {
        set({ currentLocation: location })
      },
      
      setDeliveryAddress: (location) => {
        set({ deliveryAddress: location })
      },
      
      clearLocation: () => {
        set({ currentLocation: null, deliveryAddress: null })
      },
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      skipHydration: false,
    }
  )
)
