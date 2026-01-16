'use client'

import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const router = useRouter()

  return (
    <div className="sticky top-16 z-30 bg-white border-b border-gray-100 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for gifts, flowers, cakes..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-900 cursor-pointer"
            onClick={() => router.push('/search')}
            readOnly
          />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
    </div>
  )
}
