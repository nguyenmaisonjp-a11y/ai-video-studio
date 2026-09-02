function clampScore(value) {
  const score = Number(value)

  if (!Number.isFinite(score)) return 0
  return Math.min(100, Math.max(0, score))
}

export function evaluateQualityGate(profile, review = {}) {
  const dimensions = Array.isArray(profile?.dimensions)
    ? profile.dimensions
    : []

  const scores = review.scores && typeof review.scores === 'object'
    ? review.scores
    : {}

  const dimensionResults = dimensions.map(dimension => {
    const score = clampScore(scores[dimension.id])
    const minimumScore = clampScore(dimension.minimumScore)

    return {
      ...dimension,
      score,
      passed: score >= minimumScore
    }
  })

  const totalWeight = dimensionResults.reduce(
    (sum, dimension) => sum + Number(dimension.weight || 0),
    0
  )

  const overallScore = totalWeight > 0
    ? Math.round(
        dimensionResults.reduce(
          (sum, dimension) =>
            sum + dimension.score * Number(dimension.weight || 0),
          0
        ) / totalWeight
      )
    : 0

  const violatedRuleIds = new Set(
    Array.isArray(review.violatedRuleIds)
      ? review.violatedRuleIds
      : []
  )

  const blockers = (profile?.hardRules || [])
    .filter(rule =>
      rule.severity === 'blocker' && violatedRuleIds.has(rule.id)
    )
    .map(rule => ({ ...rule }))

  const failedDimensions = dimensionResults.filter(
    dimension => !dimension.passed
  )

  const overallMinimumScore = clampScore(
    profile?.overallMinimumScore
  )

  const passed =
    blockers.length === 0 &&
    failedDimensions.length === 0 &&
    overallScore >= overallMinimumScore

  return {
    passed,
    status: passed ? 'passed' : 'revision_required',
    overallScore,
    overallMinimumScore,
    dimensionResults,
    failedDimensions,
    blockers,
    reviewedAt: Date.now()
  }
}
