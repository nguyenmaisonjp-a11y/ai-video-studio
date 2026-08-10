import { getOutputLanguageInstruction, detectTopicLanguage } from '../utils/language.js'
import { cleanText, valueOrNotSpecified } from '../utils/formatter.js'
import { normalizeAudience } from '../utils/audience.js'

export function HUMANIZE_TEMPLATE(input) {
  const {
    topic,
    language,
    audience,
    duration,
    projectDNA,
    studioDNA,
    scriptResult,
    humanizeObjective,
    naturalnessLevel,
    narrationRhythm,
    retentionStyle,
    mustPreserve,
    mustAvoid
  } = input

  const outputLanguage = getOutputLanguageInstruction(language || detectTopicLanguage(topic))
  const normalizedAudience = normalizeAudience(audience, null, language)
  const normalizedObjective = valueOrNotSpecified(humanizeObjective)
  const normalizedNaturalness = valueOrNotSpecified(naturalnessLevel)
  const normalizedRhythm = valueOrNotSpecified(narrationRhythm)
  const normalizedRetention = valueOrNotSpecified(retentionStyle)
  const normalizedPreserve = valueOrNotSpecified(mustPreserve)
  const normalizedAvoid = valueOrNotSpecified(mustAvoid)
  const normalizedDNA = projectDNA ? JSON.stringify(projectDNA, null, 2) : 'None'
  const normalizedStudioDNA = studioDNA ? JSON.stringify(studioDNA, null, 2) : 'None'

  return [
    'SYSTEM INSTRUCTION:',
    'You are a senior Japanese YouTube documentary script editor and natural-language voiceover editor.',
    '',
    'PROJECT CONTEXT:',
    `Topic: ${cleanText(topic)}`,
    `Duration: ${valueOrNotSpecified(duration)}`,
    `Audience: ${normalizedAudience}`,
    `Output language instruction: ${outputLanguage}`,
    '',
    'PROJECT DNA:',
    normalizedDNA,
    '',
    'STUDIO DNA:',
    normalizedStudioDNA,
    '',
    'HUMANIZE BRIEF:',
    `Objective: ${normalizedObjective}`,
    `Naturalness level: ${normalizedNaturalness}`,
    `Narration rhythm: ${normalizedRhythm}`,
    `Retention style: ${normalizedRetention}`,
    `Must preserve: ${normalizedPreserve}`,
    `Must avoid: ${normalizedAvoid}`,
    '',
    'SOURCE SCRIPT:',
    'Use only the original script below. Do not modify the original script source content, but create a humanized version in natural spoken Japanese with the same meaning and duration.',
    '',
    'ORIGINAL SCRIPT:',
    scriptResult,
    '',
    'OUTPUT REQUIREMENTS:',
    '- Return only the full humanized narration text. No explanations, no markdown, no notes, no stage directions.',
    '- For Japanese output: use natural spoken Japanese, not translated-sounding or robotic AI phrasing.',
    '- Vary sentence length and rhythm while maintaining a calm documentary style.',
    '- Preserve factual meaning, statistics, citations, and source intent.',
    '- Preserve neutrality and do not invent facts.',
    '- Improve transitions and retention with subtle curiosity gaps and rhetorical questions only where useful.',
    '- Avoid excessive drama, repetitive sentence endings, and exaggerated emotion.',
    '- Do not shorten aggressively, and maintain approximately the same total duration as the original script.',
    '',
    'LANGUAGE NOTE:',
    'Output in the requested language only.',
    outputLanguage,
    '',
    'END'
  ].join('\n')
}
