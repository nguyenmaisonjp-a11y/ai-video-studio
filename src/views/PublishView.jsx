export default function PublishView({
  project,
  draft,
  loading = false,
  error = '',
  statusMessage = '',
  onFieldChange,
  onChecklistChange,
  onSaveDraft,
  onDownloadMetadata,
  onCompletePublish,
  onBackToCapCutPackage,
  onBackToDashboard
}) {
  if (!draft) {
    return (
      <p>
        Đang chuẩn bị Publish...
      </p>
    )
  }

  return (
    <section className="stage-view">
      <div className="stage-header">
        <h1>
          {project?.topic || 'Publish'}
        </h1>

        <p>
          Publish · YouTube Metadata V1
        </p>

        <p>
          Chế độ này chuẩn bị dữ liệu xuất bản,
          không tự đăng video lên YouTube.
        </p>
      </div>

      {loading && (
        <p>Đang xử lý...</p>
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

      <div className="card">
        <h2>YouTube Metadata</h2>

        <label>
          <strong>
            Tiêu đề video
          </strong>

          <input
            type="text"
            value={draft.title}
            maxLength={100}
            onChange={event =>
              onFieldChange?.(
                'title',
                event.target.value
              )
            }
            style={{
              display: 'block',
              width: '100%',
              marginTop: '8px',
              marginBottom: '8px'
            }}
          />
        </label>

        <p>
          {draft.title.length}/100 ký tự
        </p>

        <label>
          <strong>
            Mô tả video
          </strong>

          <textarea
            value={draft.description}
            maxLength={5000}
            onChange={event =>
              onFieldChange?.(
                'description',
                event.target.value
              )
            }
            rows={12}
            placeholder="Nhập mô tả video YouTube..."
            style={{
              display: 'block',
              width: '100%',
              marginTop: '8px',
              marginBottom: '8px'
            }}
          />
        </label>

        <p>
          {draft.description.length}/5000 ký tự
        </p>

        <label>
          <strong>
            Tags
          </strong>

          <input
            type="text"
            value={draft.tags.join(', ')}
            onChange={event =>
              onFieldChange?.(
                'tags',
                event.target.value
              )
            }
            placeholder="Japan, documentary, society"
            style={{
              display: 'block',
              width: '100%',
              marginTop: '8px',
              marginBottom: '8px'
            }}
          />
        </label>

        <label>
          <strong>
            Category
          </strong>

          <input
            type="text"
            value={draft.category}
            onChange={event =>
              onFieldChange?.(
                'category',
                event.target.value
              )
            }
            style={{
              display: 'block',
              width: '100%',
              marginTop: '8px',
              marginBottom: '8px'
            }}
          />
        </label>

        <label>
          <strong>
            Privacy
          </strong>

          <select
            value={draft.privacyStatus}
            onChange={event =>
              onFieldChange?.(
                'privacyStatus',
                event.target.value
              )
            }
            style={{
              display: 'block',
              marginTop: '8px',
              marginBottom: '8px'
            }}
          >
            <option value="private">
              Private
            </option>

            <option value="unlisted">
              Unlisted
            </option>

            <option value="public">
              Public
            </option>
          </select>
        </label>
      </div>

      <div className="card">
        <h2>Final Files</h2>

        <label>
          <strong>
            Tên file video cuối
          </strong>

          <input
            type="text"
            value={draft.videoFileName}
            onChange={event =>
              onFieldChange?.(
                'videoFileName',
                event.target.value
              )
            }
            placeholder="final-video.mp4"
            style={{
              display: 'block',
              width: '100%',
              marginTop: '8px',
              marginBottom: '8px'
            }}
          />
        </label>

        <label>
          <strong>
            Tên file thumbnail
          </strong>

          <input
            type="text"
            value={draft.thumbnailFileName}
            onChange={event =>
              onFieldChange?.(
                'thumbnailFileName',
                event.target.value
              )
            }
            placeholder="thumbnail.jpg"
            style={{
              display: 'block',
              width: '100%',
              marginTop: '8px',
              marginBottom: '8px'
            }}
          />
        </label>
      </div>

      <div className="card">
        <h2>Pre-publish Checklist</h2>

        <label>
          <input
            type="checkbox"
            checked={
              draft.checklist.factsReviewed
            }
            onChange={event =>
              onChecklistChange?.(
                'factsReviewed',
                event.target.checked
              )
            }
          />{' '}
          Đã kiểm tra dữ kiện
        </label>

        <br />

        <label>
          <input
            type="checkbox"
            checked={
              draft.checklist.rightsConfirmed
            }
            onChange={event =>
              onChecklistChange?.(
                'rightsConfirmed',
                event.target.checked
              )
            }
          />{' '}
          Đã xác nhận quyền sử dụng nội dung
        </label>

        <br />

        <label>
          <input
            type="checkbox"
            checked={
              draft.checklist.audioReviewed
            }
            onChange={event =>
              onChecklistChange?.(
                'audioReviewed',
                event.target.checked
              )
            }
          />{' '}
          Đã kiểm tra âm thanh
        </label>

        <br />

        <label>
          <input
            type="checkbox"
            checked={
              draft.checklist.visualsReviewed
            }
            onChange={event =>
              onChecklistChange?.(
                'visualsReviewed',
                event.target.checked
              )
            }
          />{' '}
          Đã kiểm tra hình ảnh
        </label>

        <br />

        <label>
          <input
            type="checkbox"
            checked={
              draft.checklist.metadataReviewed
            }
            onChange={event =>
              onChecklistChange?.(
                'metadataReviewed',
                event.target.checked
              )
            }
          />{' '}
          Đã kiểm tra title, description và tags
        </label>
      </div>

      <div className="actions">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={loading}
        >
          Lưu Publish Draft
        </button>

        <button
          type="button"
          onClick={onDownloadMetadata}
          disabled={loading}
        >
          Tải youtube-publish-metadata.json
        </button>

        <button
          type="button"
          className="primary"
          onClick={onCompletePublish}
          disabled={loading}
        >
          Hoàn thành Publish
        </button>

        <button
          type="button"
          onClick={onBackToCapCutPackage}
        >
          Quay lại CapCut Package
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