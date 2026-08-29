const DNA_KEY = 'ai-video-studio-project-dna'
let currentDNA = null

function safeParse(value) {
  if (typeof value !== 'string') return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

export function createProjectDNA() {
  const defaultDNA = {
    channelName: '日本の異変',
    targetMarket: 'Japan',
    language: 'Japanese',
    audience: 'Japanese men 40-65 interested in society, economy and politics',
    tone: 'Cold, objective documentary',
    storyStyle: 'Critical Inquiry',
    hookStyle: 'Question + Curiosity',
    endingStyle: 'Open debate',
    visualStyle: 'Cinematic documentary',
    narrationStyle: 'Calm, intelligent, evidence-based',
    emotionCurve: 'Curiosity\n↓\nConcern\n↓\nConflict\n↓\nReflection',
    contentRules: '- Always use official sources\n- Never invent facts\n- Always cite statistics\n- Avoid political bias\n- Encourage thinking'
  }

  const dna = { ...defaultDNA }
  currentDNA = dna
  return dna
}

export function updateProjectDNA(dna, updates) {
  const nextDNA = { ...dna, ...updates }
  currentDNA = nextDNA
  return nextDNA
}

export function loadProjectDNA() {
  if (typeof window === 'undefined' || !window.localStorage) return null
  const raw = window.localStorage.getItem(DNA_KEY)
  const dna = safeParse(raw)
  if (dna && typeof dna === 'object') {
    currentDNA = dna
    return dna
  }
  return null
}

export function saveProjectDNA() {
  if (typeof window === 'undefined' || !window.localStorage) return
  if (!currentDNA) return
  try {
    window.localStorage.setItem(DNA_KEY, JSON.stringify(currentDNA))
  } catch {
    // ignore persistence errors in browser
  }
}
