export default function CapCutPackageView({
  project,
  packageData,
  assetsById = {},
  loading = false,
  error = '',
  statusMessage = '',
  onDownloadMedia,
  onDownloadManifest,
  onDownloadTimeline,
  onDownloadNarration,
  onCompleteCapCutPackage,
  onBackToImageLibrary,
  onBackToDashboard
}) {
  const scenes =
    packageData?.scenes || []

  const availableMediaCount =
    scenes.filter(
      scene =>
        assetsById[scene.assetId]
    ).length

  const allMediaAvailable =
    scenes.length > 0 &&
    availableMediaCount ===
      scenes.length

  return (
    <section className="stage-view">
      <div className="stage-header">
        <h1>
          {project?.topic ||
            'CapCut Package'}
        </h1>

        <p>
          CapCut Package · Static Image V1
        </p>

        <p>
          {project?.market || '—'} ·{' '}
          {project?.language || '—'} ·{' '}
          {project?.duration || '—'}
        </p>
      </div>

      <h2>Package Summary</h2>

      <p>
        Tổng số scene:{' '}
        {packageData?.totalScenes || 0}
      </p>

      <p>
        Tổng thời lượng:{' '}
        {packageData?.totalDurationSec || 0}{' '}
        giây
      </p>

      <p>
        Media sẵn sàng:{' '}
        {availableMediaCount}/
        {scenes.length}
      </p>

      {loading && (
        <p>Đang chuẩn bị package...</p>
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

      <h2>Package Documents</h2>

      <div className="actions">
        <button
          type="button"
          onClick={onDownloadManifest}
          disabled={loading}
        >
          Tải capcut-manifest.json
        </button>

        <button
          type="button"
          onClick={onDownloadTimeline}
          disabled={loading}
        >
          Tải capcut-timeline.csv
        </button>

        <button
          type="button"
          onClick={onDownloadNarration}
          disabled={loading}
        >
          Tải narration.txt
        </button>
      </div>

      <h2>Media Files</h2>

      {scenes.map(scene => {
        const asset =
          assetsById[scene.assetId]

        return (
          <article
            key={scene.sceneId}
            className="card"
          >
            <h3>
              Scene {scene.sceneNumber}
            </h3>

            <p>
              <strong>
                Loại media:
              </strong>{' '}
              {scene.mediaType}
            </p>

            <p>
              <strong>
                File nguồn:
              </strong>{' '}
              {scene.sourceFileName ||
                'Chưa có'}
            </p>

            <p>
              <strong>
                Tên file trong package:
              </strong>{' '}
              {scene.outputFileName}
            </p>

            <p>
              <strong>
                Timeline:
              </strong>{' '}
              {scene.startSec}s →{' '}
              {scene.endSec}s
            </p>

            <p>
              <strong>
                Thời lượng:
              </strong>{' '}
              {scene.durationSec} giây
            </p>

            <p>
              <strong>
                Narration:
              </strong>
            </p>

            <p>
              {scene.narration ||
                'Không có narration.'}
            </p>

            {asset?.previewUrl && (
              <img
                src={asset.previewUrl}
                alt={`Scene ${scene.sceneNumber}`}
                style={{
                  display: 'block',
                  width: '100%',
                  maxWidth: '480px',
                  maxHeight: '320px',
                  objectFit: 'contain',
                  marginTop: '12px',
                  marginBottom: '12px',
                  borderRadius: '8px'
                }}
              />
            )}

            <button
              type="button"
              onClick={() =>
                onDownloadMedia?.(
                  scene
                )
              }
              disabled={
                loading || !asset
              }
            >
              Tải {scene.outputFileName}
            </button>

            {!asset && (
              <p className="error-message">
                Không tìm thấy file media trong
                Image Library.
              </p>
            )}
          </article>
        )
      })}

      <div className="actions">
        <button
          type="button"
          className="primary"
          onClick={
            onCompleteCapCutPackage
          }
          disabled={
            loading ||
            !allMediaAvailable
          }
        >
          Hoàn thành CapCut Package
        </button>

        <button
          type="button"
          onClick={
            onBackToImageLibrary
          }
        >
          Quay lại Image Library
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