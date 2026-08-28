import {
  createEmptyGenerations,
  normalizeScenes
} from '../lib/videoProjectSchema.js'

const IMAGE_READY_STATUSES = new Set([
  'generated',
  'downloaded'
])

function getSceneId(scene = {}) {
  return scene.sceneId || ''
}

function createImageGeneration(scene = {}) {
  const current = scene.generations?.image || {}

  return {
    ...createEmptyGenerations().image,
    ...current,

    status:
      current.status ||
      (scene.imagePrompt
        ? 'prompt_ready'
        : 'not_started'),

    prompt:
      current.prompt ||
      scene.imagePrompt ||
      '',

    negativePrompt:
      current.negativePrompt ||
      scene.negativePrompt ||
      ''
  }
}

export const GeminiFlowService = {
  prepareScenes(project = {}) {
    const scenes = normalizeScenes(
      project.storyboardScenes || []
    )

    return scenes.map(scene => ({
      ...scene,

      generations: {
        ...createEmptyGenerations(),
        ...(scene.generations || {}),

        image: createImageGeneration(scene),

        video: {
          ...createEmptyGenerations().video,
          ...(scene.generations?.video || {})
        }
      }
    }))
  },

  createGeminiPrompt(scene = {}) {
    const imageGeneration =
      createImageGeneration(scene)

    if (!imageGeneration.prompt.trim()) {
      throw new Error(
        `Scene ${scene.sceneNumber || ''} chưa có Image Prompt.`
      )
    }

    const negativePrompt =
      imageGeneration.negativePrompt.trim()

    return [
      'Create one production-ready still image.',
      '',
      `SCENE ID: ${getSceneId(scene)}`,
      `ASPECT RATIO: ${scene.aspectRatio || '16:9'}`,
      '',
      'IMAGE PROMPT:',
      imageGeneration.prompt,
      '',
      negativePrompt
        ? `NEGATIVE PROMPT:\n${negativePrompt}`
        : '',
      '',
      'REQUIREMENTS:',
      '- Return one image only.',
      '- Do not add captions, subtitles, logos, or watermarks.',
      '- Preserve realistic anatomy, architecture, lighting, and perspective.',
      '- Follow the requested aspect ratio.',
      '- Maintain visual consistency with the project style.'
    ]
      .filter(Boolean)
      .join('\n')
  },

  updateImageGeneration(
    storyboardScenes = [],
    sceneId,
    updates = {}
  ) {
    if (!sceneId) {
      throw new Error('Thiếu sceneId.')
    }

    let found = false

    const nextScenes = normalizeScenes(
      storyboardScenes
    ).map(scene => {
      if (getSceneId(scene) !== sceneId) {
        return scene
      }

      found = true

      const currentImage =
        createImageGeneration(scene)

      return {
        ...scene,

        generations: {
          ...createEmptyGenerations(),
          ...(scene.generations || {}),

          image: {
            ...currentImage,
            ...updates
          },

          video: {
            ...createEmptyGenerations().video,
            ...(scene.generations?.video || {})
          }
        }
      }
    })

    if (!found) {
      throw new Error(
        `Không tìm thấy scene ${sceneId}.`
      )
    }

    return nextScenes
  },

  getProgress(storyboardScenes = []) {
    const scenes = normalizeScenes(
      storyboardScenes
    )

    if (scenes.length === 0) {
      return {
        completed: 0,
        total: 0,
        percent: 0
      }
    }

    const completed = scenes.filter(scene => {
      const image = createImageGeneration(scene)

      return IMAGE_READY_STATUSES.has(
        image.status
      )
    }).length

    return {
      completed,
      total: scenes.length,
      percent: Math.round(
        (completed / scenes.length) * 100
      )
    }
  },

  validateCompletion(storyboardScenes = []) {
    const scenes = normalizeScenes(
      storyboardScenes
    )

    const errors = []

    if (scenes.length === 0) {
      errors.push(
        'Project chưa có Storyboard scene.'
      )

      return errors
    }

    scenes.forEach(scene => {
      const image = createImageGeneration(scene)
      const label = `Scene ${scene.sceneNumber}`

      if (!image.prompt.trim()) {
        errors.push(
          `${label} chưa có Image Prompt.`
        )
      }

      if (
        !IMAGE_READY_STATUSES.has(image.status)
      ) {
        errors.push(
          `${label} chưa xác nhận đã tạo ảnh.`
        )
      }

      if (!image.fileName.trim()) {
        errors.push(
          `${label} chưa có tên file ảnh đã tải.`
        )
      }
    })

    return errors
  }
}