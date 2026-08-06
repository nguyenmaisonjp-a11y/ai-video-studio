export const SUPPORTED_LANGUAGES = ['Japanese', 'English', 'Vietnamese']

export function normalizeLanguage(value) {
  if (!value) return 'English'
  const normalized = value.toString().trim().toLowerCase()
  if (normalized === 'tiếng nhật' || normalized === 'japanese') return 'Japanese'
  if (normalized === 'tiếng anh' || normalized === 'english') return 'English'
  if (normalized === 'tiếng việt' || normalized === 'vietnamese') return 'Vietnamese'
  return 'English'
}

export function getOutputLanguageInstruction(value) {
  const language = normalizeLanguage(value)
  if (language === 'Japanese') return 'Return EVERYTHING in natural Japanese.'
  if (language === 'Vietnamese') return 'Return EVERYTHING in Vietnamese.'
  return 'Return EVERYTHING in English.'
}

export function detectTopicLanguage(topic) {
  if (!topic) return 'English'
  const text = topic.toString().trim()
  const japaneseChars = /[\u3040-\u30FF\u4E00-\u9FFF]/
  if (japaneseChars.test(text)) return 'Japanese'
  const vietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i
  if (vietnameseChars.test(text)) return 'Vietnamese'
  return 'English'
}
