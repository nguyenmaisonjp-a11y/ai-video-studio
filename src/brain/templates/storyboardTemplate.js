import { getOutputLanguageInstruction, detectTopicLanguage } from '../utils/language.js'
import { cleanText, valueOrNotSpecified } from '../utils/formatter.js'
import { normalizeAudience } from '../utils/audience.js'

export function STORYBOARD_TEMPLATE(input) {
  const {
    topic,
    language,
    duration,
    audience,
    projectDNA,
    studioDNA,
    humanizedScriptResult
  } = input

  const outputLanguage = getOutputLanguageInstruction(language || detectTopicLanguage(topic))
  const normalizedAudience = normalizeAudience(audience, null, language)
  const normalizedDNA = projectDNA ? JSON.stringify(projectDNA, null, 2) : 'None'
  const normalizedStudioDNA = studioDNA ? JSON.stringify(studioDNA, null, 2) : 'None'

  return [
    'SYSTEM INSTRUCTION:',
    'You are a senior YouTube documentary storyboard director and visual editor. Produce a professional production storyboard in JSON only.',
    '',
    'PROJECT CONTEXT:',
    `Topic: ${cleanText(topic)}`,
    `Duration: ${valueOrNotSpecified(duration)}`,
    `Audience: ${valueOrNotSpecified(normalizedAudience)}`,
    `Output language instruction: ${outputLanguage}`,
    '',
    'PROJECT DNA:',
    normalizedDNA,
    '',
    'STUDIO DNA:',
    normalizedStudioDNA,
    '',
    'SOURCE MATERIAL:',
    'Use only the humanized script below to produce the storyboard. Preserve all facts and meaning. Do not invent new facts.',
    '',
    'HUMANIZED SCRIPT:',
    humanizedScriptResult,
    '',
    'OUTPUT REQUIREMENTS:',
    '- Return JSON ONLY. No markdown fences, no explanations, no additional text.',
    '- Return an array of scene objects with exactly these keys: sceneNumber, title, narration, estimatedDurationSec, visualObjective, visualType, cameraDirection, motionDirection, emotion, transition, onScreenText, imagePrompt, notes.',
    '- Preserve narration meaning and do not invent facts.',
    '- Break the script into scenes roughly 5–10 seconds each when practical.',
    '- Use varied visual concepts; avoid static repetition.',
    '- Keep Japanese documentary sensibility when output language is Japanese.',
    '- Prefer diagrams, maps, charts, documents, timelines or symbolic visuals for fact-heavy sections.',
    '- Use restrained symbolic visuals for emotional sections.',
    '- Each scene must have a clear visual purpose.',
    '- Estimated duration should reflect the scene pacing and total script length.',
    '',
    'SCENE FORMAT:',
    'sceneNumber: integer',
    'title: short descriptive title',
    'narration: spoken narration text',
    'estimatedDurationSec: scene duration in seconds',
    'visualObjective: what the viewer should see or understand',
    'visualType: type of imagery or visual treatment',
    'cameraDirection: camera movement or framing direction',
    'motionDirection: visual motion or flow',
    'emotion: emotional tone conveyed',
    'transition: how the scene transitions from the previous scene',
    'onScreenText: any text displayed on screen',
    'imagePrompt: short prompt for the visual scene',
    'notes: additional production notes',
    '',
    'DELIVER IN THE REQUESTED LANGUAGE ONLY.',
    outputLanguage,
    '',
    'END'
  ].join('\n')
}
