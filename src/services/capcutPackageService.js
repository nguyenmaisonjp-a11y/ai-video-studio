import {
  normalizeScenes
} from '../lib/videoProjectSchema.js'

function padSceneNumber(sceneNumber) {
  return String(sceneNumber).padStart(
    3,
    '0'
  )
}

function sanitizeFileName(value) {
  return String(value || '')
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function getFileExtension(fileName, mimeType) {
  const name = String(fileName || '')
  const dotIndex = name.lastIndexOf('.')

  if (
    dotIndex >= 0 &&
    dotIndex < name.length - 1
  ) {
    return name
      .slice(dotIndex + 1)
      .toLowerCase()
  }

  const extensionsByMimeType = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif'
  }

  return (
    extensionsByMimeType[mimeType] ||
    'jpg'
  )
}

function escapeCsv(value) {
  const text = String(
    value ?? ''
  ).replace(/"/g, '""')

  return `"${text}"`
}

function createDownload(
  data,
  fileName,
  mimeType
) {
  const blob =
    data instanceof Blob
      ? data
      : new Blob([data], {
          type: mimeType
        })

  const url = URL.createObjectURL(blob)
  const anchor =
    document.createElement('a')

  anchor.href = url
  anchor.download = fileName

  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()

  window.setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 1000)
}

export const CapCutPackageService = {
  preparePackage(project = {}) {
    const scenes = normalizeScenes(
      project.storyboardScenes || []
    )

    let timelinePositionSec = 0

    const timelineScenes = scenes.map(
      scene => {
        const image =
          scene.generations?.image || {}

        const video =
          scene.generations?.video || {}

        const durationSec = Number(
          video.durationSec ||
          scene.durationSec ||
          7
        )

        const hasVideo =
          Boolean(video.assetId) &&
          Boolean(video.fileName)

        const sourceGeneration =
          hasVideo
            ? video
            : image

        const mediaType =
          hasVideo
            ? 'video'
            : 'image'

        const extension =
          getFileExtension(
            sourceGeneration.fileName,
            sourceGeneration.mimeType
          )

        const outputFileName =
          `scene-${padSceneNumber(
            scene.sceneNumber
          )}.${extension}`

        const timelineScene = {
          sceneId: scene.sceneId,
          sceneNumber:
            scene.sceneNumber,
          title: scene.title || '',
          mediaType,
          assetId:
            sourceGeneration.assetId ||
            '',
          sourceFileName:
            sourceGeneration.fileName ||
            '',
          outputFileName,
          mimeType:
            sourceGeneration.mimeType ||
            '',
          startSec:
            timelinePositionSec,
          durationSec,
          endSec:
            timelinePositionSec +
            durationSec,
          narration:
            scene.narration || '',
          visualObjective:
            scene.visualObjective || '',
          transition:
            scene.transition || '',
          onScreenText:
            scene.onScreenText || ''
        }

        timelinePositionSec +=
          durationSec

        return timelineScene
      }
    )

    return {
      packageVersion: 1,
      projectId: project.id || '',
      projectTitle:
        project.topic || 'Untitled Project',
      safeProjectName:
        sanitizeFileName(
          project.topic ||
            'untitled-project'
        ),
      language:
        project.language || '',
      market:
        project.market || '',
      createdAt: Date.now(),
      totalDurationSec:
        timelinePositionSec,
      totalScenes:
        timelineScenes.length,
      scenes: timelineScenes
    }
  },

  validatePackage(packageData = {}) {
    const errors = []
    const scenes = Array.isArray(
      packageData.scenes
    )
      ? packageData.scenes
      : []

    if (scenes.length === 0) {
      errors.push(
        'Project chưa có scene để đóng gói.'
      )

      return errors
    }

    scenes.forEach(scene => {
      const label =
        `Scene ${scene.sceneNumber}`

      if (!scene.assetId) {
        errors.push(
          `${label} chưa có assetId.`
        )
      }

      if (!scene.sourceFileName) {
        errors.push(
          `${label} chưa có tên file media.`
        )
      }

      if (
        !Number.isFinite(
          scene.durationSec
        ) ||
        scene.durationSec <= 0
      ) {
        errors.push(
          `${label} có thời lượng không hợp lệ.`
        )
      }
    })

    return errors
  },

  createManifestJson(packageData) {
    return JSON.stringify(
      packageData,
      null,
      2
    )
  },

  createTimelineCsv(packageData) {
    const header = [
      'sceneNumber',
      'sceneId',
      'mediaType',
      'fileName',
      'startSec',
      'durationSec',
      'endSec',
      'narration',
      'visualObjective',
      'transition',
      'onScreenText'
    ]

    const rows = packageData.scenes.map(
      scene => [
        scene.sceneNumber,
        scene.sceneId,
        scene.mediaType,
        scene.outputFileName,
        scene.startSec,
        scene.durationSec,
        scene.endSec,
        scene.narration,
        scene.visualObjective,
        scene.transition,
        scene.onScreenText
      ]
    )

    return [header, ...rows]
      .map(row =>
        row
          .map(escapeCsv)
          .join(',')
      )
      .join('\n')
  },

  createNarrationText(packageData) {
    return packageData.scenes
      .map(scene =>
        [
          `SCENE ${scene.sceneNumber}`,
          `START: ${scene.startSec}s`,
          `DURATION: ${scene.durationSec}s`,
          '',
          scene.narration ||
            '[Không có narration]',
          ''
        ].join('\n')
      )
      .join('\n')
  },

  downloadManifest(packageData) {
    this.downloadText(
      this.createManifestJson(
        packageData
      ),
      'capcut-manifest.json',
      'application/json'
    )
  },

  downloadTimeline(packageData) {
    this.downloadText(
      this.createTimelineCsv(
        packageData
      ),
      'capcut-timeline.csv',
      'text/csv;charset=utf-8'
    )
  },

  downloadNarration(packageData) {
    this.downloadText(
      this.createNarrationText(
        packageData
      ),
      'narration.txt',
      'text/plain;charset=utf-8'
    )
  },

  downloadText(
    content,
    fileName,
    mimeType
  ) {
    createDownload(
      content,
      fileName,
      mimeType
    )
  },

  downloadMedia(blob, fileName) {
    createDownload(
      blob,
      fileName,
      blob.type ||
        'application/octet-stream'
    )
  }
}