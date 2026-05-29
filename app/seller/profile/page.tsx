'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface SellerProfile {
  id: string
  businessName: string
  businessAddress: string
  gstin: string | null
  phone: string
  email: string
  commission: number
  bankAccountName: string | null
  bankAccountNo: string | null
  ifscCode: string | null
  panNumber: string | null
  isActive: boolean
  isVerified: boolean
  createdAt: string
  user: {
    name: string
    email: string
  }
}

export default function SellerProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<SellerProfile | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    businessName: '',
    businessAddress: '',
    gstin: '',
    phone: '',
    email: '',
    bankAccountName: '',
    bankAccountNo: '',
    ifscCode: '',
    panNumber: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/seller/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setFormData({
          businessName: data.businessName,
          businessAddress: data.businessAddress,
          gstin: data.gstin || '',
          phone: data.phone,
          email: data.email,
          bankAccountName: data.bankAccountName || '',
          bankAccountNo: data.bankAccountNo || '',
          ifscCode: data.ifscCode || '',
          panNumber: data.panNumber || '',
        })
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/seller/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        await fetchProfile()
        setEditing(false)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (!profile) {
    return null
  }

  return (
    <div className="px-4 py-4 md:py-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="font-display text-xl md:text-2xl font-semibold text-ink">Seller Profile</h1>
            <p className="text-ink/55 text-sm">Manage your business information</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="bg-wine text-white px-4 py-2 rounded-full hover:bg-wine-deep text-sm transition-colors"
            >
              Edit
            </button>
          )}
        </div>

        {/* Status Cards - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-wine/10 rounded-[22px] p-4">
            <p className="text-xs text-ink/55 mb-1">Status</p>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold inline-block ${
                profile.isActive
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {profile.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="bg-white border border-wine/10 rounded-[22px] p-4">
            <p className="text-xs text-ink/55 mb-1">Verified</p>
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold inline-block ${
                profile.isVerified
                  ? 'bg-green-50 text-green-800'
                  : 'bg-amber-50 text-amber-800'
              }`}
            >
              {profile.isVerified ? 'Yes' : 'Pending'}
            </span>
          </div>
          <div className="bg-white border border-wine/10 rounded-[22px] p-4">
            <p className="text-xs text-ink/55 mb-1">Commission</p>
            <p className="font-display text-xl font-semibold text-ink">{profile.commission}%</p>
          </div>
          <div className="bg-white border border-wine/10 rounded-[22px] p-4">
            <p className="text-xs text-ink/55 mb-1">Member Since</p>
            <p className="text-sm font-medium text-ink">
              {new Date(profile.createdAt).toLocaleDateString('en-NP', {
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-[22px] border border-wine/10 p-4 md:p-6">
          <h2 className="font-display text-lg font-semibold text-ink mb-4">Business Information</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Owner Name
                </label>
                <input
                  type="text"
                  disabled
                  value={profile.user.name}
                  className="w-full rounded-xl border border-wine/15 px-3 py-2 bg-cream text-ink/55 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  disabled={!editing}
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  className={`w-full rounded-xl border border-wine/15 px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-wine/15 focus:border-wine/40 ${
                    editing ? '' : 'bg-cream text-ink/55'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                Business Address *
              </label>
              <textarea
                required
                disabled={!editing}
                value={formData.businessAddress}
                onChange={(e) =>
                  setFormData({ ...formData, businessAddress: e.target.value })
                }
                className={`w-full rounded-xl border border-wine/15 px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-wine/15 focus:border-wine/40 ${
                  editing ? '' : 'bg-cream text-ink/55'
                }`}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  disabled={!editing}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full rounded-xl border border-wine/15 px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-wine/15 focus:border-wine/40 ${
                    editing ? '' : 'bg-cream text-ink/55'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  disabled={!editing}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full rounded-xl border border-wine/15 px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-wine/15 focus:border-wine/40 ${
                    editing ? '' : 'bg-cream text-ink/55'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  VAT / PAN Registration
                </label>
                <input
                  type="text"
                  disabled={!editing}
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  className={`w-full rounded-xl border border-wine/15 px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-wine/15 focus:border-wine/40 ${
                    editing ? '' : 'bg-cream text-ink/55'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">
                  PAN Number
                </label>
                <input
                  type="text"
                  disabled={!editing}
                  value={formData.panNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, panNumber: e.target.value })
                  }
                  className={`w-full rounded-xl border border-wine/15 px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-wine/15 focus:border-wine/40 ${
                    editing ? '' : 'bg-cream text-ink/55'
                  }`}
                />
              </div>
            </div>

            <div className="pt-4 border-t border-wine/10">
              <h3 className="font-display text-md font-semibold text-ink mb-4">Bank Details</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    disabled={!editing}
                    value={formData.bankAccountName}
                    onChange={(e) =>
                      setFormData({ ...formData, bankAccountName: e.target.value })
                    }
                    className={`w-full rounded-xl border border-wine/15 px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-wine/15 focus:border-wine/40 ${
                      editing ? '' : 'bg-cream text-ink/55'
                    }`}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      disabled={!editing}
                      value={formData.bankAccountNo}
                      onChange={(e) =>
                        setFormData({ ...formData, bankAccountNo: e.target.value })
                      }
                      className={`w-full rounded-xl border border-wine/15 px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-wine/15 focus:border-wine/40 ${
                        editing ? '' : 'bg-cream text-ink/55'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink mb-1">
                      Bank Code / SWIFT
                    </label>
                    <input
                      type="text"
                      disabled={!editing}
                      value={formData.ifscCode}
                      onChange={(e) =>
                        setFormData({ ...formData, ifscCode: e.target.value })
                      }
                      className={`w-full rounded-xl border border-wine/15 px-3 py-2 text-sm text-ink focus:ring-2 focus:ring-wine/15 focus:border-wine/40 ${
                        editing ? '' : 'bg-cream text-ink/55'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {editing && (
              <div className="flex gap-3 justify-end pt-4 border-t border-wine/10">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setFormData({
                      businessName: profile.businessName,
                      businessAddress: profile.businessAddress,
                      gstin: profile.gstin || '',
                      phone: profile.phone,
                      email: profile.email,
                      bankAccountName: profile.bankAccountName || '',
                      bankAccountNo: profile.bankAccountNo || '',
                      ifscCode: profile.ifscCode || '',
                      panNumber: profile.panNumber || '',
                    })
                  }}
                  className="px-4 py-2 border border-wine/20 text-wine rounded-full hover:border-wine/40 hover:bg-cream text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-wine text-white rounded-full hover:bg-wine-deep disabled:opacity-50 text-sm shadow-md active:scale-95 transition-all"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
