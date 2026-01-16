'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Category {
  id: string
  name: string
  emoji: string
  type: string
}

interface CategorySectionProps {
  type: 'PRODUCT' | 'RECIPIENT' | 'OCCASION'
  title: string
}

export default function CategorySection({ type, title }: CategorySectionProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    fetchCategories()
  }, [type])

  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/categories?type=${type}`)
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  if (categories.length === 0) return null

  return (
    <div>
      {title && <h2 className="text-base font-semibold text-gray-900 mb-3">{title}</h2>}
      
      {/* Clean Horizontal Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 flex flex-col items-center"
          >
            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center mb-2 transition-all ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-br from-orange-100 to-pink-100 ring-2 ring-orange-500'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100'
              }`}
            >
              <span className="text-4xl">
                {category.emoji}
              </span>
            </div>
            <span className={`text-xs font-medium text-center w-20 line-clamp-2 ${
              selectedCategory === category.id ? 'text-orange-600' : 'text-gray-700'
            }`}>
              {category.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
