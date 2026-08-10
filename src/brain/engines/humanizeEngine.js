import { cleanText } from '../utils/formatter.js'
import { HUMANIZE_TEMPLATE } from '../templates/humanizeTemplate.js'

export const HumanizeEngine = {
  generate(input) {
    if (!input || !cleanText(input.topic)) {
      throw new Error('Vui lòng cung cấp `topic` để tạo Humanize Prompt.')
    }
    if (!input || !cleanText(input.scriptResult)) {
      throw new Error('Vui lòng cung cấp `scriptResult` để tạo Humanize Prompt.')
    }

    return HUMANIZE_TEMPLATE(input)
  }
}
