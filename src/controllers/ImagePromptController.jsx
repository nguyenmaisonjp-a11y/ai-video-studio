import { useState } from 'react'
import ImagePromptView from '../views/ImagePromptView.jsx'
import { ImagePromptService } from '../services/imagePromptService.js'

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

      const storyboardScenes = Array.isArray(
        payload?.storyboardScenes
      )
        ? payload.storyboardScenes
        : project.storyboardScenes || []

      const nextProject = {
        ...project,

        generatedImagePrompt:
          payload?.generatedPrompt || '',

        rawImagePromptResult:
          payload?.rawResult || '',

        parsedImagePromptResult:
          payload?.parsedResult || null,

        storyboardScenes,

        imagePromptSaved: true
      }

      if (typeof onProjectChange !== 'function') {
        throw new Error(
          'Image Prompt Controller chưa được nối với project state.'
        )
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