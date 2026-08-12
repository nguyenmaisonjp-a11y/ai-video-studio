import { WorkflowEngine } from './workflow/workflowEngine.js'
const show = wf => wf.filter(s => ['research','outline','script','humanize','storyboard','voiceScript'].includes(s.id)).map(s => ({id:s.id, status:s.status}))
let wf = WorkflowEngine.createInitialWorkflow()
console.log('initial', show(wf))
let res = WorkflowEngine.completeStage(wf,'research'); console.log('complete research', res.error, show(res.workflow)); wf = res.workflow
res = WorkflowEngine.enterStage(wf,'outline',{}); console.log('enter outline', res.error, show(res.workflow)); wf = res.workflow
res = WorkflowEngine.completeStage(wf,'outline'); console.log('complete outline', res.error, show(res.workflow)); wf = res.workflow
res = WorkflowEngine.enterStage(wf,'script',{}); console.log('enter script', res.error, show(res.workflow)); wf = res.workflow
res = WorkflowEngine.completeStage(wf,'script'); console.log('complete script', res.error, show(res.workflow)); wf = res.workflow
res = WorkflowEngine.enterStage(wf,'humanize',{}); console.log('enter humanize', res.error, show(res.workflow)); wf = res.workflow
res = WorkflowEngine.completeStage(wf,'humanize'); console.log('complete humanize', res.error, show(res.workflow)); wf = res.workflow
res = WorkflowEngine.enterStage(wf,'storyboard',{}); console.log('enter storyboard', res.error, show(res.workflow)); wf = res.workflow
