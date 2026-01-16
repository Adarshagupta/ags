'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/store/user'
import Header from '@/components/Header'

interface Recipient {
  id: string
  name: string
  phone: string
  email?: string
  relationship: string
  birthDate?: string
  anniversary?: string
  interests: string[]
  notes?: string
}

export default function RecipientsPage() {
  const router = useRouter()
  const { user, _hasHydrated } = useUserStore()
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    birthDate: '',
    anniversary: '',
    interests: '',
    notes: '',
  })

  useEffect(() => {
    if (!_hasHydrated) return
    
    if (!user) {
      router.push('/auth')
      return
    }
    fetchRecipients()
  }, [user, router, _hasHydrated])

  const fetchRecipients = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/recipients', {
        headers: { 'Authorization': `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setRecipients(data.recipients || [])
      }
    } catch (err) {
      console.error('Error fetching recipients:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const token = localStorage.getItem('token')
      const method = editingId ? 'PUT' : 'POST'
      const body = {
        ...(editingId && { id: editingId }),
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        relationship: formData.relationship,
        birthDate: formData.birthDate || undefined,
        anniversary: formData.anniversary || undefined,
        interests: formData.interests.split(',').map(i => i.trim()).filter(i => i),
        notes: formData.notes || undefined,
      }

      const res = await fetch('/api/recipients', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        setFormData({
          name: '',
          phone: '',
          email: '',
          relationship: '',
          birthDate: '',
          anniversary: '',
          interests: '',
          notes: '',
        })
        setEditingId(null)
        setShowForm(false)
        fetchRecipients()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save recipient')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save recipient')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this recipient?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/recipients', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      })

      if (res.ok) {
        fetchRecipients()
      }
    } catch (err) {
      console.error('Error deleting recipient:', err)
    }
  }

  const handleEdit = (recipient: Recipient) => {
    setFormData({
      name: recipient.name,
      phone: recipient.phone,
      email: recipient.email || '',
      relationship: recipient.relationship,
      birthDate: recipient.birthDate ? recipient.birthDate.split('T')[0] : '',
      anniversary: recipient.anniversary ? recipient.anniversary.split('T')[0] : '',
      interests: recipient.interests.join(', '),
      notes: recipient.notes || '',
    })
    setEditingId(recipient.id)
    setShowForm(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Gift Recipients</h1>
            <p className="text-gray-600 mt-1">Manage your favorite gift recipients</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setShowForm(!showForm)
              setEditingId(null)
              setFormData({
                name: '',
                phone: '',
                email: '',
                relationship: '',
                birthDate: '',
                anniversary: '',
                interests: '',
                notes: '',
              })
            }}
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
          >
            {showForm ? '✕ Close' : '+ Add Recipient'}
          </motion.button>
        </div>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingId ? 'Edit Recipient' : 'Add New Recipient'}
            </h2>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Relationship *
                  </label>
                  <select
                    required
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                  >
                    <option value="">Select relationship</option>
                    <option value="Friend">Friend</option>
                    <option value="Family">Family</option>
                    <option value="Colleague">Colleague</option>
                    <option value="Partner">Partner</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Parent">Parent</option>
                    <option value="Child">Child</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Birthday
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Anniversary
                  </label>
                  <input
                    type="date"
                    value={formData.anniversary}
                    onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Interests (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.interests}
                  onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                  placeholder="Sports, Books, Music"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900"
                  placeholder="Any special notes..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                >
                  {editingId ? 'Update Recipient' : 'Add Recipient'}
                </motion.button>
                {editingId && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setEditingId(null)
                      setFormData({
                        name: '',
                        phone: '',
                        email: '',
                        relationship: '',
                        birthDate: '',
                        anniversary: '',
                        interests: '',
                        notes: '',
                      })
                    }}
                    className="flex-1 bg-gray-300 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
                  >
                    Cancel Edit
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        )}

        {/* Recipients List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : recipients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No recipients saved yet</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
            >
              Add First Recipient
            </motion.button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipients.map((recipient) => (
              <motion.div
                key={recipient.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{recipient.name}</h3>
                    <p className="text-sm text-gray-600">{recipient.relationship}</p>
                  </div>
                  <span className="text-2xl">
                    {recipient.relationship === 'Friend' && '👫'}
                    {recipient.relationship === 'Family' && '👨‍👩‍👧'}
                    {recipient.relationship === 'Spouse' && '💑'}
                    {recipient.relationship === 'Partner' && '👩‍❤️‍👨'}
                    {!['Friend', 'Family', 'Spouse', 'Partner'].includes(recipient.relationship) && '👤'}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <p className="text-gray-700">📱 {recipient.phone}</p>
                  {recipient.email && <p className="text-gray-700">✉️ {recipient.email}</p>}
                  {recipient.birthDate && (
                    <p className="text-gray-700">🎂 {new Date(recipient.birthDate).toLocaleDateString()}</p>
                  )}
                  {recipient.interests.length > 0 && (
                    <p className="text-gray-700">💫 {recipient.interests.join(', ')}</p>
                  )}
                </div>

                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleEdit(recipient)}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(recipient.id)}
                    className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
