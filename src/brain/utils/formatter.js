export function cleanText(value) {
  if (value == null) return ''
  return String(value).trim()
}

export function valueOrNotSpecified(value) {
  const cleaned = cleanText(value)
  return cleaned.length ? cleaned : 'Not specified.'
}

export function formatList(value) {
  if (!value) return 'Not specified.'
  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : 'Not specified.'
  }
  const cleaned = cleanText(value)
  return cleaned.length ? cleaned : 'Not specified.'
}

export function createSection(title, content) {
  return `${title}\n${valueOrNotSpecified(content)}`
}
