export const VIDEO_PROJECT_SCHEMA_VERSION = 3

export function createEmptyGenerations() {
  return {
    image: {
      status: 'not_started',
      provider: 'gemini',
      prompt: '',
      negativePrompt: '',

      // assetId sẽ liên kết tới file ảnh trong Image Library.
      assetId: '',
      fileName: '',
      mimeType: '',
      sizeBytes: null,
      width: null,
      height: null,

      createdAt: null,
      importedAt: null
    },

    // Để sẵn cấu trúc cho tính năng tạo video trong tương lai.
    video: {
      status: 'not_started',
      provider: 'flow',
      prompt: '',
      sourceImageAssetId: '',
      assetId: '',
      fileName: '',
      mimeType: '',
      sizeBytes: null,
      durationSec: null,
      createdAt: null,
      importedAt: null
    }
  }
}

export function createEmptyScene(sceneNumber = 1) {
  return {
    sceneId: `scene-${String(sceneNumber).padStart(3, '0')}`,
    sceneNumber,
    title: '',
    durationSec: 7,
    narration: '',
    visualObjective: '',
    visualType: 'cinematic',
    cameraDirection: '',
    motionDirection: '',
    emotion: '',
    transition: '',
    onScreenText: '',
    imagePrompt: '',
    negativePrompt: '',
    aspectRatio: '16:9',
    subjectConsistency: '',
    notes: '',
    imageStatus: 'pending',
    voiceStatus: 'pending',
    generations: createEmptyGenerations()
  }
}

export function createVideoProjectData(project = {}) {
  return {
    schemaVersion: VIDEO_PROJECT_SCHEMA_VERSION,
    projectId: project.id || '',
    videoTitle: project.topic || '',
    language: project.language || 'Japanese',
    targetDurationSec: parseDurationToSeconds(project.duration),
    visualStyle: project.dna?.visualStyle || '',
    scenes: []
  }
}

export function normalizeScene(scene = {}, index = 0) {
  const sceneNumber = Number(
    scene.sceneNumber ||
    scene.scene ||
    index + 1
  )

  const emptyGenerations = createEmptyGenerations()

  return {
    ...createEmptyScene(sceneNumber),
    ...scene,

    sceneId:
      scene.sceneId ||
      scene.id ||
      `scene-${String(sceneNumber).padStart(3, '0')}`,

    sceneNumber,

    durationSec: Number(
      scene.durationSec ||
      scene.estimatedDurationSec ||
      scene.duration ||
      7
    ),

    narration:
      scene.narration ||
      scene.voice ||
      scene.voiceover ||
      '',

    visualObjective:
      scene.visualObjective ||
      scene.visualDescription ||
      scene.visual ||
      '',

    generations: {
      image: {
        ...emptyGenerations.image,
        ...(scene.generations?.image || {}),

        prompt:
          scene.generations?.image?.prompt ||
          scene.imagePrompt ||
          '',

        negativePrompt:
          scene.generations?.image?.negativePrompt ||
          scene.negativePrompt ||
          ''
      },

      video: {
        ...emptyGenerations.video,
        ...(scene.generations?.video || {})
      }
    }
  }
}

export function normalizeScenes(scenes) {
  if (!Array.isArray(scenes)) return []

  return scenes.map((scene, index) =>
    normalizeScene(scene, index)
  )
}

export function parseDurationToSeconds(duration) {
  if (typeof duration === 'number') {
    return duration
  }

  const match = String(duration || '').match(/\d+/)

  if (!match) {
    return 900
  }

  return Number(match[0]) * 60
}