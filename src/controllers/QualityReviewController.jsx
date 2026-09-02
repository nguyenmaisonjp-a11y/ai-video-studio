import { useState } from 'react'

import QualityReviewView from '../views/QualityReviewView.jsx'
import { evaluateQualityGate } from '../quality/qualityGate.js'
import { normalizeQualityProfile } from '../quality/qualityProfile.js'
import { WorkflowEngine } from '../workflow/workflowEngine.js'

function createInitialReview(project, profile) {
  const saved = project?.qualityReview || {}

  return {
    scores: Object.fromEntries(
      profile.dimensions.map(dimension => [
        dimension.id,
        Number(saved.scores?.[dimension.id] || 0)
      ])
    ),
    violatedRuleIds: Array.isArray(saved.violatedRuleIds)
      ? [...saved.violatedRuleIds]
      : [],
    notes: saved.notes || '',
    result: saved.result || null
  }
}

export default function QualityReviewController({
  project,
  onProjectChange,
  onBackToCapCutPackage,
  onBackToDashboard
}) {
  const profile = normalizeQualityProfile(project?.qualityProfile, project)
  const [review, setReview] = useState(() =>
    createInitialReview(project, profile)
  )
  const [error, setError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')

  function requireProjectChange() {
    if (typeof onProjectChange !== 'function') {
      throw new Error('Quality Review chưa được nối với project state.')
    }
  }

  function updateReview(updates) {
    setReview(current => ({ ...current, ...updates, result: null }))
    setError('')
    setStatusMessage('')
  }

  function handleScoreChange(dimensionId, score) {
    updateReview({
      scores: { ...review.scores, [dimensionId]: Number(score) }
    })
  }

  function handleRuleChange(ruleId, violated) {
    const violatedRuleIds = new Set(review.violatedRuleIds)

    if (violated) violatedRuleIds.add(ruleId)
    else violatedRuleIds.delete(ruleId)

    updateReview({ violatedRuleIds: [...violatedRuleIds] })
  }

  function saveReview({ complete = false } = {}) {
    try {
      requireProjectChange()
      const result = evaluateQualityGate(profile, review)

      if (complete && !result.passed) {
        throw new Error(
          'Quality Gate chưa đạt. Hãy xử lý các tiêu chí hoặc vi phạm được hiển thị trước khi hoàn thành.'
        )
      }

      let nextWorkflow = project.workflow

      if (complete) {
        const qualityReviewStage = project.workflow?.find(
          stage => stage.id === 'qualityReview'
        )

        if (!qualityReviewStage) {
          throw new Error(
            'Giai đoạn Quality Review không tồn tại trong workflow.'
          )
        }

        if (
          qualityReviewStage.status === 'active' ||
          qualityReviewStage.status === 'available'
        ) {
          const completion = WorkflowEngine.completeStage(
            project.workflow,
            'qualityReview'
          )
          if (completion.error) throw new Error(completion.error)
          nextWorkflow = completion.workflow
        } else if (qualityReviewStage.status !== 'completed') {
          throw new Error(
            `Không thể hoàn thành Quality Review khi trạng thái hiện tại là '${qualityReviewStage.status}'.`
          )
        }
      }

      const completedAt = complete ? Date.now() : null
      const savedReview = {
        scores: { ...review.scores },
        violatedRuleIds: [...review.violatedRuleIds],
        notes: review.notes,
        result,
        savedAt: Date.now(),
        completedAt
      }

      const nextProject = {
        ...project,
        qualityProfile: profile,
        qualityReview: savedReview,
        qualityReviewSaved: true,
        qualityReviewCompletedAt: completedAt,
        workflow: nextWorkflow
      }

      setReview(savedReview)
      onProjectChange(nextProject)
      setError('')
      setStatusMessage(
        complete
          ? 'Quality Review đã đạt. Publish đã được mở khóa.'
          : result.passed
            ? 'Đã lưu đánh giá. Quality Gate đạt.'
            : 'Đã lưu đánh giá. Cần sửa trước khi hoàn thành.'
      )
    } catch (err) {
      setError(err?.message || 'Không thể lưu Quality Review.')
    }
  }

  if (!project) {
    return <div className="error-message">Không tìm thấy project.</div>
  }

  return (
    <QualityReviewView
      project={project}
      profile={profile}
      review={review}
      error={error}
      statusMessage={statusMessage}
      onScoreChange={handleScoreChange}
      onRuleChange={handleRuleChange}
      onNotesChange={notes => updateReview({ notes })}
      onSaveReview={() => saveReview()}
      onCompleteReview={() => saveReview({ complete: true })}
      onBackToCapCutPackage={onBackToCapCutPackage}
      onBackToDashboard={onBackToDashboard}
    />
  )
}
