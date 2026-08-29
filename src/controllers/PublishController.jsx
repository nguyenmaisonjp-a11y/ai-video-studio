import {
  useEffect,
  useState
} from 'react'

import PublishView from '../views/PublishView.jsx'
import { PublishService } from '../services/publishService.js'
import { WorkflowEngine } from '../workflow/workflowEngine.js'

export default function PublishController({
  project,
  onProjectChange,
  onBackToCapCutPackage,
  onBackToDashboard
}) {
  const [draft, setDraft] =
    useState(() =>
      PublishService.createDraft(
        project || {}
      )
    )

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [statusMessage, setStatusMessage] =
    useState('')

  useEffect(() => {
    setDraft(
      PublishService.createDraft(
        project || {}
      )
    )

    setError('')
    setStatusMessage('')
  }, [project?.id])

  function requireProjectChange() {
    if (
      typeof onProjectChange !== 'function'
    ) {
      throw new Error(
        'Publish chưa được nối với project state.'
      )
    }
  }

  function handleFieldChange(
    field,
    value
  ) {
    setDraft(current => ({
      ...current,

      [field]:
        field === 'tags'
          ? String(value)
              .split(',')
              .map(tag => tag.trim())
              .filter(Boolean)
          : value
    }))

    setError('')
    setStatusMessage('')
  }

  function handleChecklistChange(
    field,
    checked
  ) {
    setDraft(current => ({
      ...current,

      checklist: {
        ...current.checklist,
        [field]: checked
      }
    }))

    setError('')
    setStatusMessage('')
  }

  function createSavedProject(
    normalizedDraft,
    extra = {}
  ) {
    return {
      ...project,

      publish: {
        ...normalizedDraft,
        savedAt: Date.now(),
        ...extra
      }
    }
  }

  function handleSaveDraft() {
    try {
      requireProjectChange()
      setLoading(true)

      const normalizedDraft =
        PublishService.normalizeDraft(
          draft
        )

      const nextProject =
        createSavedProject(
          normalizedDraft
        )

      setDraft(nextProject.publish)
      onProjectChange(nextProject)

      setError('')
      setStatusMessage(
        'Publish Draft đã được lưu.'
      )
    } catch (err) {
      setError(
        err?.message ||
          'Không thể lưu Publish Draft.'
      )
    } finally {
      setLoading(false)
    }
  }

  function handleDownloadMetadata() {
    try {
      const normalizedDraft =
        PublishService.normalizeDraft(
          draft
        )

      PublishService.downloadMetadata(
        project,
        normalizedDraft
      )

      setError('')
      setStatusMessage(
        'Đã tải youtube-publish-metadata.json.'
      )
    } catch (err) {
      setError(
        err?.message ||
          'Không thể tải metadata.'
      )
    }
  }

  function handleCompletePublish() {
    try {
      requireProjectChange()
      setLoading(true)

      const normalizedDraft =
        PublishService.normalizeDraft(
          draft
        )

      const validationErrors =
        PublishService.validateDraft(
          normalizedDraft
        )

      if (validationErrors.length > 0) {
        throw new Error(
          validationErrors.join('\n')
        )
      }

      const publishStage =
        project.workflow?.find(
          stage =>
            stage.id === 'publish'
        )

      if (!publishStage) {
        throw new Error(
          'Giai đoạn Publish không tồn tại trong workflow.'
        )
      }

      let nextWorkflow =
        project.workflow

      if (
        publishStage.status === 'active' ||
        publishStage.status === 'available'
      ) {
        const {
          workflow: completedWorkflow,
          error: workflowError
        } = WorkflowEngine.completeStage(
          project.workflow,
          'publish'
        )

        if (workflowError) {
          throw new Error(
            workflowError
          )
        }

        nextWorkflow =
          completedWorkflow
      } else if (
        publishStage.status !==
        'completed'
      ) {
        throw new Error(
          `Không thể hoàn thành Publish khi trạng thái hiện tại là '${publishStage.status}'.`
        )
      }

      const completedAt = Date.now()

      const nextProject = {
        ...createSavedProject(
          normalizedDraft,
          {
            completedAt
          }
        ),

        publishSaved: true,
        publishCompletedAt:
          completedAt,
        workflow: nextWorkflow
      }

      setDraft(nextProject.publish)
      onProjectChange(nextProject)

      setError('')
      setStatusMessage(
        'Publish đã hoàn thành. Toàn bộ workflow đã hoàn tất.'
      )
    } catch (err) {
      setError(
        err?.message ||
          'Không thể hoàn thành Publish.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (!project) {
    return (
      <div className="error-message">
        Không tìm thấy project cho Publish.
      </div>
    )
  }

  return (
    <PublishView
      project={project}
      draft={draft}
      loading={loading}
      error={error}
      statusMessage={statusMessage}
      onFieldChange={
        handleFieldChange
      }
      onChecklistChange={
        handleChecklistChange
      }
      onSaveDraft={
        handleSaveDraft
      }
      onDownloadMetadata={
        handleDownloadMetadata
      }
      onCompletePublish={
        handleCompletePublish
      }
      onBackToCapCutPackage={
        onBackToCapCutPackage
      }
      onBackToDashboard={
        onBackToDashboard
      }
    />
  )
}