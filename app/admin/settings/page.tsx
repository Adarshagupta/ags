'use client'

import { useEffect, useState } from 'react'

type SettingsForm = {
  siteName: string
  supportPhone: string
  supportEmail: string
  supportHours: string
  supportMessage: string
  deliveryEstimate: string
  deliveryNote: string
  announcementText: string
  storeAddress: string
  mapLatitude: string
  mapLongitude: string
  homepageShowBanner: boolean
  homepageShowTopCategories: boolean
  homepageShowCategorySections: boolean
  homepageShowOccasionTabs: boolean
  homepageShowRecommendations: boolean
  homepageRecommendationMode: string
  homepageRecommendationTitle: string
}

const EMPTY_FORM: SettingsForm = {
  siteName: '',
  supportPhone: '',
  supportEmail: '',
  supportHours: '',
  supportMessage: '',
  deliveryEstimate: '',
  deliveryNote: '',
  announcementText: '',
  storeAddress: '',
  mapLatitude: '',
  mapLongitude: '',
  homepageShowBanner: true,
  homepageShowTopCategories: true,
  homepageShowCategorySections: true,
  homepageShowOccasionTabs: true,
  homepageShowRecommendations: true,
  homepageRecommendationMode: 'LATEST',
  homepageRecommendationTitle: '',
}

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState<SettingsForm>(EMPTY_FORM)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    void fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (!res.ok) {
        throw new Error('Failed to load settings')
      }

      const data = await res.json()
      setFormData({
        siteName: String(data.siteName || ''),
        supportPhone: String(data.supportPhone || ''),
        supportEmail: String(data.supportEmail || ''),
        supportHours: String(data.supportHours || ''),
        supportMessage: String(data.supportMessage || ''),
        deliveryEstimate: String(data.deliveryEstimate || ''),
        deliveryNote: String(data.deliveryNote || ''),
        announcementText: String(data.announcementText || ''),
        storeAddress: String(data.storeAddress || ''),
        mapLatitude: String(data.mapLatitude ?? ''),
        mapLongitude: String(data.mapLongitude ?? ''),
        homepageShowBanner: Boolean(data.homepageShowBanner ?? true),
        homepageShowTopCategories: Boolean(data.homepageShowTopCategories ?? true),
        homepageShowCategorySections: Boolean(data.homepageShowCategorySections ?? true),
        homepageShowOccasionTabs: Boolean(data.homepageShowOccasionTabs ?? true),
        homepageShowRecommendations: Boolean(data.homepageShowRecommendations ?? true),
        homepageRecommendationMode: String(data.homepageRecommendationMode || 'LATEST'),
        homepageRecommendationTitle: String(data.homepageRecommendationTitle || ''),
      })
    } catch (error) {
      console.error('Failed to load settings:', error)
      setMessage('Failed to load settings.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          mapLatitude: Number(formData.mapLatitude),
          mapLongitude: Number(formData.mapLongitude),
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to save settings')
      }

      setMessage('Settings updated successfully.')
    } catch (error: any) {
      console.error('Failed to update settings:', error)
      setMessage(error?.message || 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading settings...</div>
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">Control support details, delivery text, map defaults, and homepage announcements.</p>
      </div>

      {message && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Site Name</label>
              <input
                type="text"
                value={formData.siteName}
                onChange={(e) => setFormData((prev) => ({ ...prev, siteName: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Homepage Announcement</label>
              <input
                type="text"
                value={formData.announcementText}
                onChange={(e) => setFormData((prev) => ({ ...prev, announcementText: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Homepage Layout</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formData.homepageShowBanner}
                onChange={(e) => setFormData((prev) => ({ ...prev, homepageShowBanner: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              Show homepage banner
            </label>

            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formData.homepageShowTopCategories}
                onChange={(e) => setFormData((prev) => ({ ...prev, homepageShowTopCategories: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              Show top category cards
            </label>

            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formData.homepageShowOccasionTabs}
                onChange={(e) => setFormData((prev) => ({ ...prev, homepageShowOccasionTabs: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              Show occasion tabs row
            </label>

            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formData.homepageShowCategorySections}
                onChange={(e) => setFormData((prev) => ({ ...prev, homepageShowCategorySections: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              Show category sections
            </label>

            <label className="flex items-center gap-3 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={formData.homepageShowRecommendations}
                onChange={(e) => setFormData((prev) => ({ ...prev, homepageShowRecommendations: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              Show recommended products section
            </label>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Recommendation Type</label>
              <select
                value={formData.homepageRecommendationMode}
                onChange={(e) => setFormData((prev) => ({ ...prev, homepageRecommendationMode: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="LATEST">Latest Arrivals</option>
                <option value="BEST_OFFER">Best Offers</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Recommendation Title</label>
              <input
                type="text"
                value={formData.homepageRecommendationTitle}
                onChange={(e) => setFormData((prev) => ({ ...prev, homepageRecommendationTitle: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Latest Arrivals"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Support</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Support Phone</label>
              <input
                type="text"
                value={formData.supportPhone}
                onChange={(e) => setFormData((prev) => ({ ...prev, supportPhone: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Support Email</label>
              <input
                type="email"
                value={formData.supportEmail}
                onChange={(e) => setFormData((prev) => ({ ...prev, supportEmail: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Support Hours</label>
              <input
                type="text"
                value={formData.supportHours}
                onChange={(e) => setFormData((prev) => ({ ...prev, supportHours: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="9:00 AM - 9:00 PM"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Support Message</label>
              <input
                type="text"
                value={formData.supportMessage}
                onChange={(e) => setFormData((prev) => ({ ...prev, supportMessage: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Delivery and Map</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Delivery Estimate</label>
              <input
                type="text"
                value={formData.deliveryEstimate}
                onChange={(e) => setFormData((prev) => ({ ...prev, deliveryEstimate: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Delivery Note</label>
              <input
                type="text"
                value={formData.deliveryNote}
                onChange={(e) => setFormData((prev) => ({ ...prev, deliveryNote: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">Store Address</label>
              <input
                type="text"
                value={formData.storeAddress}
                onChange={(e) => setFormData((prev) => ({ ...prev, storeAddress: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Default Map Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={formData.mapLatitude}
                onChange={(e) => setFormData((prev) => ({ ...prev, mapLatitude: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Default Map Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={formData.mapLongitude}
                onChange={(e) => setFormData((prev) => ({ ...prev, mapLongitude: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-orange-500 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
