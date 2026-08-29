import {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import CapCutPackageView from '../views/CapCutPackageView.jsx'
import { CapCutPackageService } from '../services/capcutPackageService.js'
import { ImageLibraryStorage } from '../services/imageLibraryStorage.js'
import { WorkflowEngine } from '../workflow/workflowEngine.js'

export default function CapCutPackageController({
  project,
  onProjectChange,
  onBackToImageLibrary,
  onBackToDashboard
}) {
  const [assetsById, setAssetsById] =
    useState({})

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')

  const [statusMessage, setStatusMessage] =
    useState('')

  const previewUrlsRef = useRef(new Set())

  const packageData = useMemo(
    () =>
      CapCutPackageService.preparePackage(
        project || {}
      ),
    [project]
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
        'CapCut Package chưa được nối với project state.'
      )
    }
  }

  useEffect(() => {
    let cancelled = false

    async function loadAssets() {
      if (!project?.id) {
        setAssetsById({})
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

        const nextAssetsById = {}

        assets.forEach(asset => {
          if (!asset.assetId || !asset.blob) {
            return
          }

          const previewUrl =
            URL.createObjectURL(
              asset.blob
            )

          previewUrlsRef.current.add(
            previewUrl
          )

          nextAssetsById[
            asset.assetId
          ] = {
            ...asset,
            previewUrl
          }
        })

        setAssetsById(nextAssetsById)
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.message ||
              'Không thể đọc media từ Image Library.'
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

  function handleDownloadManifest() {
    try {
      CapCutPackageService.downloadManifest(
        packageData
      )

      setError('')
      setStatusMessage(
        'Đã tải capcut-manifest.json.'
      )
    } catch (err) {
      setError(
        err?.message ||
          'Không thể tải manifest.'
      )
    }
  }

  function handleDownloadTimeline() {
    try {
      CapCutPackageService.downloadTimeline(
        packageData
      )

      setError('')
      setStatusMessage(
        'Đã tải capcut-timeline.csv.'
      )
    } catch (err) {
      setError(
        err?.message ||
          'Không thể tải timeline.'
      )
    }
  }

  function handleDownloadNarration() {
    try {
      CapCutPackageService.downloadNarration(
        packageData
      )

      setError('')
      setStatusMessage(
        'Đã tải narration.txt.'
      )
    } catch (err) {
      setError(
        err?.message ||
          'Không thể tải narration.'
      )
    }
  }

  function handleDownloadMedia(scene) {
    try {
      const asset =
        assetsById[scene.assetId]

      if (!asset?.blob) {
        throw new Error(
          `Không tìm thấy media của Scene ${scene.sceneNumber}.`
        )
      }

      CapCutPackageService.downloadMedia(
        asset.blob,
        scene.outputFileName
      )

      setError('')
      setStatusMessage(
        `Đã tải ${scene.outputFileName}.`
      )
    } catch (err) {
      setError(
        err?.message ||
          'Không thể tải media.'
      )
    }
  }

  function handleCompleteCapCutPackage() {
    try {
      requireProjectChange()

      const validationErrors =
        CapCutPackageService.validatePackage(
          packageData
        )

      packageData.scenes.forEach(scene => {
        if (!assetsById[scene.assetId]) {
          validationErrors.push(
            `Không tìm thấy media thật của Scene ${scene.sceneNumber}.`
          )
        }
      })

      if (validationErrors.length > 0) {
        throw new Error(
          validationErrors.join('\n')
        )
      }

      const capCutStage =
        project.workflow?.find(
          stage =>
            stage.id ===
            'capcutPackage'
        )

      if (!capCutStage) {
        throw new Error(
          'Giai đoạn CapCut Package không tồn tại trong workflow.'
        )
      }

      let nextWorkflow =
        project.workflow

      if (
        capCutStage.status === 'active' ||
        capCutStage.status === 'available'
      ) {
        const {
          workflow: completedWorkflow,
          error: workflowError
        } = WorkflowEngine.completeStage(
          project.workflow,
          'capcutPackage'
        )

        if (workflowError) {
          throw new Error(
            workflowError
          )
        }

        nextWorkflow =
          completedWorkflow
      } else if (
        capCutStage.status !== 'completed'
      ) {
        throw new Error(
          `Không thể hoàn thành CapCut Package khi trạng thái hiện tại là '${capCutStage.status}'.`
        )
      }

      const nextProject = {
        ...project,

        capcutPackage: {
          packageVersion:
            packageData.packageVersion,
          totalScenes:
            packageData.totalScenes,
          totalDurationSec:
            packageData.totalDurationSec,
          generatedAt: Date.now()
        },

        capcutPackageSaved: true,
        capcutPackageCompletedAt:
          Date.now(),
        workflow: nextWorkflow
      }

      onProjectChange(nextProject)

      setError('')
      setStatusMessage(
        'CapCut Package đã hoàn thành.'
      )
    } catch (err) {
      setError(
        err?.message ||
          'Không thể hoàn thành CapCut Package.'
      )
    }
  }

  if (!project) {
    return (
      <div className="error-message">
        Không tìm thấy project cho CapCut Package.
      </div>
    )
  }

  return (
    <CapCutPackageView
      project={project}
      packageData={packageData}
      assetsById={assetsById}
      loading={loading}
      error={error}
      statusMessage={statusMessage}
      onDownloadMedia={
        handleDownloadMedia
      }
      onDownloadManifest={
        handleDownloadManifest
      }
      onDownloadTimeline={
        handleDownloadTimeline
      }
      onDownloadNarration={
        handleDownloadNarration
      }
      onCompleteCapCutPackage={
        handleCompleteCapCutPackage
      }
      onBackToImageLibrary={
        onBackToImageLibrary
      }
      onBackToDashboard={
        onBackToDashboard
      }
    />
  )
}