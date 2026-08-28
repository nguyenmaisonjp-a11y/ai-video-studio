import { useState } from 'react'
import GeminiFlowView from '../views/GeminiFlowView.jsx'
import { GeminiFlowService } from '../services/geminiFlowService.js'
import { WorkflowEngine } from '../workflow/workflowEngine.js'

export default function GeminiFlowController({
  project,
  onProjectChange,
  onBackToImagePrompt,
  onBackToDashboard
}) {
  const [error, setError] = useState('')

  const scenes =
    GeminiFlowService.prepareScenes(project)

  function requireProjectChange() {
    if (typeof onProjectChange !== 'function') {
      throw new Error(
        'Gemini Flow Controller chưa được nối với project state.'
      )
    }
  }

  function handleUpdateImageGeneration(
    sceneId,
    updates
  ) {
    try {
      requireProjectChange()

      const nextScenes =
        GeminiFlowService.updateImageGeneration(
          scenes,
          sceneId,
          updates
        )

      const nextProject = {
        ...project,
        storyboardScenes: nextScenes,
        geminiFlowSaved: false
      }

      onProjectChange(nextProject)
      setError('')
    } catch (err) {
      setError(
        err?.message ||
          'Không thể cập nhật trạng thái ảnh.'
      )
    }
  }

  function handleCompleteGeminiFlow() {
    try {
      requireProjectChange()

      const preparedScenes =
        GeminiFlowService.prepareScenes(project)

      const validationErrors =
        GeminiFlowService.validateCompletion(
          preparedScenes
        )

      if (validationErrors.length > 0) {
        throw new Error(
          validationErrors.join('\n')
        )
      }

      const geminiFlowStage =
        project.workflow?.find(
          stage => stage.id === 'geminiFlow'
        )

      if (!geminiFlowStage) {
        throw new Error(
          'Giai đoạn Gemini Flow không tồn tại trong workflow.'
        )
      }

      let nextWorkflow = project.workflow

      if (
        geminiFlowStage.status === 'active' ||
        geminiFlowStage.status === 'available'
      ) {
        const {
          workflow: completedWorkflow,
          error: workflowError
        } = WorkflowEngine.completeStage(
          project.workflow,
          'geminiFlow'
        )

        if (workflowError) {
          throw new Error(workflowError)
        }

        nextWorkflow = completedWorkflow
      } else if (
        geminiFlowStage.status !== 'completed'
      ) {
        throw new Error(
          `Không thể hoàn thành Gemini Flow khi trạng thái hiện tại là '${geminiFlowStage.status}'.`
        )
      }

      const nextProject = {
        ...project,
        storyboardScenes: preparedScenes,
        geminiFlowSaved: true,
        geminiFlowCompletedAt: Date.now(),
        workflow: nextWorkflow
      }

      onProjectChange(nextProject)
      setError('')
    } catch (err) {
      setError(
        err?.message ||
          'Không thể hoàn thành Gemini Flow.'
      )
    }
  }

  if (!project) {
    return (
      <div className="error-message">
        Không tìm thấy project cho Gemini Flow.
      </div>
    )
  }

  return (
    <GeminiFlowView
      project={project}
      scenes={scenes}
      error={error}
      onUpdateImageGeneration={
        handleUpdateImageGeneration
      }
      onCompleteGeminiFlow={
        handleCompleteGeminiFlow
      }
      onBackToImagePrompt={
        onBackToImagePrompt
      }
      onBackToDashboard={
        onBackToDashboard
      }
    />
  )
}