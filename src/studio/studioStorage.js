const STUDIO_KEY = 'ai-video-studio-studio-dna'

function safeParse(v) {
  if (typeof v !== 'string') return null
  try { return JSON.parse(v) } catch (e) { return null }
}

export function saveStudioDNA(dna) {
  if (typeof window === 'undefined' || !window.localStorage) return
  try { window.localStorage.setItem(STUDIO_KEY, JSON.stringify(dna)) } catch (e) { }
}

export function loadStudioDNA() {
  if (typeof window === 'undefined' || !window.localStorage) return null
  try {
    const raw = window.localStorage.getItem(STUDIO_KEY)
    const parsed = safeParse(raw)
    return parsed
  } catch (e) {
    return null
  }
}

export function clearStudioDNA() {
  if (typeof window === 'undefined' || !window.localStorage) return
  try { window.localStorage.removeItem(STUDIO_KEY) } catch (e) { }
}
