function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function inlineMarkdown(value: string) {
  const escaped = escapeHtml(value)

  return escaped
    .replace(/`([^`]+)`/g, '<code class="rounded bg-slate-100 px-1 py-0.5 text-[0.92em]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-pink-600 underline">$1</a>')
}

export function renderProductDescriptionMarkdown(raw: string) {
  const lines = String(raw || '').replace(/\r\n/g, '\n').split('\n')
  const chunks: string[] = []
  let listItems: string[] = []

  const flushList = () => {
    if (listItems.length === 0) return
    chunks.push(`<ul class="list-disc space-y-1 pl-5">${listItems.join('')}</ul>`)
    listItems = []
  }

  for (const line of lines) {
    const value = line.trim()

    if (!value) {
      flushList()
      continue
    }

    const headingMatch = value.match(/^(#{1,3})\s+(.+)$/)
    if (headingMatch) {
      flushList()
      const level = headingMatch[1].length
      const content = inlineMarkdown(headingMatch[2])
      const className =
        level === 1
          ? 'text-2xl font-semibold text-slate-900'
          : level === 2
            ? 'text-xl font-semibold text-slate-900'
            : 'text-lg font-semibold text-slate-900'
      chunks.push(`<h${level} class="${className}">${content}</h${level}>`)
      continue
    }

    const listMatch = value.match(/^[-*]\s+(.+)$/)
    if (listMatch) {
      listItems.push(`<li>${inlineMarkdown(listMatch[1])}</li>`)
      continue
    }

    flushList()
    chunks.push(`<p>${inlineMarkdown(value)}</p>`)
  }

  flushList()
  return chunks.join('\n')
}
