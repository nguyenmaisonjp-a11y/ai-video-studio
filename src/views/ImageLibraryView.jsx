export default function ImageLibraryView({
  project,
  scenes = [],
  assetsByScene = {},
  loading = false,
  error = '',
  statusMessage = '',
  onImportImage,
  onCompleteImageLibrary,
  onBackToGeminiFlow,
  onBackToDashboard
}) {
  const importedCount = scenes.filter(
    scene => assetsByScene[scene.sceneId]
  ).length

  const totalScenes = scenes.length

  const percent =
    totalScenes > 0
      ? Math.round(
          (importedCount / totalScenes) * 100
        )
      : 0

  return (
    <section className="image-library-view">
      <div className="project-info image-library-header">
        <h2>{project?.topic || 'Image Library'}</h2>

        <div className="meta">
          Image Library · Static Image V1
        </div>

        <div className="meta">
          {project?.market || '—'} ·{' '}
          {project?.language || '—'} ·{' '}
          {project?.duration || '—'}
        </div>
      </div>

      <section className="image-library-panel image-library-summary">
        <div className="image-library-summary-heading">
          <div>
            <h3>Image Import Progress</h3>

            <div className="meta">
              Đã nhập {importedCount}/{totalScenes} ảnh
            </div>
          </div>

          <strong className="image-library-percent">
            {percent}%
          </strong>
        </div>

        <div className="progress">
          <div
            className="progress-fill"
            style={{
              width: `${percent}%`
            }}
          />
        </div>
      </section>

      <div className="image-library-messages">
        {loading && (
          <div className="meta">Đang đọc kho ảnh...</div>
        )}

        {error && (
          <pre className="error-message">
            {error}
          </pre>
        )}

        {statusMessage && (
          <div className="saved-status">
            {statusMessage}
          </div>
        )}
      </div>

      <section className="image-library-panel image-library-scenes">
        <h3>Scenes</h3>

        {scenes.length === 0 && (
          <div className="error-message">
            Project chưa có scene để nhập ảnh.
          </div>
        )}

        {scenes.map(scene => {
          const asset =
            assetsByScene[scene.sceneId]

          const image =
            scene.generations?.image || {}

          return (
            <article
              key={scene.sceneId}
              className={`image-library-scene-card${
                asset ? ' is-imported' : ''
              }`}
            >
              <div className="image-library-scene-heading">
                <h4>Scene {scene.sceneNumber}</h4>

                <span
                  className={`image-library-status${
                    asset ? ' is-imported' : ''
                  }`}
                >
                  {asset ? 'Đã nhập ảnh' : 'Chưa nhập ảnh'}
                </span>
              </div>

              <div className="field-group">
                <label>Image Prompt</label>

                <div className="preview-box">
                  {image.prompt ||
                    scene.imagePrompt ||
                    'Chưa có Image Prompt.'}
                </div>
              </div>

              <div className="image-library-file-meta">
                <span>File đã xác nhận trong Gemini Flow</span>
                <strong>{image.fileName || 'Chưa có tên file.'}</strong>
              </div>

              {asset?.previewUrl ? (
                <figure className="image-library-preview">
                  <img
                    src={asset.previewUrl}
                    alt={`Scene ${scene.sceneNumber}`}
                  />

                  <figcaption>
                    Ảnh trong thư viện: {asset.fileName}
                  </figcaption>
                </figure>
              ) : (
                <div className="image-library-empty-preview">
                  Chưa nhập file ảnh thật vào thư viện.
                </div>
              )}

              <label className="image-library-picker">
                Chọn ảnh cho Scene {scene.sceneNumber}

                <input
                  type="file"
                  accept="image/*"
                  disabled={loading}
                  onChange={event => {
                    const file =
                      event.target.files?.[0]

                    if (file) {
                      onImportImage?.(
                        scene.sceneId,
                        file
                      )
                    }

                    event.target.value = ''
                  }}
                />
              </label>
            </article>
          )
        })}
      </section>

      <div className="image-library-footer brief-actions">
        <button
          type="button"
          className="btn primary"
          onClick={onCompleteImageLibrary}
          disabled={
            loading ||
            totalScenes === 0 ||
            importedCount !== totalScenes
          }
        >
          Hoàn thành Image Library
        </button>

        <button
          type="button"
          className="btn ghost"
          onClick={onBackToGeminiFlow}
        >
          Quay lại Gemini Flow
        </button>

        <button
          type="button"
          className="btn ghost"
          onClick={onBackToDashboard}
        >
          Về Dashboard
        </button>
      </div>
    </section>
  )
}
