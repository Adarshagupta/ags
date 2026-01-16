'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Category {
  id: string
  name: string
  emoji: string
}

export default function CategorySlider() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories([{ id: 'all', name: 'All', emoji: '🍽️' }, ...data])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  return (
    <div className="bg-white -mx-4 px-4">
      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">What's on your mind?</h2>
      <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide">
        {categories.length === 0 ? (
          // Loading skeleton
          <>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex-shrink-0 w-16 sm:w-20">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </>
        ) : (
          categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 flex flex-col items-center w-16 sm:w-20"
            >
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mb-2 transition-all ${
                  selectedCategory === category.id
                    ? 'bg-orange-100 shadow-md'
                    : 'bg-gray-100'
                }`}
              >
                <span className="text-3xl sm:text-4xl">{category.emoji}</span>
              </div>
              <span className="text-xs font-medium text-gray-900 text-center truncate w-full">
                {category.name}
              </span>
            </motion.button>
          ))
        )}
      </div>
    </div>
  )
}
