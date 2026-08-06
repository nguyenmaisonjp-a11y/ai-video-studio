import { getOutputLanguageInstruction, detectTopicLanguage } from '../utils/language.js'
import { cleanText, valueOrNotSpecified } from '../utils/formatter.js'
import { normalizeAudience } from '../utils/audience.js'

export function SCRIPT_TEMPLATE(input) {
  const {
    topic,
    market,
    language,
    duration,
    style,
    audience,
    emotions,
    projectDNA,
    scriptObjective,
    narrationTone,
    retentionStrategy,
    mustPreserve,
    mustAvoid,
    outlineResult,
    researchResult
  } = input

  const outputLanguage = getOutputLanguageInstruction(language || detectTopicLanguage(topic))
  const normalizedAudience = normalizeAudience(audience, market, language)
  const normalizedObjective = valueOrNotSpecified(scriptObjective)
  const normalizedTone = valueOrNotSpecified(narrationTone)
  const normalizedRetention = valueOrNotSpecified(retentionStrategy)
  const normalizedPreserve = valueOrNotSpecified(mustPreserve)
  const normalizedAvoid = valueOrNotSpecified(mustAvoid)
  const normalizedDNA = projectDNA ? JSON.stringify(projectDNA, null, 2) : 'None'

  return [
    'SYSTEM INSTRUCTION:',
    'You are a senior Japanese YouTube documentary scriptwriter and retention editor. Write in natural spoken language appropriate for the selected output language.',
    '',
    'PROJECT CONTEXT:',
    `Topic: ${cleanText(topic)}`,
    `Market: ${valueOrNotSpecified(market)}`,
    `Duration: ${valueOrNotSpecified(duration)}`,
    `Style: ${valueOrNotSpecified(style)}`,
    `Output language instruction: ${outputLanguage}`,
    `Audience: ${normalizedAudience}`,
    '',
    'PROJECT DNA:',
    normalizedDNA,
    '',
    'BRIEF:',
    `Script objective: ${normalizedObjective}`,
    `Narration tone: ${normalizedTone}`,
    `Retention strategy: ${normalizedRetention}`,
    `Must preserve: ${normalizedPreserve}`,
    `Must avoid: ${normalizedAvoid}`,
    '',
    'SOURCE MATERIAL: (Use only facts from these sources — do not invent facts or sources)',
    '--- Outline result ---',
    outlineResult,
    '--- Research result ---',
    valueOrNotSpecified(researchResult),
    '',
    'OUTPUT REQUIREMENTS:',
    '- Use natural spoken language, not robotic or overly academic.',
    '- Create a very strong opening hook and opening promise.',
    '- Ensure clear narrative progression and transitions.',
    '- Build curiosity gaps and retention beats across sections.',
    '- Present opposing viewpoints fairly and cite only provided evidence.',
    '- Do not invent facts or sources.',
    '- Avoid repetition and long blocks of identical phrasing.',
    '- Pace writing for the selected duration and AI voice narration.',
    '- Do not include stage directions (those belong to later stages).',
    '- Return output structured as: Working title; Hook; Opening promise; Full narration script; Section transitions; Final reflection; Final audience question.',
    '',
    'VERY IMPORTANT:',
    outputLanguage,
    '',
    'LANGUAGE NOTES:',
    '- For Japanese output: avoid translated-sounding phrasing; prefer natural spoken Japanese; vary sentence length and rhythm; keep calm, evidence-based tone.',
    '',
    'DELIVER IN THE REQUESTED LANGUAGE ONLY.',
    '',
    'END'
  ].join('\n')
}
