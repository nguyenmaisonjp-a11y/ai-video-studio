import { useMemo, useState } from 'react'
import { GeminiFlowService } from '../services/geminiFlowService.js'

export default function GeminiFlowView({
  project,
  scenes,
  error,
  onUpdateImageGeneration,
  onCompleteGeminiFlow,
  onBackToImagePrompt,
  onBackToDashboard
}) {
  const [fileNames, setFileNames] = useState(() => {
  const initialFileNames = {}

  scenes.forEach(scene => {
    initialFileNames[scene.sceneId] =
      scene.generations?.image?.fileName || ''
  })

  return initialFileNames
})

const [copyStatus, setCopyStatus] = useState('')

  const progress = useMemo(
    () => GeminiFlowService.getProgress(scenes),
    [scenes]
  )

  async function copyScenePrompt(scene) {
    try {
      const prompt =
        GeminiFlowService.createGeminiPrompt(scene)

      await navigator.clipboard.writeText(prompt)

      setCopyStatus(
        `Đã sao chép prompt của Scene ${scene.sceneNumber}.`
      )
    } catch (err) {
      setCopyStatus(
        err?.message || 'Không thể sao chép prompt.'
      )
    }
  }

  function openGemini() {
    window.open(
      'https://gemini.google.com/app',
      '_blank',
      'noopener,noreferrer'
    )
  }

  function confirmDownloaded(scene) {
    const fileName =
      String(fileNames[scene.sceneId] || '').trim()

    if (!fileName) {
      setCopyStatus(
        `Hãy nhập tên file ảnh của Scene ${scene.sceneNumber}.`
      )
      return
    }

    onUpdateImageGeneration(
      scene.sceneId,
      {
        status: 'downloaded',
        fileName,
        createdAt: Date.now()
      }
    )

    setCopyStatus(
      `Đã ghi nhận ảnh của Scene ${scene.sceneNumber}.`
    )
  }

  return (
    <div className="gemini-flow-view">
      <div className="project-info">
        <h2>{project?.topic || 'Gemini Flow'}</h2>

        <div className="meta">
          Gemini Flow · Static Image V1
        </div>

        <div className="meta">
          {project?.market} • {project?.language} • {project?.duration}
        </div>
      </div>

      <section className="gemini-flow-summary">
        <h3>Image Generation Progress</h3>

        <div className="meta">
          Đã ghi nhận {progress.completed}/{progress.total} ảnh
          · {progress.percent}%
        </div>

        <div className="progress">
          <div
            className="progress-fill"
            style={{
              width: `${progress.percent}%`
            }}
          />
        </div>
      </section>

      {copyStatus && (
        <div className="saved-status">
          {copyStatus}
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

      <section className="gemini-flow-scenes">
        <h3>Scenes</h3>

        {scenes.length === 0 && (
          <div className="error-message">
            Project chưa có Storyboard scene.
          </div>
        )}

        {scenes.map(scene => {
          const image =
            scene.generations?.image || {}

          const completed =
  image.status === 'generated' ||
  image.status === 'downloaded' ||
  image.status === 'imported'

          return (
            <article
              key={scene.sceneId}
              className="gemini-flow-scene-card"
            >
              <h4>
                Scene {scene.sceneNumber}
                {scene.title ? ` — ${scene.title}` : ''}
              </h4>

              <div className="field-group">
                <label>Saved Image Prompt</label>

                <div className="preview-box">
                  {image.prompt ||
                    scene.imagePrompt ||
                    'Chưa có Image Prompt.'}
                </div>
              </div>

              {image.negativePrompt && (
                <div className="field-group">
                  <label>Negative Prompt</label>

                  <div className="preview-box">
                    {image.negativePrompt}
                  </div>
                </div>
              )}

              <div className="meta">
                Aspect ratio: {scene.aspectRatio || '16:9'}
              </div>

              <div className="meta">
                Trạng thái:{' '}
                {completed
                  ? 'Đã tạo ảnh'
                  : 'Chưa tạo ảnh'}
              </div>

              <div className="brief-actions">
                <button
                  className="btn"
                  onClick={() => copyScenePrompt(scene)}
                >
                  Sao chép prompt
                </button>

                <button
                  className="btn"
                  onClick={openGemini}
                >
                  Mở Gemini
                </button>
              </div>

              <div className="field-group">
                <label>Tên file ảnh đã tải</label>

                <input
                  value={fileNames[scene.sceneId] || ''}
                  placeholder={`scene-${String(
                    scene.sceneNumber
                  ).padStart(3, '0')}.png`}
                  onChange={event => {
                    const value = event.target.value

                    setFileNames(previous => ({
                      ...previous,
                      [scene.sceneId]: value
                    }))
                  }}
                />
              </div>

              <button
                className="btn primary"
                onClick={() =>
                  confirmDownloaded(scene)
                }
              >
                Xác nhận đã tải ảnh
              </button>
            </article>
          )
        })}
      </section>

      <div className="brief-actions">
        <button
          className="btn primary"
          disabled={
            progress.total === 0 ||
            progress.completed !== progress.total
          }
          onClick={onCompleteGeminiFlow}
        >
          Hoàn thành Gemini Flow
        </button>

        <button
          className="btn ghost"
          onClick={onBackToImagePrompt}
        >
          Quay lại Image Prompt
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