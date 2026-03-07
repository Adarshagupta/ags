export const ARCHIVED_PRODUCT_TAG = '__system_archived_product__'

export function appendArchivedProductTag(tags: string[] | null | undefined) {
  const nextTags = Array.isArray(tags) ? tags.filter(Boolean) : []

  if (nextTags.includes(ARCHIVED_PRODUCT_TAG)) {
    return nextTags
  }

  return [...nextTags, ARCHIVED_PRODUCT_TAG]
}

export function sanitizeProductTags(input: unknown) {
  if (!Array.isArray(input)) {
    return []
  }

  return input
    .map((tag) => String(tag || '').trim())
    .filter((tag) => tag && tag !== ARCHIVED_PRODUCT_TAG)
}
