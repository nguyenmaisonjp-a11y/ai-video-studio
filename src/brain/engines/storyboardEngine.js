
import { cleanText } from '../utils/formatter.js'
import { STORYBOARD_TEMPLATE } from '../templates/storyboardTemplate.js'

export const StoryboardEngine = {
  generate(input) {
    if (!input || !cleanText(input.topic)) {
      throw new Error('Vui lòng cung cấp `topic` để tạo Storyboard Prompt.')
    }
    if (!input || !cleanText(input.humanizedScriptResult)) {
      throw new Error('Vui lòng dán `humanizedScriptResult` để tạo Storyboard Prompt.')
    }

    return STORYBOARD_TEMPLATE(input)
  }
}
