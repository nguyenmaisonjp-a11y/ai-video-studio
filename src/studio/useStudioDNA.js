import { useState, useEffect } from 'react'
import { getStudioDNA, setStudioDNA, applyPreset, PRESETS } from './studioDNA.js'

export function useStudioDNA() {
  const [dna, setDnaState] = useState(() => getStudioDNA())

  useEffect(() => {
    // sync from storage on mount
    setDnaState(getStudioDNA())
  }, [])

  function update(updates) {
    const next = setStudioDNA(updates)
    setDnaState(next)
    return next
  }

  function usePreset(name) {
    const next = applyPreset(name)
    setDnaState(next)
    return next
  }

  return {
    dna,
    update,
    usePreset,
    presets: PRESETS
  }
}

export default useStudioDNA
