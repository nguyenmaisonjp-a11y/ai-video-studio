import { VOICESCRIPT_TEMPLATE } from '../templates/voiceScriptTemplate.js'

export const VoiceScriptEngine = {
  generate(input) {
    if (!input) throw new Error('Missing input for VoiceScriptEngine.generate')
    if (!input.humanizedScriptResult || input.humanizedScriptResult.trim().length === 0) {
      throw new Error('Vui lòng dán `humanizedScriptResult` để tạo Voice Script Prompt.')
    }
    return VOICESCRIPT_TEMPLATE(input)
  }
}
