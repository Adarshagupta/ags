import React from 'react'

interface SkeletonLoaderProps {
  variant?: 'card' | 'list' | 'grid' | 'profile' | 'order' | 'product' | 'text'
  count?: number
  className?: string
}

export default function SkeletonLoader({ 
  variant = 'card', 
  count = 1,
  className = '' 
}: SkeletonLoaderProps) {
  
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`bg-white rounded-2xl shadow-sm p-4 ${className}`}>
            <div className="animate-pulse">
              <div className="bg-gray-200 rounded-xl h-48 w-full mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="flex items-center justify-between">
                <div className="h-5 bg-gray-200 rounded w-20"></div>
                <div className="h-9 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        )

      case 'list':
        return (
          <div className={`bg-white rounded-xl shadow-sm p-4 ${className}`}>
            <div className="animate-pulse flex items-center space-x-4">
              <div className="bg-gray-200 rounded-lg h-16 w-16"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        )

      case 'grid':
        return (
          <div className={`bg-white rounded-xl p-4 ${className}`}>
            <div className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-40 w-full mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        )

      case 'profile':
        return (
          <div className={`bg-white rounded-2xl p-6 ${className}`}>
            <div className="animate-pulse">
              <div className="flex items-center space-x-4 mb-6">
                <div className="bg-gray-200 rounded-full h-20 w-20"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        )

      case 'order':
        return (
          <div className={`bg-white rounded-2xl p-4 shadow-sm border border-gray-100 ${className}`}>
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-2 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
              <div className="space-y-3 mb-4">
                <div className="flex gap-3">
                  <div className="bg-gray-200 rounded-lg h-16 w-16"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
              <div className="border-t pt-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        )

      case 'product':
        return (
          <div className={`bg-white rounded-2xl ${className}`}>
            <div className="animate-pulse">
              <div className="bg-gray-200 rounded-t-2xl h-96 w-full mb-6"></div>
              <div className="px-6 pb-6 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                </div>
                <div className="flex gap-3 pt-4">
                  <div className="h-12 bg-gray-200 rounded-lg flex-1"></div>
                  <div className="h-12 bg-gray-200 rounded-lg w-32"></div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'text':
        return (
          <div className={`animate-pulse space-y-2 ${className}`}>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        )

      default:
        return (
          <div className={`bg-gray-200 animate-pulse rounded h-32 ${className}`}></div>
        )
    }
  }

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </>
  )
}
