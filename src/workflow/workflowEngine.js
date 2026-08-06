import { WORKFLOW_STAGES } from './workflowConfig.js'

function cloneWorkflow(workflow) {
  return workflow.map(stage => ({ ...stage }))
}

export const WorkflowEngine = {
  createInitialWorkflow() {
    return WORKFLOW_STAGES.map((stage) => {
      let status = 'locked'
      if (stage.id === 'idea') status = 'completed'
      if (stage.id === 'research') status = 'active'
      return { ...stage, status }
    })
  },

  getStage(workflow, stageId) {
    return workflow.find((stage) => stage.id === stageId) || null
  },

  getCurrentStage(workflow) {
    return workflow.find((stage) => stage.status === 'active') || null
  },

  getPreviousStage(stageId) {
    const stage = WORKFLOW_STAGES.find((item) => item.id === stageId)
    return stage ? stage.previousStage : null
  },

  getNextStage(stageId) {
    const stage = WORKFLOW_STAGES.find((item) => item.id === stageId)
    return stage ? stage.nextStage : null
  },

  getStageStatuses(workflow) {
    return workflow.map((stage) => ({ id: stage.id, status: stage.status }))
  },

  getProgress(workflow) {
    if (!Array.isArray(workflow)) return 0
    const completedCount = workflow.filter((stage) => stage.status === 'completed').length
    return Math.round((completedCount / WORKFLOW_STAGES.length) * 100)
  },

  canEnterStage(workflow, stageId, project) {
    const target = this.getStage(workflow, stageId)
    if (!target) return { ok: false, error: 'Giai đoạn không tồn tại.' }
    if (target.status === 'active' || target.status === 'completed') return { ok: true }
    const prevId = target.previousStage
    if (!prevId) return { ok: true }
    const prev = this.getStage(workflow, prevId)
    if (!prev) return { ok: false, error: 'Giai đoạn trước không tồn tại.' }
    if (prev.status !== 'completed') {
      return { ok: false, error: `Giai đoạn ${target.label} chỉ mở sau khi ${prev.label} hoàn thành.` }
    }
    if (stageId === 'outline') {
      const researchDone = project?.research?.resultSaved && project.research?.result?.trim().length >= 500
      if (!researchDone) {
        return { ok: false, error: 'Outline chỉ mở sau khi Research đã hoàn thành và lưu kết quả.' }
      }
    }
    if (stageId === 'script') {
      const outlineReady = project?.outline?.prompt && project.outline.prompt.trim().length > 0
      if (!outlineReady) {
        return { ok: false, error: 'Script chỉ mở sau khi Outline đã hoàn thành và prompt đã được tạo.' }
      }
    }
    return { ok: true }
  },

  enterStage(workflow, stageId, project) {
    const nextWorkflow = cloneWorkflow(workflow)
    const stage = this.getStage(nextWorkflow, stageId)
    if (!stage) return { workflow: nextWorkflow, error: 'Giai đoạn không tồn tại.' }
    const result = this.canEnterStage(nextWorkflow, stageId, project)
    if (!result.ok) return { workflow: nextWorkflow, error: result.error }
    nextWorkflow.forEach((item) => {
      if (item.id === stageId) {
        if (item.status === 'locked') item.status = 'available'
        if (item.status !== 'completed') item.status = 'active'
      } else if (item.status === 'active') {
        item.status = 'completed'
      }
    })
    return { workflow: nextWorkflow, error: null }
  },

  completeStage(workflow, stageId, output) {
    const nextWorkflow = cloneWorkflow(workflow)
    const stage = this.getStage(nextWorkflow, stageId)
    if (!stage) return { workflow: nextWorkflow, error: 'Giai đoạn không tồn tại.' }
    if (stage.status !== 'active' && stage.status !== 'available') {
      return { workflow: nextWorkflow, error: `Không thể hoàn thành giai đoạn ${stage.label} khi nó chưa mở hoặc không active.` }
    }
    stage.status = 'completed'
    const nextId = stage.nextStage
    if (nextId) {
      const nextStage = this.getStage(nextWorkflow, nextId)
      if (nextStage && nextStage.status === 'locked') {
        nextStage.status = 'available'
      }
    }
    return { workflow: nextWorkflow, error: null }
  },

  reopenStage(workflow, stageId) {
    const nextWorkflow = cloneWorkflow(workflow)
    const stage = this.getStage(nextWorkflow, stageId)
    if (!stage) return { workflow: nextWorkflow, error: 'Giai đoạn không tồn tại.' }
    stage.status = 'available'
    return { workflow: nextWorkflow, error: null }
  }
}
