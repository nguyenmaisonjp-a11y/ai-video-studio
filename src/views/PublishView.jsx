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

  const checklistItems = [
    ['factsReviewed', 'Đã kiểm tra dữ kiện'],
    ['rightsConfirmed', 'Đã xác nhận quyền sử dụng nội dung'],
    ['audioReviewed', 'Đã kiểm tra âm thanh'],
    ['visualsReviewed', 'Đã kiểm tra hình ảnh'],
    ['metadataReviewed', 'Đã kiểm tra title, description và tags']
  ]

  const checkedCount = checklistItems.filter(
    ([key]) => draft.checklist[key]
  ).length

  const checklistPercent = Math.round(
    (checkedCount / checklistItems.length) * 100
  )

  return (
    <section className="publish-view">
      <div className="project-info publish-header">
        <h2>
          {project?.topic || 'Publish'}
        </h2>

        <div className="meta">
          Publish · YouTube Metadata V1
        </div>

        <div className="meta">
          Chế độ này chuẩn bị dữ liệu xuất bản,
          không tự đăng video lên YouTube.
        </div>
      </div>

      <div className="publish-messages">
        {loading && (
          <div className="meta">Đang xử lý...</div>
        )}

        {error && (
          <pre className="error-message">{error}</pre>
        )}

        {statusMessage && (
          <div className="saved-status">{statusMessage}</div>
        )}
      </div>

      <div className="publish-grid">
        <section className="publish-panel publish-metadata-panel">
          <h3>YouTube Metadata</h3>

          <div className="field-group">
            <label htmlFor="publish-title">Tiêu đề video</label>

            <input
              id="publish-title"
              type="text"
              value={draft.title}
              maxLength={100}
              onChange={event =>
                onFieldChange?.('title', event.target.value)
              }
            />

            <div className="publish-char-count">
              {draft.title.length}/100 ký tự
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="publish-description">Mô tả video</label>

            <textarea
              id="publish-description"
              value={draft.description}
              maxLength={5000}
              onChange={event =>
                onFieldChange?.('description', event.target.value)
              }
              rows={12}
              placeholder="Nhập mô tả video YouTube..."
            />

            <div className="publish-char-count">
              {draft.description.length}/5000 ký tự
            </div>
          </div>

          <div className="publish-field-row">
            <div className="field-group">
              <label htmlFor="publish-tags">Tags</label>

              <input
                id="publish-tags"
                type="text"
                value={draft.tags.join(', ')}
                onChange={event =>
                  onFieldChange?.('tags', event.target.value)
                }
                placeholder="Japan, documentary, society"
              />
            </div>

            <div className="field-group">
              <label htmlFor="publish-category">Category</label>

              <input
                id="publish-category"
                type="text"
                value={draft.category}
                onChange={event =>
                  onFieldChange?.('category', event.target.value)
                }
              />
            </div>
          </div>

          <div className="field-group publish-privacy-field">
            <label htmlFor="publish-privacy">Privacy</label>

            <select
              id="publish-privacy"
              value={draft.privacyStatus}
              onChange={event =>
                onFieldChange?.('privacyStatus', event.target.value)
              }
            >
              <option value="private">Private</option>
              <option value="unlisted">Unlisted</option>
              <option value="public">Public</option>
            </select>
          </div>
        </section>

        <div className="publish-side-column">
          <section className="publish-panel">
            <h3>Final Files</h3>

            <div className="field-group">
              <label htmlFor="publish-video-file">Tên file video cuối</label>

              <input
                id="publish-video-file"
                type="text"
                value={draft.videoFileName}
                onChange={event =>
                  onFieldChange?.('videoFileName', event.target.value)
                }
                placeholder="final-video.mp4"
              />
            </div>

            <div className="field-group">
              <label htmlFor="publish-thumbnail-file">Tên file thumbnail</label>

              <input
                id="publish-thumbnail-file"
                type="text"
                value={draft.thumbnailFileName}
                onChange={event =>
                  onFieldChange?.('thumbnailFileName', event.target.value)
                }
                placeholder="thumbnail.jpg"
              />
            </div>
          </section>

          <section className="publish-panel publish-checklist-panel">
            <div className="publish-checklist-heading">
              <div>
                <h3>Pre-publish Checklist</h3>
                <div className="meta">
                  Đã xác nhận {checkedCount}/{checklistItems.length} mục
                </div>
              </div>

              <strong className="publish-checklist-percent">
                {checklistPercent}%
              </strong>
            </div>

            <div className="progress">
              <div
                className="progress-fill"
                style={{ width: `${checklistPercent}%` }}
              />
            </div>

            <div className="publish-checklist">
              {checklistItems.map(([key, label]) => (
                <label key={key}>
                  <input
                    type="checkbox"
                    checked={draft.checklist[key]}
                    onChange={event =>
                      onChecklistChange?.(key, event.target.checked)
                    }
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="publish-footer brief-actions">
        <button
          type="button"
          className="btn"
          onClick={onSaveDraft}
          disabled={loading}
        >
          Lưu Publish Draft
        </button>

        <button
          type="button"
          className="btn"
          onClick={onDownloadMetadata}
          disabled={loading}
        >
          Tải youtube-publish-metadata.json
        </button>

        <button
          type="button"
          className="btn primary"
          onClick={onCompletePublish}
          disabled={loading}
        >
          Hoàn thành Publish
        </button>

        <button
          type="button"
          className="btn ghost"
          onClick={onBackToCapCutPackage}
        >
          Quay lại CapCut Package
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
