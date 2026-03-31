'use client'

import { useRef, useState } from 'react'

type ImageDropUploadProps = {
  label: string
  onFileSelect: (file: File | null) => void
  helperText?: string
  disabled?: boolean
}

export default function ImageDropUpload({
  label,
  onFileSelect,
  helperText = 'JPG, PNG, WEBP or GIF. Max size 5MB.',
  disabled = false,
}: ImageDropUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedName, setSelectedName] = useState('')

  const applyFile = (file: File | null) => {
    setSelectedName(file?.name || '')
    onFileSelect(file)
  }

  return (
    <div className="space-y-2">
      <div
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          setIsDragging(false)
        }}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          if (disabled) return
          applyFile(event.dataTransfer.files?.[0] || null)
        }}
        className={`rounded-xl border-2 border-dashed px-4 py-4 text-sm transition ${
          disabled
            ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
            : isDragging
              ? 'border-orange-400 bg-orange-50 text-orange-700'
              : 'cursor-pointer border-gray-300 bg-white text-gray-600 hover:border-orange-300 hover:bg-orange-50/40'
        }`}
      >
        <p className="font-medium">{label}</p>
        <p className="mt-1 text-xs text-gray-500">Drag & drop or click to choose an image file</p>
        {selectedName ? <p className="mt-2 truncate text-xs font-semibold text-gray-700">{selectedName}</p> : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(event) => applyFile(event.target.files?.[0] || null)}
        className="hidden"
        disabled={disabled}
      />
      <p className="text-xs text-gray-500">{helperText}</p>
    </div>
  )
}
