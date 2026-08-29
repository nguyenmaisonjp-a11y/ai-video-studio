import { useMemo, useState } from 'react'
import { ImagePromptService } from '../services/imagePromptService.js'
const EMPTY_SCENES = []
export default function ImagePromptView({
  project,
  onSaveImagePrompt,
  onBackToStoryboard,
  onBackToDashboard
}) {
  const scenes = Array.isArray(project?.storyboardScenes)
  ? project.storyboardScenes
  : EMPTY_SCENES

  const [generatedPrompt, setGeneratedPrompt] = useState(
  project?.generatedImagePrompt || ''
)

const [rawResult, setRawResult] = useState(
  project?.rawImagePromptResult || ''
)

const [parsedResult, setParsedResult] = useState(
  project?.parsedImagePromptResult || null
)

const [error, setError] = useState('')
const [copyStatus, setCopyStatus] = useState('')

const [parseStatus, setParseStatus] = useState(
  project?.parsedImagePromptResult?.scenes
    ? `JSON đã lưu. Có ${project.parsedImagePromptResult.scenes.length} scene.`
    : ''
)

const [saveStatus, setSaveStatus] = useState(
  project?.imagePromptSaved
    ? 'Image Prompt đã được lưu.'
    : ''
)


  const summary = useMemo(() => {
    const totalScenes = scenes.length

    const totalDuration = scenes.reduce(
      (sum, scene) => sum + Number(scene.durationSec || 0),
      0
    )

    return {
      totalScenes,
      totalDuration
    }
  }, [scenes])

  function handleGeneratePrompt() {
    try {
      const prompt = ImagePromptService.generatePrompt(project)

      setGeneratedPrompt(prompt)
      setError('')
      setCopyStatus('')
      setSaveStatus('')
    } catch (err) {
      setGeneratedPrompt('')
      setError(err.message || 'Không thể tạo Image Prompt.')
      setCopyStatus('')
      setSaveStatus('')
    }
  }

  async function handleCopyPrompt() {
    if (!generatedPrompt) {
      setError('Chưa có Image Prompt để sao chép.')
      return
    }

    try {
      await navigator.clipboard.writeText(generatedPrompt)
      setCopyStatus('Đã sao chép Image Prompt.')
      setError('')
    } catch {
      setCopyStatus('')
      setError('Không thể sao chép Image Prompt.')
    }
  }

  function handleOpenGemini() {
    window.open(
      'https://gemini.google.com/app',
      '_blank',
      'noopener,noreferrer'
    )
  }

  function handleRawResultChange(value) {
    setRawResult(value)
    setParsedResult(null)
    setParseStatus('')
    setSaveStatus('')
    setError('')
  }

  function handleParseAndValidate() {
    if (!rawResult.trim()) {
      setError('Hãy dán kết quả JSON từ Gemini trước.')
      setParsedResult(null)
      setParseStatus('')
      return
    }

    try {
      const result = ImagePromptService.parseAndValidate(
        rawResult,
        scenes
      )

      if (!result.ok) {
        setParsedResult(null)
        setParseStatus('')
        setSaveStatus('')
        setError(result.errors.join('\n'))
        return
      }

      setParsedResult(result.data)
      setParseStatus(
        `JSON hợp lệ. Đã kiểm tra ${result.data.scenes.length} scene.`
      )
      setSaveStatus('')
      setError('')
    } catch (err) {
      setParsedResult(null)
      setParseStatus('')
      setSaveStatus('')
      setError(
        err.message || 'Không thể phân tích kết quả Image Prompt.'
      )
    }
  }

  function handleSaveImagePrompt() {
    if (!parsedResult) {
      setError('Hãy phân tích và kiểm tra JSON trước khi lưu.')
      setSaveStatus('')
      return
    }

    try {
      const mergedScenes =
        ImagePromptService.mergeIntoStoryboard(
          scenes,
          parsedResult
        )

      if (typeof onSaveImagePrompt !== 'function') {
        throw new Error(
          'Image Prompt View chưa được nối với chức năng lưu project.'
        )
      }

      onSaveImagePrompt({
        generatedPrompt,
        rawResult,
        parsedResult,
        storyboardScenes: mergedScenes
      })

      setSaveStatus(
        `Đã lưu Image Prompt cho ${mergedScenes.length} scene.`
      )

      setError('')
    } catch (err) {
      setSaveStatus('')
      setError(
        err.message || 'Không thể lưu Image Prompt.'
      )
    }
  }

  return (
    <div className="image-prompt-view">
      <div className="project-info">
        <h2>{project?.topic || 'Image Prompt'}</h2>

        <div className="meta">
          Image Prompt stage
        </div>

        <div className="meta">
          {project?.market} • {project?.language} • {project?.duration}
        </div>
      </div>

      <div className="image-prompt-summary">
        <h3>Storyboard Summary</h3>

        <div className="meta">
          Tổng số scene: {summary.totalScenes}
        </div>

        <div className="meta">
          Tổng thời lượng ước tính: {summary.totalDuration} giây
        </div>
      </div>

      <div className="image-prompt-scenes">
        <h3>Storyboard Scenes</h3>

        {scenes.length === 0 && (
          <div className="error-message">
            Chưa có Storyboard scenes.
          </div>
        )}

        {scenes.map((scene) => (
          <div
            key={scene.sceneId || scene.sceneNumber}
            className="image-prompt-scene-card"
          >
            <h4>
              Scene {scene.sceneNumber}
              {scene.title ? ` — ${scene.title}` : ''}
            </h4>

            <div className="field-group">
              <label>Narration</label>

              <div className="preview-box">
                {scene.narration || 'Không có narration.'}
              </div>
            </div>

            <div className="field-group">
              <label>Visual Objective</label>

              <div className="preview-box">
                {scene.visualObjective || 'Không có visualObjective.'}
              </div>
            </div>

            <div className="field-group">
              <label>Duration</label>

              <div className="preview-box">
                {scene.durationSec || 0} giây
              </div>
            </div>

            {scene.imagePrompt && (
              <div className="field-group">
                <label>Saved Image Prompt</label>

                <div className="preview-box">
                  {scene.imagePrompt}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="brief-actions">
        <button
          className="btn new"
          onClick={handleGeneratePrompt}
        >
          Tạo Image Prompt
        </button>

        <button
          className="btn"
          onClick={handleCopyPrompt}
          disabled={!generatedPrompt}
        >
          Sao chép Image Prompt
        </button>

        <button
          className="btn"
          onClick={handleOpenGemini}
        >
          Mở Gemini
        </button>
      </div>

      {copyStatus && (
        <div className="saved-status">
          {copyStatus}
        </div>
      )}

      {generatedPrompt && (
        <div className="field-group">
          <label>Generated Image Prompt</label>

          <textarea
            readOnly
            value={generatedPrompt}
            rows={18}
          />
        </div>
      )}

      <div className="field-group">
        <label>Image Prompt Result từ Gemini</label>

        <textarea
          value={rawResult}
          onChange={(event) =>
            handleRawResultChange(event.target.value)
          }
          placeholder="Dán toàn bộ JSON Image Prompt từ Gemini vào đây..."
          rows={18}
        />
      </div>

      <div className="brief-actions">
        <button
          className="btn primary"
          onClick={handleParseAndValidate}
          disabled={!rawResult.trim()}
        >
          Phân tích & Kiểm tra JSON
        </button>

        <button
          className="btn"
          onClick={handleSaveImagePrompt}
          disabled={!parsedResult}
        >
          Lưu Image Prompt
        </button>
      </div>

      {parseStatus && (
        <div className="saved-status">
          {parseStatus}
        </div>
      )}

      {saveStatus && (
        <div className="saved-status">
          {saveStatus}
        </div>
      )}

      {error && (
        <div
          className="error-message"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {error}
        </div>
      )}

      {parsedResult && (
        <div className="field-group">
          <label>Validated Image Prompt JSON</label>

          <textarea
            readOnly
            value={JSON.stringify(parsedResult, null, 2)}
            rows={20}
          />
        </div>
      )}

      <div className="brief-actions">
        <button
          className="btn ghost"
          onClick={onBackToStoryboard}
        >
          Quay lại Storyboard
        </button>

        <button
          className="btn ghost"
          onClick={onBackToDashboard}
        >
          Về Dashboard
        </button>
      </div>
    </div>
  )
}