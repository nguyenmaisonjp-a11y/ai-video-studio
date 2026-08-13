import { ImagePromptEngine } from '../brain/imagePrompt/imagePromptEngine.js'
import { parseImagePromptResult } from '../brain/imagePrompt/imagePromptParser.js'
import { validateImagePromptResult } from '../lib/imagePromptValidator.js'

export const ImagePromptService = {
  generatePrompt(project = {}) {
    const storyboardScenes = Array.isArray(project.storyboardScenes)
      ? project.storyboardScenes
      : []

    return ImagePromptEngine.generate({
      topic: project.topic || '',
      language: project.language || 'Japanese',
      audience: project.audience || '',
      visualStyle:
        project.visualStyle ||
        project.dna?.visualStyle ||
        '',
      aspectRatio: project.aspectRatio || '16:9',
      storyboardScenes
    })
  },

  parseAndValidate(rawResult, storyboardScenes = []) {
    const parsed = parseImagePromptResult(rawResult)

    const errors = validateImagePromptResult(
      parsed,
      storyboardScenes
    )

    if (errors.length > 0) {
      return {
        ok: false,
        data: null,
        errors
      }
    }

    return {
      ok: true,
      data: parsed,
      errors: []
    }
  },

  mergeIntoStoryboard(
    storyboardScenes = [],
    imagePromptData = {}
  ) {
    if (!Array.isArray(storyboardScenes)) {
      throw new Error(
        'Storyboard scenes không hợp lệ.'
      )
    }

    if (
      !imagePromptData ||
      !Array.isArray(imagePromptData.scenes)
    ) {
      throw new Error(
        'Image Prompt data không hợp lệ.'
      )
    }

    const promptMap = new Map(
      imagePromptData.scenes.map(scene => [
        scene.sceneId,
        scene
      ])
    )

    return storyboardScenes.map(scene => {
      const imageData = promptMap.get(
        scene.sceneId
      )

      if (!imageData) {
        return scene
      }

      return {
        ...scene,

        imagePrompt:
          imageData.imagePrompt || '',

        negativePrompt:
          imageData.negativePrompt || '',

        aspectRatio:
          imageData.aspectRatio ||
          scene.aspectRatio ||
          '16:9',

        visualStyle:
          imageData.visualStyle ||
          scene.visualStyle ||
          '',

        cameraDirection:
          imageData.camera ||
          scene.cameraDirection ||
          '',

        lighting:
          imageData.lighting ||
          scene.lighting ||
          '',

        composition:
          imageData.composition ||
          scene.composition ||
          '',

        subjectConsistency:
          imageData.subjectConsistency ||
          scene.subjectConsistency ||
          '',

        textPolicy:
          imageData.textPolicy ||
          scene.textPolicy ||
          'avoid-generated-text',

        imageStatus: 'prompt-ready'
      }
    })
  }
}