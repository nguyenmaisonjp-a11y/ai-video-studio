import { getOutputLanguageInstruction, detectTopicLanguage } from '../utils/language.js'
import { cleanText, valueOrNotSpecified } from '../utils/formatter.js'

import { SCRIPT_TEMPLATE } from '../templates/scriptTemplate.js'

export const ScriptEngine = {
  generate(input) {
    if (!input || !cleanText(input.topic)) {
      throw new Error('Vui lòng cung cấp `topic` để tạo Script Prompt.')
    }
    if (!input || !cleanText(input.outlineResult)) {
      throw new Error('Vui lòng dán `outlineResult` để tạo Script Prompt.')
    }

    return SCRIPT_TEMPLATE(input)
  }
}
