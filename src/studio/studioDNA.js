import { loadStudioDNA, saveStudioDNA } from './studioStorage.js'

export const DEFAULT_STUDIO_DNA = {
  audience: '',
  language: '',
  tone: '',
  narrative: '',
  evidence: '',
  visual: '',
  voice: '',
  retention: '',
  model: ''
}

export const PRESETS = {
  'Japanese Documentary': {
    audience: 'Japanese adults 25-60 interested in society and economy',
    language: 'Japanese',
    tone: 'Calm, evidence-based',
    narrative: 'Documentary investigative',
    evidence: 'Prefer official sources and statistics; no fabricated facts',
    visual: 'Cinematic documentary',
    voice: 'Calm and authoritative',
    retention: 'Strong opening hook with curiosity gaps',
    model: 'Gemini'
  },
  'NHK Style': {
    audience: 'Broad Japanese audience',
    language: 'Japanese',
    tone: 'Neutral, informative',
    narrative: 'Balanced reporting',
    evidence: 'High standard of sourcing; cite official documents',
    visual: 'Conservative, clear',
    voice: 'Warm neutral',
    retention: 'Clear promises and evidence-led pacing',
    model: 'Gemini'
  },
  'Cold Intelligence': {
    audience: 'Specialist viewers interested in analysis',
    language: 'Japanese',
    tone: 'Cold, analytical',
    narrative: 'Analytical deep-dive',
    evidence: 'Prioritize statistics and official reports',
    visual: 'Minimal, data-driven',
    voice: 'Measured, unemotional',
    retention: 'Build tension through data and counterpoints',
    model: 'Gemini'
  },
  'Neutral Analysis': {
    audience: 'International viewers',
    language: 'English',
    tone: 'Neutral analysis',
    narrative: 'Comparative analysis',
    evidence: 'Use diverse reputable sources',
    visual: 'Informative graphics',
    voice: 'Clear, explanatory',
    retention: 'Use questions and summaries to retain viewers',
    model: 'Gemini'
  }
}

let studioDNA = { ...DEFAULT_STUDIO_DNA }

function init() {
  const stored = loadStudioDNA()
  if (stored && typeof stored === 'object') {
    studioDNA = { ...DEFAULT_STUDIO_DNA, ...stored }
  } else {
    studioDNA = { ...DEFAULT_STUDIO_DNA }
    saveStudioDNA(studioDNA)
  }
}

init()

export function getStudioDNA() {
  return { ...studioDNA }
}

export function setStudioDNA(updates) {
  studioDNA = { ...studioDNA, ...updates }
  try { saveStudioDNA(studioDNA) } catch (e) {}
  // return fresh copy
  return getStudioDNA()
}

export function applyPreset(name) {
  const preset = PRESETS[name]
  if (!preset) return getStudioDNA()
  studioDNA = { ...DEFAULT_STUDIO_DNA, ...preset }
  try { saveStudioDNA(studioDNA) } catch (e) {}
  return getStudioDNA()
}

export default {
  getStudioDNA,
  setStudioDNA,
  applyPreset,
  PRESETS,
  DEFAULT_STUDIO_DNA
}
