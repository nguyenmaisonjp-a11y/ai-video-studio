const WORKFLOW_KEY = 'ai-video-studio-workflow'

function safeParse(value) {
  if (typeof value !== 'string') return null
  try {
    return JSON.parse(value)
  } catch (error) {
    return null
  }
}

function getStorage() {
  return typeof window !== 'undefined' && window.localStorage ? window.localStorage : null
}

export function saveWorkflow(workflow) {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.setItem(WORKFLOW_KEY, JSON.stringify(workflow))
  } catch (error) {
    // ignore storage errors
  }
}

export function loadWorkflow() {
  const storage = getStorage()
  if (!storage) return null
  const raw = storage.getItem(WORKFLOW_KEY)
  const workflow = safeParse(raw)
  return Array.isArray(workflow) ? workflow : null
}

export function clearWorkflow() {
  const storage = getStorage()
  if (!storage) return
  storage.removeItem(WORKFLOW_KEY)
}
