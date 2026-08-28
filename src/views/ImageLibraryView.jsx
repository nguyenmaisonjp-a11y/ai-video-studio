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
    <section className="stage-view">
      <div className="stage-header">
        <h1>{project?.topic || 'Image Library'}</h1>

        <p>Image Library · Static Image V1</p>

        <p>
          {project?.market || '—'} ·{' '}
          {project?.language || '—'} ·{' '}
          {project?.duration || '—'}
        </p>
      </div>

      <h2>Image Import Progress</h2>

      <p>
        Đã nhập {importedCount}/{totalScenes} ảnh ·{' '}
        {percent}%
      </p>

      <div className="progress">
        <div
          className="progress-fill"
          style={{
            width: `${percent}%`
          }}
        />
      </div>

      {loading && (
        <p>Đang đọc kho ảnh...</p>
      )}

      {error && (
        <pre className="error-message">
          {error}
        </pre>
      )}

      {statusMessage && (
        <p className="success-message">
          {statusMessage}
        </p>
      )}

      <h2>Scenes</h2>

      {scenes.length === 0 && (
        <p>
          Project chưa có scene để nhập ảnh.
        </p>
      )}

      {scenes.map(scene => {
        const asset =
          assetsByScene[scene.sceneId]

        const image =
          scene.generations?.image || {}

        return (
          <article
            key={scene.sceneId}
            className="card"
          >
            <h3>
              Scene {scene.sceneNumber}
            </h3>

            <p>
              <strong>Image Prompt</strong>
            </p>

            <p>
              {image.prompt ||
                scene.imagePrompt ||
                'Chưa có Image Prompt.'}
            </p>

            <p>
              <strong>
                File đã xác nhận trong Gemini Flow
              </strong>
            </p>

            <p>
              {image.fileName ||
                'Chưa có tên file.'}
            </p>

            {asset?.previewUrl ? (
              <div>
                <img
                  src={asset.previewUrl}
                  alt={`Scene ${scene.sceneNumber}`}
                  style={{
                    display: 'block',
                    width: '100%',
                    maxWidth: '720px',
                    maxHeight: '480px',
                    objectFit: 'contain',
                    marginTop: '12px',
                    marginBottom: '12px',
                    borderRadius: '8px'
                  }}
                />

                <p>
                  <strong>Ảnh trong thư viện:</strong>{' '}
                  {asset.fileName}
                </p>
              </div>
            ) : (
              <p>
                Chưa nhập file ảnh thật vào thư viện.
              </p>
            )}

            <label>
              <strong>
                Chọn ảnh cho Scene {scene.sceneNumber}
              </strong>

              <input
                type="file"
                accept="image/*"
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
                style={{
                  display: 'block',
                  marginTop: '8px'
                }}
              />
            </label>
          </article>
        )
      })}

      <div className="actions">
        <button
          type="button"
          className="primary"
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
          onClick={onBackToGeminiFlow}
        >
          Quay lại Gemini Flow
        </button>

        <button
          type="button"
          onClick={onBackToDashboard}
        >
          Về Dashboard
        </button>
      </div>
    </section>
  )
}