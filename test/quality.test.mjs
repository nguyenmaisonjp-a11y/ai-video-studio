import assert from 'node:assert/strict'
import test from 'node:test'

import {
  createQualityProfile,
  normalizeQualityProfile
} from '../src/quality/qualityProfile.js'
import { evaluateQualityGate } from '../src/quality/qualityGate.js'

const project = {
  market: 'Nhật Bản',
  language: 'Tiếng Nhật',
  audience: 'Khán giả Nhật Bản trưởng thành'
}

test('quality profile inherits the project market and audience', () => {
  const profile = createQualityProfile(project)

  assert.equal(profile.market, project.market)
  assert.equal(profile.language, project.language)
  assert.equal(profile.audience, project.audience)
  assert.equal(
    profile.dimensions.reduce((sum, dimension) => sum + dimension.weight, 0),
    100
  )
  assert.ok(profile.hardRules.length > 0)
})

test('legacy projects receive a complete normalized quality profile', () => {
  const profile = normalizeQualityProfile(null, project)

  assert.equal(profile.overallMinimumScore, 80)
  assert.deepEqual(
    profile.checkpoints,
    ['research', 'script', 'storyboard', 'imagePrompt', 'publish']
  )
})

test('quality gate passes when every score meets its threshold', () => {
  const profile = createQualityProfile(project)
  const scores = Object.fromEntries(
    profile.dimensions.map(dimension => [dimension.id, 90])
  )
  const result = evaluateQualityGate(profile, { scores })

  assert.equal(result.passed, true)
  assert.equal(result.status, 'passed')
  assert.equal(result.overallScore, 90)
  assert.deepEqual(result.blockers, [])
})

test('quality gate requests revision for a failed dimension', () => {
  const profile = createQualityProfile(project)
  const scores = Object.fromEntries(
    profile.dimensions.map(dimension => [dimension.id, 90])
  )
  scores.retention = 60

  const result = evaluateQualityGate(profile, { scores })

  assert.equal(result.passed, false)
  assert.equal(result.status, 'revision_required')
  assert.deepEqual(
    result.failedDimensions.map(dimension => dimension.id),
    ['retention']
  )
})

test('a hard-rule violation blocks approval regardless of score', () => {
  const profile = createQualityProfile(project)
  const scores = Object.fromEntries(
    profile.dimensions.map(dimension => [dimension.id, 100])
  )
  const result = evaluateQualityGate(profile, {
    scores,
    violatedRuleIds: ['no-fabricated-facts']
  })

  assert.equal(result.passed, false)
  assert.deepEqual(
    result.blockers.map(rule => rule.id),
    ['no-fabricated-facts']
  )
})
