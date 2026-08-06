import { cleanText } from './formatter.js'

export function normalizeAudience(value, market, language) {
  const audience = cleanText(value)
  if (audience.length) return audience
  if (market && language) {
    return `Audience in ${market} who speak ${language}`
  }
  return 'Not specified.'
}
