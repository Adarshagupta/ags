const SUB_PRODUCT_PREFIX = 'sub:'

function normalizeId(value: string) {
  return value.trim()
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

export function extractSubProductIdsFromTags(tags: string[] | null | undefined) {
  const values = Array.isArray(tags) ? tags : []
  return unique(
    values
      .map((tag) => String(tag || '').trim())
      .filter((tag) => tag.startsWith(SUB_PRODUCT_PREFIX))
      .map((tag) => normalizeId(tag.slice(SUB_PRODUCT_PREFIX.length)))
  )
}

export function stripSubProductTags(tags: string[] | null | undefined) {
  const values = Array.isArray(tags) ? tags : []
  return values
    .map((tag) => String(tag || '').trim())
    .filter((tag) => tag.length > 0 && !tag.startsWith(SUB_PRODUCT_PREFIX))
}

export function mergeSubProductTags(tags: string[] | null | undefined, subProductIds: string[] | null | undefined) {
  const cleanTags = stripSubProductTags(tags)
  const ids = unique((Array.isArray(subProductIds) ? subProductIds : []).map((id) => normalizeId(String(id || ''))))
  return [...cleanTags, ...ids.map((id) => `${SUB_PRODUCT_PREFIX}${id}`)]
}
