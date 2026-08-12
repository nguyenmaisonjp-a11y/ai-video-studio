export const VIDEO_PROJECT_SCHEMA_VERSION = 1

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
    voiceStatus: 'pending'
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
  const sceneNumber = Number(scene.sceneNumber || scene.scene || index + 1)

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
      ''
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