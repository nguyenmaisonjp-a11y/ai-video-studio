export function parseImagePromptResult(raw) {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error('Image Prompt Parser: kết quả rỗng.')
  }

  let text = raw.trim()

  // Remove markdown code fences if Gemini returns them
  text = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()

  // If Gemini adds text before/after JSON,
  // try extracting the outermost JSON object.
  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('Image Prompt Parser: không tìm thấy JSON object hợp lệ.')
  }

  const jsonText = text.slice(firstBrace, lastBrace + 1)

  let parsed

  try {
    parsed = JSON.parse(jsonText)
  } catch (error) {
    throw new Error(
      `Image Prompt Parser: JSON không hợp lệ. ${error.message}`
    )
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Image Prompt Parser: kết quả không phải JSON object.')
  }

  if (!Array.isArray(parsed.scenes)) {
    throw new Error('Image Prompt Parser: thiếu mảng scenes.')
  }

  return parsed
}