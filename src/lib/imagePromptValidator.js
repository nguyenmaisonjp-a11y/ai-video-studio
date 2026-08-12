export function validateImagePromptResult(data, storyboardScenes = []) {
  const errors = []

  if (!data || typeof data !== 'object') {
    return ['Image Prompt Result phải là một JSON object.']
  }

  if (data.schemaVersion !== 1) {
    errors.push('schemaVersion phải bằng 1.')
  }

  if (!Array.isArray(data.scenes)) {
    errors.push('Thiếu mảng scenes.')
    return errors
  }

  if (data.scenes.length === 0) {
    errors.push('Image Prompt Result không có scene nào.')
    return errors
  }

  if (
    Array.isArray(storyboardScenes) &&
    storyboardScenes.length > 0 &&
    data.scenes.length !== storyboardScenes.length
  ) {
    errors.push(
      `Số scene không khớp: Storyboard có ${storyboardScenes.length}, Image Prompt có ${data.scenes.length}.`
    )
  }

  const seenSceneIds = new Set()
  const seenSceneNumbers = new Set()

  data.scenes.forEach((scene, index) => {
    const label = scene.sceneNumber || index + 1

    if (!scene.sceneId || typeof scene.sceneId !== 'string' || !scene.sceneId.trim()) {
      errors.push(`Scene ${label}: thiếu sceneId.`)
    } else if (seenSceneIds.has(scene.sceneId)) {
      errors.push(`Scene ${label}: sceneId bị trùng (${scene.sceneId}).`)
    } else {
      seenSceneIds.add(scene.sceneId)
    }

    const sceneNumber = Number(scene.sceneNumber)

    if (!Number.isFinite(sceneNumber) || sceneNumber <= 0) {
      errors.push(`Scene ${label}: sceneNumber không hợp lệ.`)
    } else if (seenSceneNumbers.has(sceneNumber)) {
      errors.push(`Scene ${label}: sceneNumber bị trùng.`)
    } else {
      seenSceneNumbers.add(sceneNumber)
    }

    if (!scene.imagePrompt || typeof scene.imagePrompt !== 'string' || !scene.imagePrompt.trim()) {
      errors.push(`Scene ${label}: thiếu imagePrompt.`)
    }

    if (
      scene.negativePrompt !== undefined &&
      typeof scene.negativePrompt !== 'string'
    ) {
      errors.push(`Scene ${label}: negativePrompt phải là chuỗi.`)
    }

    if (!scene.aspectRatio || typeof scene.aspectRatio !== 'string' || !scene.aspectRatio.trim()) {
      errors.push(`Scene ${label}: thiếu aspectRatio.`)
    }

    if (
      scene.visualStyle !== undefined &&
      typeof scene.visualStyle !== 'string'
    ) {
      errors.push(`Scene ${label}: visualStyle phải là chuỗi.`)
    }

    if (
      scene.camera !== undefined &&
      typeof scene.camera !== 'string'
    ) {
      errors.push(`Scene ${label}: camera phải là chuỗi.`)
    }

    if (
      scene.lighting !== undefined &&
      typeof scene.lighting !== 'string'
    ) {
      errors.push(`Scene ${label}: lighting phải là chuỗi.`)
    }

    if (
      scene.composition !== undefined &&
      typeof scene.composition !== 'string'
    ) {
      errors.push(`Scene ${label}: composition phải là chuỗi.`)
    }

    if (
      scene.subjectConsistency !== undefined &&
      typeof scene.subjectConsistency !== 'string'
    ) {
      errors.push(`Scene ${label}: subjectConsistency phải là chuỗi.`)
    }

    if (
      scene.textPolicy !== undefined &&
      typeof scene.textPolicy !== 'string'
    ) {
      errors.push(`Scene ${label}: textPolicy phải là chuỗi.`)
    }
  })

  if (Array.isArray(storyboardScenes) && storyboardScenes.length > 0) {
    data.scenes.forEach((scene, index) => {
      const sourceScene = storyboardScenes[index]

      if (!sourceScene) return

      if (
        sourceScene.sceneId &&
        scene.sceneId !== sourceScene.sceneId
      ) {
        errors.push(
          `Scene ${index + 1}: sceneId không khớp Storyboard. Mong đợi "${sourceScene.sceneId}", nhận "${scene.sceneId}".`
        )
      }

      if (
        Number(sourceScene.sceneNumber) &&
        Number(scene.sceneNumber) !== Number(sourceScene.sceneNumber)
      ) {
        errors.push(
          `Scene ${index + 1}: sceneNumber không khớp Storyboard.`
        )
      }
    })
  }

  return errors
}