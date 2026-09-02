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

  const mediaPercent =
    scenes.length > 0
      ? Math.round(
          (availableMediaCount / scenes.length) * 100
        )
      : 0

  return (
    <section className="capcut-package-view">
      <div className="project-info capcut-package-header">
        <h2>
          {project?.topic ||
            'CapCut Package'}
        </h2>

        <div className="meta">
          CapCut Package · Static Image V1
        </div>

        <div className="meta">
          {project?.market || '—'} ·{' '}
          {project?.language || '—'} ·{' '}
          {project?.duration || '—'}
        </div>
      </div>

      <section className="capcut-package-panel capcut-package-summary">
        <div className="capcut-package-summary-heading">
          <div>
            <h3>Package Summary</h3>

            <div className="meta">
              Media sẵn sàng {availableMediaCount}/{scenes.length}
            </div>
          </div>

          <strong className="capcut-package-percent">
            {mediaPercent}%
          </strong>
        </div>

        <div className="progress">
          <div
            className="progress-fill"
            style={{ width: `${mediaPercent}%` }}
          />
        </div>

        <div className="capcut-package-metrics">
          <div>
            <span>Tổng số scene</span>
            <strong>{packageData?.totalScenes || 0}</strong>
          </div>

          <div>
            <span>Tổng thời lượng</span>
            <strong>
              {packageData?.totalDurationSec || 0} giây
            </strong>
          </div>

          <div>
            <span>Media sẵn sàng</span>
            <strong>{availableMediaCount}/{scenes.length}</strong>
          </div>
        </div>
      </section>

      <div className="capcut-package-messages">
        {loading && (
          <div className="meta">Đang chuẩn bị package...</div>
        )}

        {error && (
          <pre className="error-message">{error}</pre>
        )}

        {statusMessage && (
          <div className="saved-status">{statusMessage}</div>
        )}
      </div>

      <section className="capcut-package-panel capcut-package-documents">
        <h3>Package Documents</h3>

        <div className="capcut-package-document-grid">
          <button
            type="button"
            className="capcut-package-document"
            onClick={onDownloadManifest}
            disabled={loading}
          >
            <strong>capcut-manifest.json</strong>
            <span>Thông tin package và scene</span>
          </button>

          <button
            type="button"
            className="capcut-package-document"
            onClick={onDownloadTimeline}
            disabled={loading}
          >
            <strong>capcut-timeline.csv</strong>
            <span>Mốc thời gian dựng video</span>
          </button>

          <button
            type="button"
            className="capcut-package-document"
            onClick={onDownloadNarration}
            disabled={loading}
          >
            <strong>narration.txt</strong>
            <span>Lời đọc theo thứ tự scene</span>
          </button>
        </div>
      </section>

      <section className="capcut-package-panel capcut-package-scenes">
        <h3>Media Files</h3>

        {scenes.length === 0 && (
          <div className="error-message">
            Package chưa có scene.
          </div>
        )}

        {scenes.map(scene => {
          const asset = assetsById[scene.assetId]

          return (
            <article
              key={scene.sceneId}
              className={`capcut-package-scene-card${
                asset ? ' is-ready' : ''
              }`}
            >
              <div className="capcut-package-scene-heading">
                <h4>Scene {scene.sceneNumber}</h4>

                <span
                  className={`capcut-package-status${
                    asset ? ' is-ready' : ''
                  }`}
                >
                  {asset ? 'Media sẵn sàng' : 'Thiếu media'}
                </span>
              </div>

              {asset?.previewUrl ? (
                <figure className="capcut-package-preview">
                  <img
                    src={asset.previewUrl}
                    alt={`Scene ${scene.sceneNumber}`}
                  />
                </figure>
              ) : (
                <div className="capcut-package-empty-preview">
                  Không tìm thấy file media trong Image Library.
                </div>
              )}

              <dl className="capcut-package-details">
                <div>
                  <dt>Loại media</dt>
                  <dd>{scene.mediaType}</dd>
                </div>
                <div>
                  <dt>File nguồn</dt>
                  <dd>{scene.sourceFileName || 'Chưa có'}</dd>
                </div>
                <div>
                  <dt>File trong package</dt>
                  <dd>{scene.outputFileName}</dd>
                </div>
                <div>
                  <dt>Timeline</dt>
                  <dd>{scene.startSec}s → {scene.endSec}s</dd>
                </div>
                <div>
                  <dt>Thời lượng</dt>
                  <dd>{scene.durationSec} giây</dd>
                </div>
              </dl>

              <div className="field-group">
                <label>Narration</label>
                <div className="preview-box">
                  {scene.narration || 'Không có narration.'}
                </div>
              </div>

              <button
                type="button"
                className="btn"
                onClick={() => onDownloadMedia?.(scene)}
                disabled={loading || !asset}
              >
                Tải {scene.outputFileName}
              </button>
            </article>
          )
        })}
      </section>

      <div className="capcut-package-footer brief-actions">
        <button
          type="button"
          className="btn primary"
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
          className="btn ghost"
          onClick={
            onBackToImageLibrary
          }
        >
          Quay lại Image Library
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
