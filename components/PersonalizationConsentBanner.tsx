'use client'

import { useEffect, useState } from 'react'
import { getPersonalizationConsent, setPersonalizationConsent } from '@/lib/personalization-consent'

export default function PersonalizationConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(getPersonalizationConsent() === 'unset')
  }, [])

  if (!visible) {
    return null
  }

  return (
    <div className="fixed inset-x-3 bottom-4 z-[90] mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_20px_50px_-25px_rgba(15,23,42,0.45)]">
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Personalized recommendations</p>
          <p className="mt-1 text-xs leading-5 text-gray-600">
            Allow us to use a small first-party cookie and recent product/category views to show more relevant items.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setPersonalizationConsent('declined')
              setVisible(false)
            }}
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={() => {
              setPersonalizationConsent('accepted')
              setVisible(false)
            }}
            className="flex-1 rounded-xl bg-pink-600 px-3 py-2 text-sm font-semibold text-white"
          >
            Allow
          </button>
        </div>
      </div>
    </div>
  )
}
