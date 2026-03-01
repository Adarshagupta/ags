type UploadImageResponse = {
  url: string
  filename: string
  size: number
  type: string
}

export async function uploadProductImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', 'products')

  const response = await fetch('/api/uploads', {
    method: 'POST',
    body: formData,
  })

  let payload: UploadImageResponse | { error?: string } | null = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const message =
      payload && 'error' in payload && payload.error
        ? payload.error
        : 'Failed to upload image'
    throw new Error(message)
  }

  if (!payload || !('url' in payload) || !payload.url) {
    throw new Error('Upload response was missing image URL')
  }

  return payload.url
}
