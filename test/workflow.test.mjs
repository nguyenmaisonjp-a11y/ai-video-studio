import assert from 'node:assert/strict'
import test from 'node:test'

import { WORKFLOW_STAGES } from '../src/workflow/workflowConfig.js'
import { WorkflowEngine } from '../src/workflow/workflowEngine.js'

const EXPECTED_STAGE_IDS = [
  'idea',
  'research',
  'outline',
  'script',
  'humanize',
  'voiceScript',
  'storyboard',
  'imagePrompt',
  'geminiFlow',
  'imageLibrary',
  'capcutPackage',
  'qualityReview',
  'publish'
]

test('workflow stages are displayed in production order', () => {
  assert.deepEqual(
    WORKFLOW_STAGES.map(stage => stage.id),
    EXPECTED_STAGE_IDS
  )

  assert.deepEqual(
    WORKFLOW_STAGES.map(stage => stage.number),
    EXPECTED_STAGE_IDS.map((_, index) => index + 1)
  )
})

test('previous and next stage links are consistent', () => {
  WORKFLOW_STAGES.forEach((stage, index) => {
    assert.equal(
      stage.previousStage,
      EXPECTED_STAGE_IDS[index - 1] || null
    )

    assert.equal(
      stage.nextStage,
      EXPECTED_STAGE_IDS[index + 1] || null
    )
  })
})

test('completing each stage unlocks the next stage through Publish', () => {
  let workflow = WorkflowEngine.createInitialWorkflow()

  assert.equal(
    WorkflowEngine.getStage(workflow, 'idea').status,
    'completed'
  )

  assert.equal(
    WorkflowEngine.getStage(workflow, 'research').status,
    'active'
  )

  for (const stageId of EXPECTED_STAGE_IDS.slice(1)) {
    const result = WorkflowEngine.completeStage(workflow, stageId)

    assert.equal(result.error, null)
    workflow = result.workflow

    assert.equal(
      WorkflowEngine.getStage(workflow, stageId).status,
      'completed'
    )

    const nextStageId = WorkflowEngine.getNextStage(stageId)

    if (nextStageId) {
      assert.equal(
        WorkflowEngine.getStage(workflow, nextStageId).status,
        'available'
      )
    }
  }

  assert.equal(WorkflowEngine.getProgress(workflow), 100)
  assert.equal(WorkflowEngine.getCurrentStage(workflow), null)
})

test('locked stages cannot be completed early', () => {
  const workflow = WorkflowEngine.createInitialWorkflow()
  const result = WorkflowEngine.completeStage(workflow, 'publish')

  assert.match(result.error, /chưa mở|không active/)
  assert.equal(
    WorkflowEngine.getStage(result.workflow, 'publish').status,
    'locked'
  )
})
