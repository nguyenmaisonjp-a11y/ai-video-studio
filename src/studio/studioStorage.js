const STUDIO_KEY = 'ai-video-studio-studio-dna'

function safeParse(value) {
  if (typeof value !== 'string') return null

  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export function saveStudioDNA(dna) {
  if (
    typeof window === 'undefined' ||
    !window.localStorage
  ) return

  try {
    window.localStorage.setItem(
      STUDIO_KEY,
      JSON.stringify(dna)
    )
  } catch {
    // Bỏ qua lỗi localStorage.
  }
}

export function loadStudioDNA() {
  if (typeof window === 'undefined' || !window.localStorage) return null
  try {
    const raw = window.localStorage.getItem(STUDIO_KEY)
    const parsed = safeParse(raw)
    return parsed
  } catch {
    return null
  }
}

export function clearStudioDNA() {
  if (
    typeof window === 'undefined' ||
    !window.localStorage
  ) return

  try {
    window.localStorage.removeItem(STUDIO_KEY)
  } catch {
    // Bỏ qua lỗi localStorage.
  }
}
