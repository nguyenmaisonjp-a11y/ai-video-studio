const PROJECT_KEY = 'ai-video-studio-project'
const STAGE_KEY = 'ai-video-studio-current-stage'

function safeParse(value) {
  if (typeof value !== 'string') return null
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

function getStorage() {
  return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null
}

export function saveProject(project) {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.setItem(PROJECT_KEY, JSON.stringify(project))
  } catch {
    // Ignore storage errors in development mode
  }
}

export function loadProject() {
  const storage = getStorage()
  if (!storage) return null
  const raw = storage.getItem(PROJECT_KEY)
  const project = safeParse(raw)
  return project && typeof project === 'object' ? project : null
}

export function clearProject() {
  const storage = getStorage()
  if (!storage) return
  storage.removeItem(PROJECT_KEY)
  storage.removeItem(STAGE_KEY)
}

export function saveCurrentStage(stage) {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.setItem(STAGE_KEY, JSON.stringify(stage))
  } catch {
    // Ignore storage errors in development mode
  }
}

export function loadCurrentStage() {
  const storage = getStorage()
  if (!storage) return null
  const raw = storage.getItem(STAGE_KEY)
  const stage = safeParse(raw)
  return typeof stage === 'string' ? stage : null
}
