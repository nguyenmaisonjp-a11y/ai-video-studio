import { evaluateQualityGate } from '../quality/qualityGate.js'

export default function QualityReviewView({
  project,
  profile,
  review,
  error,
  statusMessage,
  onScoreChange,
  onRuleChange,
  onNotesChange,
  onSaveReview,
  onCompleteReview,
  onBackToCapCutPackage,
  onBackToDashboard
}) {
  const result = evaluateQualityGate(profile, review)

  return (
    <section className="quality-review-view">
      <div className="project-info quality-review-header">
        <h2>{project?.topic || 'Quality Review'}</h2>
        <div className="meta">Quality Review · Production Standard V1</div>
        <div className="meta">
          {profile.market || '—'} · {profile.language || '—'} · {profile.audience || '—'}
        </div>
      </div>

      <section className="quality-review-panel quality-review-summary">
        <div>
          <h3>Quality Gate</h3>
          <div className="meta">Điểm yêu cầu: {profile.overallMinimumScore}/100</div>
        </div>
        <div className={`quality-review-verdict ${result.passed ? 'is-passed' : ''}`}>
          <strong>{result.overallScore}</strong>
          <span>{result.passed ? 'Đạt' : 'Cần sửa'}</span>
        </div>
      </section>

      {(error || statusMessage) && (
        <div className="quality-review-messages">
          {error && <div className="error-message">{error}</div>}
          {statusMessage && <div className="saved-status">{statusMessage}</div>}
        </div>
      )}

      <section className="quality-review-panel">
        <h3>Quality Scores</h3>
        <div className="quality-score-list">
          {profile.dimensions.map(dimension => {
            const score = Number(review.scores[dimension.id] || 0)
            const passed = score >= dimension.minimumScore

            return (
              <div className="quality-score-item" key={dimension.id}>
                <div className="quality-score-heading">
                  <div>
                    <strong>{dimension.label}</strong>
                    <div className="meta">
                      Trọng số {dimension.weight}% · Tối thiểu {dimension.minimumScore}
                    </div>
                  </div>
                  <span className={passed ? 'is-passed' : ''}>{score}/100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={score}
                  aria-label={dimension.label}
                  onChange={event => onScoreChange?.(dimension.id, event.target.value)}
                />
              </div>
            )
          })}
        </div>
      </section>

      <section className="quality-review-panel">
        <h3>Hard-rule Violations</h3>
        <div className="meta">
          Đánh dấu nếu phát hiện vi phạm. Một vi phạm blocker cũng sẽ chặn Publish.
        </div>
        <div className="quality-rule-list">
          {profile.hardRules.map(rule => (
            <label key={rule.id}>
              <input
                type="checkbox"
                checked={review.violatedRuleIds.includes(rule.id)}
                onChange={event => onRuleChange?.(rule.id, event.target.checked)}
              />
              <span>{rule.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="quality-review-panel field-group">
        <label htmlFor="quality-review-notes">Revision Notes</label>
        <textarea
          id="quality-review-notes"
          value={review.notes}
          onChange={event => onNotesChange?.(event.target.value)}
          placeholder="Ghi rõ vấn đề, scene liên quan và yêu cầu AI sửa lại..."
        />
      </section>

      <div className="quality-review-footer brief-actions">
        <button className="btn" type="button" onClick={onSaveReview}>
          Lưu đánh giá
        </button>
        <button
          className="btn primary"
          type="button"
          onClick={onCompleteReview}
          disabled={!result.passed}
        >
          Hoàn thành Quality Review
        </button>
        <button className="btn ghost" type="button" onClick={onBackToCapCutPackage}>
          Quay lại CapCut Package
        </button>
        <button className="btn ghost" type="button" onClick={onBackToDashboard}>
          Về Dashboard
        </button>
      </div>
    </section>
  )
}
