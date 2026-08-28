import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import ImageLibraryView from '../views/ImageLibraryView.jsx'
import { ImageLibraryStorage } from '../services/imageLibraryStorage.js'
import { normalizeScenes } from '../lib/videoProjectSchema.js'
import { WorkflowEngine } from '../workflow/workflowEngine.js'

export default function ImageLibraryController({
  project,
  onProjectChange,
  onBackToGeminiFlow,
  onBackToDashboard
}) {
  const [assetsByScene, setAssetsByScene] =
    useState({})

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [statusMessage, setStatusMessage] =
    useState('')

  const previewUrlsRef = useRef(new Set())

  const scenes = useMemo(
    () =>
      normalizeScenes(
        project?.storyboardScenes || []
      ),
    [project?.storyboardScenes]
  )

  function revokePreviewUrls() {
    previewUrlsRef.current.forEach(url => {
      URL.revokeObjectURL(url)
    })

    previewUrlsRef.current.clear()
  }

  function requireProjectChange() {
    if (
      typeof onProjectChange !== 'function'
    ) {
      throw new Error(
        'Image Library chưa được nối với project state.'
      )
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadAssets() {
      if (!project?.id) {
        setAssetsByScene({})
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const assets =
          await ImageLibraryStorage.getProjectAssets(
            project.id
          )

        if (cancelled) return

        revokePreviewUrls()

        const nextAssetsByScene = {}

        assets.forEach(asset => {
          if (!asset.sceneId || !asset.blob) {
            return
          }

          const previewUrl =
            URL.createObjectURL(asset.blob)

          previewUrlsRef.current.add(
            previewUrl
          )

          nextAssetsByScene[asset.sceneId] = {
            ...asset,
            previewUrl
          }
        })

        setAssetsByScene(
          nextAssetsByScene
        )
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              'Không thể đọc kho ảnh.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadAssets()

    return () => {
      cancelled = true
      revokePreviewUrls()
    }
  }, [project?.id])

  async function handleImportImage(
    sceneId,
    file
  ) {
    try {
      if (!project?.id) {
        throw new Error(
          'Không tìm thấy project.'
        )
      }

      requireProjectChange()
      setLoading(true)
      setError('')
      setStatusMessage('')

      const metadata =
        await ImageLibraryStorage.saveImage({
          projectId: project.id,
          sceneId,
          file
        })

      const storedAsset =
        await ImageLibraryStorage.getAsset(
          metadata.assetId
        )

      if (!storedAsset?.blob) {
        throw new Error(
          'Ảnh đã lưu nhưng không thể đọc lại.'
        )
      }

      const previewUrl =
        URL.createObjectURL(
          storedAsset.blob
        )

      previewUrlsRef.current.add(
        previewUrl
      )

      setAssetsByScene(current => {
        const previous =
          current[sceneId]

        if (previous?.previewUrl) {
          URL.revokeObjectURL(
            previous.previewUrl
          )

          previewUrlsRef.current.delete(
            previous.previewUrl
          )
        }

        return {
          ...current,

          [sceneId]: {
            ...storedAsset,
            previewUrl
          }
        }
      })

      const nextScenes = scenes.map(scene => {
        if (scene.sceneId !== sceneId) {
          return scene
        }

        return {
          ...scene,

          generations: {
            ...scene.generations,

            image: {
              ...scene.generations.image,
              status: 'imported',
              assetId: metadata.assetId,
              fileName: metadata.fileName,
              mimeType: metadata.mimeType,
              sizeBytes: metadata.sizeBytes,
              importedAt:
                metadata.importedAt
            }
          }
        }
      })

      const nextProject = {
        ...project,
        storyboardScenes: nextScenes,
        imageLibrarySaved: false
      }

      onProjectChange(nextProject)

      setStatusMessage(
        `Đã nhập ${metadata.fileName}.`
      )
    } catch (err) {
      setError(
        err?.message ||
          'Không thể nhập ảnh.'
      )
    } finally {
      setLoading(false)
    }
  }

  function handleCompleteImageLibrary() {
    try {
      requireProjectChange()

      if (scenes.length === 0) {
        throw new Error(
          'Project chưa có scene.'
        )
      }

      const missingScenes = scenes.filter(
        scene =>
          !assetsByScene[scene.sceneId]
      )

      if (missingScenes.length > 0) {
        throw new Error(
          `Còn ${missingScenes.length} scene chưa nhập ảnh.`
        )
      }

      const imageLibraryStage =
        project.workflow?.find(
          stage =>
            stage.id === 'imageLibrary'
        )

      if (!imageLibraryStage) {
        throw new Error(
          'Giai đoạn Image Library không tồn tại trong workflow.'
        )
      }

      let nextWorkflow =
        project.workflow

      if (
        imageLibraryStage.status ===
          'active' ||
        imageLibraryStage.status ===
          'available'
      ) {
        const {
          workflow: completedWorkflow,
          error: workflowError
        } = WorkflowEngine.completeStage(
          project.workflow,
          'imageLibrary'
        )

        if (workflowError) {
          throw new Error(
            workflowError
          )
        }

        nextWorkflow =
          completedWorkflow
      } else if (
        imageLibraryStage.status !==
        'completed'
      ) {
        throw new Error(
          `Không thể hoàn thành Image Library khi trạng thái hiện tại là '${imageLibraryStage.status}'.`
        )
      }

      const nextProject = {
        ...project,
        imageLibrarySaved: true,
        imageLibraryCompletedAt:
          Date.now(),
        workflow: nextWorkflow
      }

      onProjectChange(nextProject)

      setError('')
      setStatusMessage(
        'Image Library đã hoàn thành.'
      )
    } catch (err) {
      setError(
        err?.message ||
          'Không thể hoàn thành Image Library.'
      )
    }
  }

  if (!project) {
    return (
      <div className="error-message">
        Không tìm thấy project cho Image Library.
      </div>
    )
  }

  return (
    <ImageLibraryView
      project={project}
      scenes={scenes}
      assetsByScene={assetsByScene}
      loading={loading}
      error={error}
      statusMessage={statusMessage}
      onImportImage={
        handleImportImage
      }
      onCompleteImageLibrary={
        handleCompleteImageLibrary
      }
      onBackToGeminiFlow={
        onBackToGeminiFlow
      }
      onBackToDashboard={
        onBackToDashboard
      }
    />
  )
}