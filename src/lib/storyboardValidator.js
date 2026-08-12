export function validateStoryboardScenes(scenes) {
  const errors = []

  if (!Array.isArray(scenes)) {
    return ['Storyboard phải là một mảng JSON.']
  }

  if (scenes.length === 0) {
    errors.push('Storyboard không có scene nào.')
    return errors
  }

  const seenSceneNumbers = new Set()
  const seenSceneIds = new Set()

  scenes.forEach((scene, index) => {
    const sceneNo = Number(scene.sceneNumber || index + 1)

    if (!scene.sceneId?.trim()) {
      errors.push(`Scene ${sceneNo}: thiếu sceneId.`)
    } else if (seenSceneIds.has(scene.sceneId)) {
      errors.push(`Scene ${sceneNo}: sceneId bị trùng (${scene.sceneId}).`)
    } else {
      seenSceneIds.add(scene.sceneId)
    }

    if (!Number.isFinite(sceneNo) || sceneNo <= 0) {
      errors.push(`Scene ${index + 1}: sceneNumber không hợp lệ.`)
    } else if (seenSceneNumbers.has(sceneNo)) {
      errors.push(`Scene ${sceneNo}: sceneNumber bị trùng.`)
    } else {
      seenSceneNumbers.add(sceneNo)
    }

    if (!scene.narration?.trim()) {
      errors.push(`Scene ${sceneNo}: thiếu narration.`)
    }

    if (!scene.visualObjective?.trim()) {
      errors.push(`Scene ${sceneNo}: thiếu visualObjective.`)
    }

    if (
      !Number.isFinite(Number(scene.durationSec)) ||
      Number(scene.durationSec) <= 0
    ) {
      errors.push(`Scene ${sceneNo}: durationSec không hợp lệ.`)
    }

    if (!scene.aspectRatio?.trim()) {
      errors.push(`Scene ${sceneNo}: thiếu aspectRatio.`)
    }
  })

  return errors
}