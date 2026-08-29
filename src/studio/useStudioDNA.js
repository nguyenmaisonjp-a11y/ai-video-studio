import { useState } from 'react'
import {
  getStudioDNA,
  setStudioDNA,
  applyPreset,
  PRESETS
} from './studioDNA.js'

export function useStudioDNA() {
  const [dna, setDnaState] =
    useState(() => getStudioDNA())

  function update(updates) {
    const next = setStudioDNA(updates)
    setDnaState(next)
    return next
  }

  function selectPreset(name) {
    const next = applyPreset(name)
    setDnaState(next)
    return next
  }

  return {
    dna,
    update,
    selectPreset,
    presets: PRESETS
  }
}

export default useStudioDNA