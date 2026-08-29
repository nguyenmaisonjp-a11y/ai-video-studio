import { getOutputLanguageInstruction, detectTopicLanguage } from '../utils/language.js'
import { cleanText, valueOrNotSpecified } from '../utils/formatter.js'
import { normalizeAudience } from '../utils/audience.js'

const SYSTEM_INSTRUCTION = `SYSTEM INSTRUCTION:\nYou are a senior research analyst specializing in creating high-quality research for professional YouTube documentary channels.\n\nYour responsibilities:\n- Perform deep research.\n- Use reliable and up-to-date sources.\n- Distinguish facts, assumptions and opinions.\n- Never fabricate statistics.\n- Never fabricate references.\n- Mention publication dates whenever possible.\n- Present both supporting and opposing viewpoints.\n- Clearly indicate uncertainty if evidence is insufficient.\n\nYour final goal is to help produce a documentary-quality YouTube video.`

const STRUCTURE = `Return the research using the following structure.\n\n1. Executive Summary\n\n2. Background\n\n3. Timeline\n\n4. Key Facts\n\n5. Latest Statistics\n\n6. Government Policies\n\n7. Supporting Arguments\n\n8. Opposing Arguments\n\n9. Potential Risks\n\n10. Future Scenarios\n\n11. Important Quotes\n\n12. Recommended Video Hooks\n\n13. Recommended Story Structure\n\n14. List of Sources`

const RESEARCH_TEMPLATE = ({ topic, objective, language, market, audience, keyQuestions, sources, emotions }) => {
  const normalizedLanguage = getOutputLanguageInstruction(language || detectTopicLanguage(topic))
  const normalizedTopic = cleanText(topic)
  const normalizedObjective = valueOrNotSpecified(objective)
  const normalizedMarket = valueOrNotSpecified(market)
  const normalizedAudience = normalizeAudience(audience, market, language)
  const normalizedQuestions = valueOrNotSpecified(keyQuestions)
  const normalizedSources = valueOrNotSpecified(sources)
  const normalizedEmotions = emotions && emotions.length ? emotions.join(', ') : 'None'

  const projectBrief = [
    'PROJECT BRIEF:',
    `Topic: ${normalizedTopic}`,
    `Target Market: ${normalizedMarket}`,
    `Target Audience: ${normalizedAudience}`,
    `Output Language: ${language || normalizedLanguage}`,
    `Desired Emotions: ${normalizedEmotions}`,
    '',
    'Research Goal',
    normalizedObjective,
    '',
    'Key Questions',
    normalizedQuestions,
    '',
    'Source Requirements',
    normalizedSources
  ].join('\n')

  const outputDirective = `VERY IMPORTANT\n${normalizedLanguage}`

  return [
    SYSTEM_INSTRUCTION,
    '',
    projectBrief,
    '',
    '==========================',
    '',
    STRUCTURE,
    '',
    outputDirective
  ].join('\n\n')
}

export const ResearchEngine = {
  generate(input) {
    if (!input || !cleanText(input.topic)) {
      throw new Error('Vui lòng nhập chủ đề nghiên cứu.')
    }

    return RESEARCH_TEMPLATE(input)
  }
}
