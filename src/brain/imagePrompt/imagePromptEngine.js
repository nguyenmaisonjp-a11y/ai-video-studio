import { buildImagePromptTemplate } from './imagePromptTemplate.js'
import { normalizeScenes } from '../../lib/videoProjectSchema.js'
import { validateStoryboardScenes } from '../../lib/storyboardValidator.js'

export const ImagePromptEngine = {
  generate(input = {}) {
    const {
      topic = '',
      language = 'Japanese',
      audience = '',
      visualStyle = '',
      aspectRatio = '16:9',
      storyboardScenes = []
    } = input

    if (!topic.trim()) {
      throw new Error('Image Prompt Engine: thiếu topic.')
    }

    if (!Array.isArray(storyboardScenes) || storyboardScenes.length === 0) {
      throw new Error('Image Prompt Engine: chưa có Storyboard scenes.')
    }

    const normalizedScenes = normalizeScenes(storyboardScenes)

    const validationErrors = validateStoryboardScenes(normalizedScenes)

    if (validationErrors.length > 0) {
      throw new Error(
        `Image Prompt Engine: Storyboard chưa hợp lệ.\n${validationErrors.join('\n')}`
      )
    }

    return buildImagePromptTemplate({
      topic,
      language,
      audience,
      visualStyle,
      aspectRatio,
      storyboardScenes: normalizedScenes
    })
  }
}