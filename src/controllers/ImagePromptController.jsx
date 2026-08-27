import { useState } from 'react'
import ImagePromptView from '../views/ImagePromptView.jsx'
import { ImagePromptService } from '../services/imagePromptService.js'
import { WorkflowEngine } from '../workflow/workflowEngine.js'

export default function ImagePromptController({
  project,
  onProjectChange,
  onBackToStoryboard,
  onBackToDashboard
}) {
  const [error, setError] = useState('')

  function handleSaveImagePrompt(payload) {
    try {
      if (!project) {
        throw new Error('Không tìm thấy project.')
      }

      if (typeof onProjectChange !== 'function') {
        throw new Error(
          'Image Prompt Controller chưa được nối với project state.'
        )
      }

      const storyboardScenes = Array.isArray(
        payload?.storyboardScenes
      )
        ? payload.storyboardScenes
        : project.storyboardScenes || []

      const imagePromptStage = project.workflow?.find(
        stage => stage.id === 'imagePrompt'
      )

      if (!imagePromptStage) {
        throw new Error(
          'Giai đoạn Image Prompt không tồn tại trong workflow.'
        )
      }

      let nextWorkflow = project.workflow

      // Cho phép lưu lại prompt nếu stage đã completed.
      if (
        imagePromptStage.status === 'active' ||
        imagePromptStage.status === 'available'
      ) {
        const {
          workflow: completedWorkflow,
          error: workflowError
        } = WorkflowEngine.completeStage(
          project.workflow,
          'imagePrompt'
        )

        if (workflowError) {
          throw new Error(workflowError)
        }

        nextWorkflow = completedWorkflow
      } else if (imagePromptStage.status !== 'completed') {
        throw new Error(
          `Không thể hoàn thành Image Prompt khi trạng thái hiện tại là '${imagePromptStage.status}'.`
        )
      }

      const nextProject = {
        ...project,

        generatedImagePrompt:
          payload?.generatedPrompt || '',

        rawImagePromptResult:
          payload?.rawResult || '',

        parsedImagePromptResult:
          payload?.parsedResult || null,

        storyboardScenes,

        imagePromptSaved: true,

        workflow: nextWorkflow
      }

      onProjectChange(nextProject)
      setError('')
    } catch (err) {
      setError(
        err?.message ||
          'Không thể lưu Image Prompt vào project.'
      )
    }
  }

  if (!project) {
    return (
      <div className="error-message">
        Không tìm thấy project cho Image Prompt.
      </div>
    )
  }

  return (
    <>
      {error && (
        <div
          className="error-message"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {error}
        </div>
      )}

      <ImagePromptView
        project={project}
        onSaveImagePrompt={handleSaveImagePrompt}
        onBackToStoryboard={onBackToStoryboard}
        onBackToDashboard={onBackToDashboard}
      />
    </>
  )
}