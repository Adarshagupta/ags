import { randomUUID } from 'crypto'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
])

function sanitizeFolderName(value: string): string {
  const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '')
  return cleaned || 'products'
}

function extensionForMime(mime: string): string {
  if (mime === 'image/jpeg' || mime === 'image/jpg') return '.jpg'
  if (mime === 'image/png') return '.png'
  if (mime === 'image/webp') return '.webp'
  if (mime === 'image/gif') return '.gif'
  return '.jpg'
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const role = session?.user?.role

    if (!session || (role !== 'ADMIN' && role !== 'SELLER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const folderName = sanitizeFolderName(String(formData.get('folder') || 'products'))

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Image file is required' }, { status: 400 })
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Only JPG, PNG, WEBP and GIF images are allowed' },
        { status: 400 }
      )
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Image size must be 5MB or smaller' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const extension = extensionForMime(file.type)
    const filename = `${Date.now()}-${randomUUID()}${extension}`

    const relativeDir = path.join('uploads', folderName)
    const absoluteDir = path.join(process.cwd(), 'public', relativeDir)
    const absolutePath = path.join(absoluteDir, filename)

    await mkdir(absoluteDir, { recursive: true })
    await writeFile(absolutePath, buffer)

    const normalizedRelativeDir = relativeDir.replace(/\\/g, '/')
    const url = `/${normalizedRelativeDir}/${filename}`

    return NextResponse.json({ url, filename, size: file.size, type: file.type })
  } catch (error) {
    console.error('Image upload failed:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}
