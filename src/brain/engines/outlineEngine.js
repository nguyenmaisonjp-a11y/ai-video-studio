import { getOutputLanguageInstruction, detectTopicLanguage } from '../utils/language.js'
import { cleanText, valueOrNotSpecified } from '../utils/formatter.js'
import { normalizeAudience } from '../utils/audience.js'

const SYSTEM_INSTRUCTION = `SYSTEM INSTRUCTION\nYou are a senior YouTube documentary structure editor.`

const OUTPUT_REQUIREMENTS = `Create a detailed outline with:\n\n1. Working Title\n2. Central Question\n3. Core Argument\n4. Hook\n5. Opening Promise\n6. Section 1\n7. Section 2\n8. Section 3\n9. Section 4\n10. Conflict or opposing viewpoint\n11. Future scenario\n12. Conclusion\n13. Final audience question\n14. Retention notes for each section\n15. Estimated duration for each section\n\nFor every section include:\n- Purpose\n- Main point\n- Supporting evidence\n- Emotional function\n- Transition to the next section\n- Estimated duration`

const OUTLINE_TEMPLATE = ({ core, objective, language, market, audience, mustInclude, avoid, research }) => {
  const normalizedLanguage = getOutputLanguageInstruction(language || detectTopicLanguage(core))
  const normalizedCore = valueOrNotSpecified(core)
  const normalizedObjective = valueOrNotSpecified(objective)
  const normalizedMarket = valueOrNotSpecified(market)
  const normalizedAudience = normalizeAudience(audience, market, language)
  const normalizedMustInclude = valueOrNotSpecified(mustInclude)
  const normalizedAvoid = valueOrNotSpecified(avoid)
  const normalizedResearch = valueOrNotSpecified(research)

  return [
    SYSTEM_INSTRUCTION,
    '',
    'Your task is to transform the provided research into a high-retention video outline.',
    '',
    'You must:',
    '- Preserve factual accuracy.',
    '- Build a strong narrative progression.',
    '- Avoid repetitive sections.',
    '- Create curiosity gaps.',
    '- Place the strongest evidence strategically.',
    '- Present opposing viewpoints fairly.',
    '- Make every section advance the central argument.',
    '- Never fabricate facts beyond the supplied research.',
    '',
    'PROJECT CONTEXT',
    `Topic: ${normalizedCore}`,
    `Target Market: ${normalizedMarket}`,
    `Output Language: ${language || normalizedLanguage}`,
    `Audience: ${normalizedAudience}`,
    '',
    'VIDEO OBJECTIVE',
    normalizedObjective,
    '',
    'CORE ARGUMENT',
    normalizedCore,
    '',
    'MUST INCLUDE',
    normalizedMustInclude,
    '',
    'AVOID',
    normalizedAvoid,
    '',
    'SOURCE RESEARCH',
    normalizedResearch,
    '',
    'OUTPUT REQUIREMENTS',
    OUTPUT_REQUIREMENTS,
    '',
    'VERY IMPORTANT',
    normalizedLanguage,
    '',
    'Do not invent facts.\nOnly use facts contained in the supplied research.\nDo not include explanations outside the requested outline.'
  ].join('\n')
}

export const OutlineEngine = {
  generate(input) {
    if (!input || !cleanText(input.core)) {
      throw new Error('Vui lòng nhập trọng tâm video để tạo outline.')
    }

    return OUTLINE_TEMPLATE(input)
  }
}
